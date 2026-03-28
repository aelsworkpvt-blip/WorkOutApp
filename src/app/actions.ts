"use server";

import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { calculateNutritionTargets, calculateVolume, estimateWorkoutCalories } from "@/lib/calculations";
import { demoProfile } from "@/lib/app-fixture";
import { hasUsableDatabaseUrl, requirePrisma } from "@/lib/prisma";
import { clearSession, createSession, requireCurrentViewer } from "@/lib/auth";
import { ensureWorkoutTemplatesSeeded } from "@/lib/workout-template-bootstrap";

type AuthActionResult = {
  success: boolean;
  error?: string;
};

type DeletionActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

type ModeActionResult = {
  success: boolean;
  error?: string;
};

const signupSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

const deleteAccountSchema = z.object({
  confirmation: z.email(),
});

const accountDeletionRequestSchema = z.object({
  email: z.email(),
  reason: z.string().trim().max(500).optional(),
});

const LIVE_TRAINING_MODE = "MUSCLE_GROWTH";
const LIVE_GOAL_TYPE = "MUSCLE_GAIN";

const trainingModeSchema = z.object({
  trainingMode: z.enum([LIVE_TRAINING_MODE]),
});

const onboardingSchema = z.object({
  name: z.string().trim().min(2).max(50),
  age: z.number().int().min(14).max(80),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  heightCm: z.number().min(120).max(240),
  weightKg: z.number().min(35).max(250),
  splitPreference: z.enum(["PPL", "BRO"]),
  goalType: z.literal(LIVE_GOAL_TYPE),
  activityLevel: z.enum(["LIGHT", "MODERATE", "HIGH", "ATHLETE"]),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  targetWeightKg: z.number().min(35).max(250).nullable(),
  chestCm: z.number().min(40).max(200).nullable(),
  waistCm: z.number().min(40).max(200).nullable(),
  hipsCm: z.number().min(40).max(220).nullable(),
  armCm: z.number().min(15).max(80).nullable(),
  thighCm: z.number().min(20).max(120).nullable(),
  calfCm: z.number().min(15).max(80).nullable(),
  bodyFatPct: z.number().min(3).max(50).nullable(),
});

const measurementSchema = z.object({
  weightKg: z.number().min(35).max(250),
  chestCm: z.number().min(40).max(200).nullable(),
  waistCm: z.number().min(40).max(200).nullable(),
  hipsCm: z.number().min(40).max(220).nullable(),
  armCm: z.number().min(15).max(80).nullable(),
  thighCm: z.number().min(20).max(120).nullable(),
  calfCm: z.number().min(15).max(80).nullable(),
  bodyFatPct: z.number().min(3).max(50).nullable(),
});

const workoutLogSchema = z.object({
  dayTemplateId: z.string().min(1),
  exerciseTemplateId: z.string().min(1),
  setsCompleted: z.number().int().min(1).max(12),
  repsCompleted: z.number().int().min(1).max(30),
  weightKg: z.number().min(0).max(400),
  notes: z.string().trim().max(140).optional(),
});

const updateExerciseLogSchema = z.object({
  logId: z.string().min(1),
  setsCompleted: z.number().int().min(1).max(12),
  repsCompleted: z.number().int().min(1).max(30),
  weightKg: z.number().min(0).max(400),
  notes: z.string().trim().max(140).nullable(),
});

const deleteExerciseLogSchema = z.object({
  logId: z.string().min(1),
});

function requiredString(value: FormDataEntryValue | null) {
  return `${value ?? ""}`.trim();
}

function requiredNumber(value: FormDataEntryValue | null) {
  if (value === null) {
    return Number.NaN;
  }

  const normalized = `${value}`.trim();
  return normalized ? Number(normalized) : Number.NaN;
}

function optionalString(value: FormDataEntryValue | null) {
  const normalized = `${value ?? ""}`.trim();
  return normalized || undefined;
}

function nullableNumber(value: FormDataEntryValue | null) {
  if (value === null) {
    return null;
  }

  const normalized = `${value}`.trim();

  if (!normalized) {
    return null;
  }

  return Number(normalized);
}

async function refreshNutritionTarget(userId: string) {
  const db = requirePrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { goal: true },
  });

  if (
    !user ||
    !user.goal ||
    user.age === null ||
    user.gender === null ||
    user.heightCm === null ||
    user.currentWeightKg === null
  ) {
    return;
  }

  const nutrition = calculateNutritionTargets({
    age: user.age,
    gender: user.gender,
    heightCm: user.heightCm,
    weightKg: user.currentWeightKg,
    activityLevel: user.goal.activityLevel,
    goalType: LIVE_GOAL_TYPE,
  });

  await db.nutritionTarget.upsert({
    where: { userId },
    update: nutrition,
    create: {
      userId,
      ...nutrition,
    },
  });
}

async function requireSessionUser() {
  const viewer = await requireCurrentViewer();

  if (!viewer.email) {
    throw new Error("Account email missing.");
  }

  return {
    ...viewer,
    email: viewer.email,
  };
}

function revalidateWorkoutViews() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/workouts");
  revalidatePath("/progress");
  revalidatePath("/profile");
  revalidatePath("/streak");
}

async function refreshWorkoutSessionAggregates(
  db: PrismaClient,
  sessionId: string,
  bodyWeightKg: number,
) {
  const exerciseLogs = await db.exerciseLog.findMany({
    where: { sessionId },
  });

  if (exerciseLogs.length === 0) {
    await db.workoutSession.delete({
      where: { id: sessionId },
    });
    return;
  }

  const totalVolumeKg = exerciseLogs.reduce(
    (total, log) =>
      total +
      calculateVolume({
        setsCompleted: log.setsCompleted,
        repsCompleted: log.repsCompleted,
        weightKg: log.weightKg,
      }),
    0,
  );
  const durationMin = Math.max(35, exerciseLogs.length * 11);
  const estimatedCaloriesBurned = estimateWorkoutCalories({
    bodyWeightKg,
    durationMin,
  });

  await db.workoutSession.update({
    where: { id: sessionId },
    data: {
      durationMin,
      totalVolumeKg,
      estimatedCaloriesBurned,
    },
  });
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  if (!hasUsableDatabaseUrl) {
    return {
      success: false,
      error: "Database is not configured.",
    };
  }

  const parsed = signupSchema.safeParse({
    name: requiredString(formData.get("name")),
    email: requiredString(formData.get("email")).toLowerCase(),
    password: requiredString(formData.get("password")),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Enter a valid name, email, and password.",
    };
  }

  const db = requirePrisma();
  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "That email is already in use.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      onboardingComplete: false,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await createSession({
    userId: user.id,
    email: user.email!,
  });

  revalidatePath("/");
  return { success: true };
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  if (!hasUsableDatabaseUrl) {
    return {
      success: false,
      error: "Database is not configured.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: requiredString(formData.get("email")).toLowerCase(),
    password: requiredString(formData.get("password")),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Enter a valid email and password.",
    };
  }

  const db = requirePrisma();
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return {
      success: false,
      error: "Account not found.",
    };
  }

  const isValidPassword = await compare(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    return {
      success: false,
      error: "Email or password is incorrect.",
    };
  }

  await createSession({
    userId: user.id,
    email: user.email!,
  });

  revalidatePath("/");
  return { success: true };
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/");
}

export async function deleteAccountAction(
  formData: FormData,
): Promise<DeletionActionResult> {
  if (!hasUsableDatabaseUrl) {
    return {
      success: false,
      error: "Database is not configured.",
    };
  }

  const viewer = await requireSessionUser();
  const parsed = deleteAccountSchema.safeParse({
    confirmation: requiredString(formData.get("confirmation")).toLowerCase(),
  });

  if (!parsed.success || parsed.data.confirmation !== viewer.email.toLowerCase()) {
    return {
      success: false,
      error: "Type your account email exactly to confirm deletion.",
    };
  }

  try {
    const db = requirePrisma();
    await db.$transaction(async (tx) => {
      await tx.accountDeletionRequest.create({
        data: {
          email: viewer.email,
          userId: viewer.id,
          reason: "User requested immediate in-app account deletion.",
          status: "COMPLETED",
          resolvedAt: new Date(),
        },
      });

      await tx.user.delete({
        where: { id: viewer.id },
      });
    });

    await clearSession();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Unable to delete account", error);
    return {
      success: false,
      error: "Unable to delete this account right now.",
    };
  }
}

export async function requestAccountDeletionAction(
  formData: FormData,
): Promise<DeletionActionResult> {
  if (!hasUsableDatabaseUrl) {
    return {
      success: false,
      error: "Database is not configured.",
    };
  }

  const parsed = accountDeletionRequestSchema.safeParse({
    email: requiredString(formData.get("email")).toLowerCase(),
    reason: optionalString(formData.get("reason")),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Enter a valid email address before sending the request.",
    };
  }

  try {
    const db = requirePrisma();
    const existingPendingRequest = await db.accountDeletionRequest.findFirst({
      where: {
        email: parsed.data.email,
        status: "PENDING",
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    if (!existingPendingRequest) {
      await db.accountDeletionRequest.create({
        data: {
          email: parsed.data.email,
          reason: parsed.data.reason,
        },
      });
    }

    return {
      success: true,
      message:
        "If an account matches that email address, the deletion request has been received. If you can still sign in, you can also delete instantly from the profile page.",
    };
  } catch (error) {
    console.error("Unable to record account deletion request", error);
    return {
      success: false,
      error: "Unable to record that request right now.",
    };
  }
}

export async function dismissWelcomeCarouselAction() {
  if (!hasUsableDatabaseUrl) {
    revalidatePath("/");
    return;
  }

  const viewer = await requireSessionUser();
  const db = requirePrisma();

  await db.user.update({
    where: { id: viewer.id },
    data: {
      hasSeenWelcomeCarousel: true,
    },
  });

  revalidatePath("/", "layout");
}

export async function selectTrainingModeAction(
  formData: FormData,
): Promise<ModeActionResult> {
  if (!hasUsableDatabaseUrl) {
    return {
      success: false,
      error: "Database is not configured.",
    };
  }

  const parsed = trainingModeSchema.safeParse({
    trainingMode: requiredString(formData.get("trainingMode")),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Only Muscle Growth is live right now.",
    };
  }

  const viewer = await requireSessionUser();
  const db = requirePrisma();

  await db.user.update({
    where: { id: viewer.id },
    data: {
      trainingMode: parsed.data.trainingMode,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function saveOnboardingAction(formData: FormData) {
  if (!hasUsableDatabaseUrl) {
    revalidatePath("/");
    return;
  }

  const parsed = onboardingSchema.safeParse({
    name: requiredString(formData.get("name")),
    age: requiredNumber(formData.get("age")),
    gender: requiredString(formData.get("gender")),
    heightCm: requiredNumber(formData.get("heightCm")),
    weightKg: requiredNumber(formData.get("weightKg")),
    splitPreference: requiredString(formData.get("splitPreference")),
    goalType: LIVE_GOAL_TYPE,
    activityLevel: requiredString(formData.get("activityLevel")),
    experienceLevel: requiredString(formData.get("experienceLevel")),
    targetWeightKg: nullableNumber(formData.get("targetWeightKg")),
    chestCm: nullableNumber(formData.get("chestCm")),
    waistCm: nullableNumber(formData.get("waistCm")),
    hipsCm: nullableNumber(formData.get("hipsCm")),
    armCm: nullableNumber(formData.get("armCm")),
    thighCm: nullableNumber(formData.get("thighCm")),
    calfCm: nullableNumber(formData.get("calfCm")),
    bodyFatPct: nullableNumber(formData.get("bodyFatPct")),
  });

  if (!parsed.success) {
    console.error("Invalid onboarding payload", parsed.error.flatten());
    throw new Error("Invalid onboarding data.");
  }

  const payload = parsed.data;

  const user = await requireSessionUser();
  const db = requirePrisma();

  await ensureWorkoutTemplatesSeeded(db);

  await db.user.update({
    where: { id: user.id },
    data: {
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      heightCm: payload.heightCm,
      currentWeightKg: payload.weightKg,
      splitPreference: payload.splitPreference,
      onboardingComplete: true,
    },
  });

  await db.userGoal.upsert({
    where: { userId: user.id },
    update: {
      goalType: payload.goalType,
      activityLevel: payload.activityLevel,
      experienceLevel: payload.experienceLevel,
      targetWeightKg: payload.targetWeightKg,
    },
    create: {
      userId: user.id,
      goalType: payload.goalType,
      activityLevel: payload.activityLevel,
      experienceLevel: payload.experienceLevel,
      targetWeightKg: payload.targetWeightKg,
    },
  });

  await db.measurementEntry.create({
    data: {
      userId: user.id,
      weightKg: payload.weightKg,
      chestCm: payload.chestCm,
      waistCm: payload.waistCm,
      hipsCm: payload.hipsCm,
      armCm: payload.armCm,
      thighCm: payload.thighCm,
      calfCm: payload.calfCm,
      bodyFatPct: payload.bodyFatPct,
    },
  });

  await refreshNutritionTarget(user.id);
  revalidatePath("/");
}

export async function saveMeasurementEntryAction(formData: FormData) {
  if (!hasUsableDatabaseUrl) {
    revalidatePath("/");
    return;
  }

  const parsed = measurementSchema.safeParse({
    weightKg: requiredNumber(formData.get("weightKg")),
    chestCm: nullableNumber(formData.get("chestCm")),
    waistCm: nullableNumber(formData.get("waistCm")),
    hipsCm: nullableNumber(formData.get("hipsCm")),
    armCm: nullableNumber(formData.get("armCm")),
    thighCm: nullableNumber(formData.get("thighCm")),
    calfCm: nullableNumber(formData.get("calfCm")),
    bodyFatPct: nullableNumber(formData.get("bodyFatPct")),
  });

  if (!parsed.success) {
    console.error("Invalid measurement payload", parsed.error.flatten());
    throw new Error("Invalid measurement data.");
  }

  const payload = parsed.data;

  const user = await requireSessionUser();
  const db = requirePrisma();

  await db.measurementEntry.create({
    data: {
      userId: user.id,
      weightKg: payload.weightKg,
      chestCm: payload.chestCm,
      waistCm: payload.waistCm,
      hipsCm: payload.hipsCm,
      armCm: payload.armCm,
      thighCm: payload.thighCm,
      calfCm: payload.calfCm,
      bodyFatPct: payload.bodyFatPct,
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: {
      currentWeightKg: payload.weightKg,
    },
  });

  await refreshNutritionTarget(user.id);
  revalidatePath("/");
}

export async function logWorkoutAction(formData: FormData) {
  if (!hasUsableDatabaseUrl) {
    revalidatePath("/");
    return;
  }

  const parsed = workoutLogSchema.safeParse({
    dayTemplateId: requiredString(formData.get("dayTemplateId")),
    exerciseTemplateId: requiredString(formData.get("exerciseTemplateId")),
    setsCompleted: requiredNumber(formData.get("setsCompleted")),
    repsCompleted: requiredNumber(formData.get("repsCompleted")),
    weightKg: requiredNumber(formData.get("weightKg")),
    notes: requiredString(formData.get("notes")) || undefined,
  });

  if (!parsed.success) {
    console.error("Invalid workout payload", parsed.error.flatten());
    throw new Error("Invalid workout log data.");
  }

  const payload = parsed.data;

  const viewer = await requireSessionUser();
  const db = requirePrisma();
  const user = await db.user.findUnique({
    where: { id: viewer.id },
    select: {
      id: true,
      currentWeightKg: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  let session = await db.workoutSession.findFirst({
    where: {
      userId: viewer.id,
      dayTemplateId: payload.dayTemplateId,
      performedAt: {
        gte: startOfToday,
        lt: endOfToday,
      },
    },
  });

  if (!session) {
    session = await db.workoutSession.create({
      data: {
        userId: viewer.id,
        dayTemplateId: payload.dayTemplateId,
        durationMin: 30,
        estimatedCaloriesBurned: 0,
        totalVolumeKg: 0,
      },
    });
  }

  await db.exerciseLog.create({
    data: {
      sessionId: session.id,
      exerciseTemplateId: payload.exerciseTemplateId,
      setsCompleted: payload.setsCompleted,
      repsCompleted: payload.repsCompleted,
      weightKg: payload.weightKg,
      achievedMaxKg: payload.weightKg,
      notes: payload.notes,
    },
  });

  await refreshWorkoutSessionAggregates(
    db,
    session.id,
    user.currentWeightKg ?? demoProfile.currentWeightKg,
  );

  revalidateWorkoutViews();
}

export async function updateExerciseLogAction(formData: FormData) {
  if (!hasUsableDatabaseUrl) {
    revalidateWorkoutViews();
    return;
  }

  const parsed = updateExerciseLogSchema.safeParse({
    logId: requiredString(formData.get("logId")),
    setsCompleted: requiredNumber(formData.get("setsCompleted")),
    repsCompleted: requiredNumber(formData.get("repsCompleted")),
    weightKg: requiredNumber(formData.get("weightKg")),
    notes: requiredString(formData.get("notes")) || null,
  });

  if (!parsed.success) {
    console.error("Invalid exercise log update payload", parsed.error.flatten());
    throw new Error("Invalid exercise log update.");
  }

  const viewer = await requireSessionUser();
  const db = requirePrisma();

  const [user, existingLog] = await Promise.all([
    db.user.findUnique({
      where: { id: viewer.id },
      select: {
        currentWeightKg: true,
      },
    }),
    db.exerciseLog.findUnique({
      where: { id: parsed.data.logId },
      select: {
        id: true,
        sessionId: true,
        session: {
          select: {
            userId: true,
          },
        },
      },
    }),
  ]);

  if (!existingLog || existingLog.session.userId !== viewer.id) {
    throw new Error("Exercise log not found.");
  }

  await db.exerciseLog.update({
    where: { id: existingLog.id },
    data: {
      setsCompleted: parsed.data.setsCompleted,
      repsCompleted: parsed.data.repsCompleted,
      weightKg: parsed.data.weightKg,
      achievedMaxKg: parsed.data.weightKg,
      notes: parsed.data.notes,
    },
  });

  await refreshWorkoutSessionAggregates(
    db,
    existingLog.sessionId,
    user?.currentWeightKg ?? demoProfile.currentWeightKg,
  );

  revalidateWorkoutViews();
}

export async function deleteExerciseLogAction(formData: FormData) {
  if (!hasUsableDatabaseUrl) {
    revalidateWorkoutViews();
    return;
  }

  const parsed = deleteExerciseLogSchema.safeParse({
    logId: requiredString(formData.get("logId")),
  });

  if (!parsed.success) {
    console.error("Invalid exercise log delete payload", parsed.error.flatten());
    throw new Error("Invalid exercise log delete.");
  }

  const viewer = await requireSessionUser();
  const db = requirePrisma();
  const user = await db.user.findUnique({
    where: { id: viewer.id },
    select: {
      currentWeightKg: true,
    },
  });
  const existingLog = await db.exerciseLog.findUnique({
    where: { id: parsed.data.logId },
    select: {
      id: true,
      sessionId: true,
      session: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!existingLog || existingLog.session.userId !== viewer.id) {
    throw new Error("Exercise log not found.");
  }

  await db.exerciseLog.delete({
    where: { id: existingLog.id },
  });

  await refreshWorkoutSessionAggregates(
    db,
    existingLog.sessionId,
    user?.currentWeightKg ?? demoProfile.currentWeightKg,
  );

  revalidateWorkoutViews();
}
