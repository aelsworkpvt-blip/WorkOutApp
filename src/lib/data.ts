import { format, startOfWeek, subDays } from "date-fns";
import { getCurrentViewer } from "@/lib/auth";
import { calculateNutritionTargets, calculateVolume, formatCompactNumber, formatSigned, getProgressSuggestion } from "@/lib/calculations";
import { demoGoal, demoMeasurements, demoProfile, demoSessionBlueprints, demoWeeklyDigests } from "@/lib/app-fixture";
import { hasUsableDatabaseUrl, requirePrisma } from "@/lib/prisma";
import { workoutTemplates } from "@/lib/workout-templates";
import { ensureWorkoutTemplatesSeeded } from "@/lib/workout-template-bootstrap";

type RawExercise = {
  id: string;
  slug: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: string;
  progressCue: string;
  targetSets: number;
  repRangeMin: number;
  repRangeMax: number;
  restSeconds: number;
  order: number;
};

type RawDayTemplate = {
  id: string;
  slug: string;
  name: string;
  focus: string;
  accent: string;
  description: string;
  estimatedMinutes: number;
  order: number;
  exercises: RawExercise[];
};

type RawExerciseLog = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: number;
  weightKg: number;
  achievedMaxKg: number | null;
  notes?: string | null;
};

type RawSession = {
  id: string;
  dayTemplateId: string;
  dayName: string;
  performedAt: Date;
  durationMin: number;
  estimatedCaloriesBurned: number;
  totalVolumeKg: number;
  exerciseLogs: RawExerciseLog[];
};

type RawMeasurement = {
  recordedAt: Date;
  weightKg: number;
  waistCm: number | null;
  armCm: number | null;
  chestCm: number | null;
  bodyFatPct: number | null;
};

type RawDigest = {
  weekStart: Date;
  workoutsCompleted: number;
  workoutTarget: number;
  totalVolumeKg: number;
  averageCaloriesBurned: number;
  highlight: string;
  focusForNextWeek: string;
};

type RawDataset = {
  user: {
    id: string;
    name: string;
    age: number;
    gender: "MALE" | "FEMALE" | "OTHER";
    heightCm: number;
    currentWeightKg: number;
    splitPreference: "PPL" | "BRO";
  };
  goal: {
    goalType: "FAT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "PERFORMANCE";
    activityLevel: "LIGHT" | "MODERATE" | "HIGH" | "ATHLETE";
    experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    targetWeightKg: number | null;
    notes: string | null;
    weeklyWorkoutTarget: number;
  };
  nutrition: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    hydrationLiters: number;
  };
  dayTemplates: RawDayTemplate[];
  sessions: RawSession[];
  measurements: RawMeasurement[];
  digests: RawDigest[];
};

export type ViewerState = {
  id: string;
  email: string | null;
  name: string | null;
  onboardingComplete: boolean;
  hasSeenWelcomeCarousel: boolean;
  trainingMode: "MUSCLE_GROWTH" | "FAT_LOSS" | "BODY_RECOMPOSITION" | null;
  splitPreference: "PPL" | "BRO" | null;
};

export type OnboardingDefaults = {
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  heightCm: number;
  weightKg: number;
  goalType: "FAT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "PERFORMANCE";
  activityLevel: "LIGHT" | "MODERATE" | "HIGH" | "ATHLETE";
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  targetWeightKg: number | null;
};

export type DashboardSnapshot = {
  isDemoMode: boolean;
  profile: RawDataset["user"] & RawDataset["goal"];
  nutrition: RawDataset["nutrition"];
  planDays: Array<{
    id: string;
    slug: string;
    name: string;
    focus: string;
    accent: string;
    estimatedMinutes: number;
    exerciseCount: number;
    isSelected: boolean;
  }>;
  workoutPlans: Array<{
    id: string;
    slug: string;
    name: string;
    focus: string;
    accent: string;
    description: string;
    estimatedMinutes: number;
    exerciseCount: number;
    exercises: Array<{
      id: string;
      name: string;
      equipment: string;
      muscleGroup: string;
      targetSets: number;
      repRangeLabel: string;
      restSeconds: number;
      progressCue: string;
      suggestedWeightKg?: number;
      suggestedReps?: number;
      suggestionLabel?: string;
      lastLog?: {
        performedAtLabel: string;
        setsCompleted: number;
        repsCompleted: number;
        weightKg: number;
        achievedMaxKg: number | null;
      };
    }>;
  }>;
  todayPlan: {
    id: string;
    slug: string;
    name: string;
    focus: string;
    accent: string;
    description: string;
    estimatedMinutes: number;
    exerciseCount: number;
    exercises: Array<{
      id: string;
      name: string;
      equipment: string;
      muscleGroup: string;
      targetSets: number;
      repRangeLabel: string;
      restSeconds: number;
      progressCue: string;
      suggestedWeightKg?: number;
      suggestedReps?: number;
      suggestionLabel?: string;
      lastLog?: {
        performedAtLabel: string;
        setsCompleted: number;
        repsCompleted: number;
        weightKg: number;
        achievedMaxKg: number | null;
      };
    }>;
  };
  completion: {
    workoutsCompleted: number;
    workoutTarget: number;
    percent: number;
    streak: number;
    weeklyVolumeKg: number;
    weeklyCaloriesBurned: number;
  };
  heroStats: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  recentMeasurements: Array<{
    label: string;
    weight: number;
    waist: number | null;
    arm: number | null;
  }>;
  strengthTrend: Array<{
    label: string;
    volume: number;
    topSet: number;
  }>;
  recentSessions: Array<{
    id: string;
    label: string;
    dayName: string;
    calories: number;
    volume: number;
  }>;
  weeklyDigest: {
    weekLabel: string;
    workoutsCompleted: number;
    workoutTarget: number;
    totalVolumeKg: number;
    averageCaloriesBurned: number;
    highlight: string;
    focusForNextWeek: string;
  };
  insights: string[];
};

function buildDemoDataset(): RawDataset {
  const selectedTemplates = workoutTemplates[demoProfile.splitPreference].map(
    (day, dayIndex) => ({
      id: day.slug,
      slug: day.slug,
      name: day.name,
      focus: day.focus,
      accent: day.accent,
      description: day.description,
      estimatedMinutes: day.estimatedMinutes,
      order: dayIndex,
      exercises: day.exercises.map((exercise, exerciseIndex) => ({
        id: `${day.slug}-${exercise.slug}`,
        slug: exercise.slug,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        instructions: exercise.instructions,
        progressCue: exercise.progressCue,
        targetSets: exercise.targetSets,
        repRangeMin: exercise.repRangeMin,
        repRangeMax: exercise.repRangeMax,
        restSeconds: exercise.restSeconds,
        order: exerciseIndex,
      })),
    }),
  );

  const nutrition = calculateNutritionTargets({
    age: demoProfile.age,
    gender: demoProfile.gender,
    heightCm: demoProfile.heightCm,
    weightKg: demoProfile.currentWeightKg,
    activityLevel: demoGoal.activityLevel,
    goalType: demoGoal.goalType,
  });

  const sessions = demoSessionBlueprints.map((session, sessionIndex) => {
    const dayTemplate = selectedTemplates.find((day) => day.slug === session.daySlug)!;

    return {
      id: `session-${sessionIndex + 1}`,
      dayTemplateId: dayTemplate.id,
      dayName: dayTemplate.name,
      performedAt: new Date(session.performedAt),
      durationMin: session.durationMin,
      estimatedCaloriesBurned: Math.round(session.durationMin * 7.2),
      totalVolumeKg: session.logs.reduce(
        (total, log) =>
          total +
          calculateVolume({
            setsCompleted: log.setsCompleted,
            repsCompleted: log.repsCompleted,
            weightKg: log.weightKg,
          }),
        0,
      ),
      exerciseLogs: session.logs.map((log, logIndex) => {
        const exercise = dayTemplate.exercises.find(
          (entry) => entry.slug === log.exerciseSlug,
        )!;

        return {
          id: `log-${sessionIndex + 1}-${logIndex + 1}`,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          setsCompleted: log.setsCompleted,
          repsCompleted: log.repsCompleted,
          weightKg: log.weightKg,
          achievedMaxKg: log.achievedMaxKg ?? null,
        };
      }),
    };
  });

  return {
    user: {
      id: "demo-user",
      ...demoProfile,
    },
    goal: demoGoal,
    nutrition,
    dayTemplates: selectedTemplates,
    measurements: demoMeasurements.map((entry) => ({
      recordedAt: new Date(entry.recordedAt),
      weightKg: entry.weightKg,
      waistCm: entry.waistCm ?? null,
      armCm: entry.armCm ?? null,
      chestCm: entry.chestCm ?? null,
      bodyFatPct: entry.bodyFatPct ?? null,
    })),
    sessions,
    digests: demoWeeklyDigests.map((digest) => ({
      ...digest,
      weekStart: new Date(digest.weekStart),
    })),
  };
}

async function buildDatabaseDataset(userId: string): Promise<RawDataset | null> {
  if (!hasUsableDatabaseUrl) {
    return null;
  }

  try {
    const db = requirePrisma();
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        goal: true,
        nutritionTarget: true,
        measurements: {
          orderBy: { recordedAt: "asc" },
        },
        weeklyDigests: {
          orderBy: { weekStart: "desc" },
          take: 4,
        },
      },
    });

    if (
      !user ||
      !user.goal ||
      !user.name ||
      !user.age ||
      !user.gender ||
      !user.heightCm ||
      !user.currentWeightKg ||
      !user.splitPreference
    ) {
      return null;
    }

    let dayTemplates = await db.workoutDayTemplate.findMany({
      where: { splitType: user.splitPreference },
      orderBy: { order: "asc" },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (dayTemplates.length === 0) {
      await ensureWorkoutTemplatesSeeded(db);

      dayTemplates = await db.workoutDayTemplate.findMany({
        where: { splitType: user.splitPreference },
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
      });
    }

    const sessions = await db.workoutSession.findMany({
      where: { userId: user.id },
      orderBy: { performedAt: "asc" },
      include: {
        dayTemplate: true,
        exerciseLogs: {
          include: {
            exerciseTemplate: true,
          },
        },
      },
    });

    const nutrition =
      user.nutritionTarget ??
      calculateNutritionTargets({
        age: user.age,
        gender: user.gender,
        heightCm: user.heightCm,
        weightKg: user.currentWeightKg,
        activityLevel: user.goal.activityLevel,
        goalType: user.goal.goalType,
      });

    return {
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        heightCm: user.heightCm,
        currentWeightKg: user.currentWeightKg,
        splitPreference: user.splitPreference,
      },
      goal: {
        goalType: user.goal.goalType,
        activityLevel: user.goal.activityLevel,
        experienceLevel: user.goal.experienceLevel,
        targetWeightKg: user.goal.targetWeightKg,
        notes: user.goal.notes,
        weeklyWorkoutTarget: user.goal.weeklyWorkoutTarget,
      },
      nutrition: {
        calories: nutrition.calories,
        proteinG: nutrition.proteinG,
        carbsG: nutrition.carbsG,
        fatG: nutrition.fatG,
        fiberG: nutrition.fiberG,
        hydrationLiters: nutrition.hydrationLiters,
      },
      dayTemplates: dayTemplates.map((day) => ({
        id: day.id,
        slug: day.slug,
        name: day.name,
        focus: day.focus,
        accent: day.accent,
        description: day.description,
        estimatedMinutes: day.estimatedMinutes,
        order: day.order,
        exercises: day.exercises.map((exercise) => ({
          id: exercise.id,
          slug: exercise.slug,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          progressCue: exercise.progressCue,
          targetSets: exercise.targetSets,
          repRangeMin: exercise.repRangeMin,
          repRangeMax: exercise.repRangeMax,
          restSeconds: exercise.restSeconds,
          order: exercise.order,
        })),
      })),
      sessions: sessions.map((session) => ({
        id: session.id,
        dayTemplateId: session.dayTemplateId,
        dayName: session.dayTemplate.name,
        performedAt: session.performedAt,
        durationMin: session.durationMin,
        estimatedCaloriesBurned: session.estimatedCaloriesBurned,
        totalVolumeKg: session.totalVolumeKg,
        exerciseLogs: session.exerciseLogs.map((log) => ({
          id: log.id,
          exerciseId: log.exerciseTemplateId,
          exerciseName: log.exerciseTemplate.name,
          setsCompleted: log.setsCompleted,
          repsCompleted: log.repsCompleted,
          weightKg: log.weightKg,
          achievedMaxKg: log.achievedMaxKg,
          notes: log.notes,
        })),
      })),
      measurements: (user.measurements.length
        ? user.measurements
        : [
            {
              recordedAt: new Date(),
              weightKg: user.currentWeightKg,
              waistCm: null,
              armCm: null,
              chestCm: null,
              bodyFatPct: null,
            },
          ]
      ).map((entry) => ({
        recordedAt: entry.recordedAt,
        weightKg: entry.weightKg,
        waistCm: entry.waistCm,
        armCm: entry.armCm,
        chestCm: entry.chestCm,
        bodyFatPct: entry.bodyFatPct,
      })),
      digests: user.weeklyDigests.map((digest) => ({
        weekStart: digest.weekStart,
        workoutsCompleted: digest.workoutsCompleted,
        workoutTarget: digest.workoutTarget,
        totalVolumeKg: digest.totalVolumeKg,
        averageCaloriesBurned: digest.averageCaloriesBurned,
        highlight: digest.highlight,
        focusForNextWeek: digest.focusForNextWeek,
      })),
    };
  } catch (error) {
    console.error("Falling back to demo data:", error);
    return null;
  }
}

function calculateStreak(sessions: RawSession[]) {
  const uniqueDays = Array.from(
    new Set(
      [...sessions]
        .sort((left, right) => right.performedAt.getTime() - left.performedAt.getTime())
        .map((session) => format(session.performedAt, "yyyy-MM-dd")),
    ),
  );

  let streak = 0;
  let previousDate: Date | null = null;

  for (const sessionDate of uniqueDays) {
    const date = new Date(sessionDate);

    if (!previousDate) {
      streak += 1;
      previousDate = date;
      continue;
    }

    const difference = Math.round(
      (previousDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (difference <= 3) {
      streak += 1;
      previousDate = date;
      continue;
    }

    break;
  }

  return streak;
}

function buildSnapshot(dataset: RawDataset, isDemoMode: boolean): DashboardSnapshot {
  const now = new Date();
  const todayIndex = now.getDay() % dataset.dayTemplates.length;
  const defaultPlan = dataset.dayTemplates[todayIndex];
  const sessionsDescending = [...dataset.sessions].sort(
    (left, right) => right.performedAt.getTime() - left.performedAt.getTime(),
  );
  const lastLogMap = new Map<
    string,
    RawExerciseLog & {
      performedAt: Date;
    }
  >();

  for (const session of sessionsDescending) {
    for (const log of session.exerciseLogs) {
      if (!lastLogMap.has(log.exerciseId)) {
        lastLogMap.set(log.exerciseId, { ...log, performedAt: session.performedAt });
      }
    }
  }

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const recentWindow = subDays(now, 7);
  const weeklySessions = dataset.sessions.filter(
    (session) => session.performedAt >= recentWindow,
  );
  const weeklyVolumeKg = weeklySessions.reduce(
    (total, session) => total + session.totalVolumeKg,
    0,
  );
  const weeklyCaloriesBurned = weeklySessions.reduce(
    (total, session) => total + session.estimatedCaloriesBurned,
    0,
  );
  const workoutsCompleted = weeklySessions.length;
  const percent = Math.min(
    100,
    Math.round((workoutsCompleted / dataset.goal.weeklyWorkoutTarget) * 100),
  );
  const measurements = [...dataset.measurements].sort(
    (left, right) => left.recordedAt.getTime() - right.recordedAt.getTime(),
  );
  const firstMeasurement = measurements[0];
  const latestMeasurement = measurements[measurements.length - 1];
  const weightDelta = latestMeasurement.weightKg - firstMeasurement.weightKg;
  const waistDelta =
    latestMeasurement.waistCm && firstMeasurement.waistCm
      ? latestMeasurement.waistCm - firstMeasurement.waistCm
      : 0;
  const digest =
    dataset.digests[0] ??
    ({
      weekStart,
      workoutsCompleted,
      workoutTarget: dataset.goal.weeklyWorkoutTarget,
      totalVolumeKg: weeklyVolumeKg,
      averageCaloriesBurned: weeklySessions.length
        ? Math.round(weeklyCaloriesBurned / weeklySessions.length)
        : 0,
      highlight: "Momentum is building. Keep the progressive overload honest.",
      focusForNextWeek: "Repeat the split and turn one more set into quality work.",
    } satisfies RawDigest);

  const buildPlan = (day: RawDayTemplate) => ({
    id: day.id,
    slug: day.slug,
    name: day.name,
    focus: day.focus,
    accent: day.accent,
    description: day.description,
    estimatedMinutes: day.estimatedMinutes,
    exerciseCount: day.exercises.length,
    exercises: day.exercises.map((exercise) => {
      const lastLog = lastLogMap.get(exercise.id);
      const suggestion =
        lastLog &&
        getProgressSuggestion({
          weightKg: lastLog.weightKg,
          repsCompleted: lastLog.repsCompleted,
          repRangeMax: exercise.repRangeMax,
        });

      return {
        id: exercise.id,
        name: exercise.name,
        equipment: exercise.equipment,
        muscleGroup: exercise.muscleGroup,
        targetSets: exercise.targetSets,
        repRangeLabel: `${exercise.repRangeMin}-${exercise.repRangeMax} reps`,
        restSeconds: exercise.restSeconds,
        progressCue: exercise.progressCue,
        suggestedWeightKg: suggestion?.nextWeightKg,
        suggestedReps: suggestion?.nextReps,
        suggestionLabel: suggestion?.label,
        lastLog: lastLog
          ? {
              performedAtLabel: format(lastLog.performedAt, "dd MMM"),
              setsCompleted: lastLog.setsCompleted,
              repsCompleted: lastLog.repsCompleted,
              weightKg: lastLog.weightKg,
              achievedMaxKg: lastLog.achievedMaxKg,
            }
          : undefined,
      };
    }),
  });

  const workoutPlans = dataset.dayTemplates.map(buildPlan);
  const todayPlan =
    workoutPlans.find((plan) => plan.slug === defaultPlan.slug) ?? workoutPlans[0];

  const strongestExercise = todayPlan.exercises.find((exercise) => exercise.lastLog);
  const insights = [
    `${dataset.user.name.split(" ")[0]}, your weekly pace is ${percent}% of target and your streak is ${calculateStreak(dataset.sessions)} sessions deep.`,
    `Bodyweight is ${formatSigned(weightDelta)} kg since ${format(firstMeasurement.recordedAt, "dd MMM")} while waist is ${formatSigned(waistDelta)} cm.`,
    strongestExercise?.lastLog
      ? `${strongestExercise.name} is primed for ${
          strongestExercise.suggestedWeightKg ?? strongestExercise.lastLog.weightKg
        }kg next time.`
      : "Log the first session to unlock progression coaching.",
  ];

  return {
    isDemoMode,
    profile: {
      ...dataset.user,
      ...dataset.goal,
    },
    nutrition: dataset.nutrition,
    planDays: dataset.dayTemplates.map((day) => ({
      id: day.id,
      slug: day.slug,
      name: day.name,
      focus: day.focus,
      accent: day.accent,
      estimatedMinutes: day.estimatedMinutes,
      exerciseCount: day.exercises.length,
      isSelected: day.id === todayPlan.id,
    })),
    workoutPlans,
    todayPlan: {
      ...todayPlan,
    },
    completion: {
      workoutsCompleted,
      workoutTarget: dataset.goal.weeklyWorkoutTarget,
      percent,
      streak: calculateStreak(dataset.sessions),
      weeklyVolumeKg: Math.round(weeklyVolumeKg),
      weeklyCaloriesBurned,
    },
    heroStats: [
      {
        label: "Weekly drive",
        value: `${percent}%`,
        detail: `${workoutsCompleted}/${dataset.goal.weeklyWorkoutTarget} sessions`,
      },
      {
        label: "Fuel target",
        value: `${dataset.nutrition.calories}`,
        detail: "Calories per day",
      },
      {
        label: "Bodyweight",
        value: `${latestMeasurement.weightKg}kg`,
        detail: `Goal ${dataset.goal.targetWeightKg ?? latestMeasurement.weightKg}kg`,
      },
      {
        label: "Volume bank",
        value: `${formatCompactNumber(Math.round(weeklyVolumeKg))}`,
        detail: "Kg moved this week",
      },
    ],
    recentMeasurements: measurements.slice(-5).map((entry) => ({
      label: format(entry.recordedAt, "dd MMM"),
      weight: entry.weightKg,
      waist: entry.waistCm,
      arm: entry.armCm,
    })),
    strengthTrend: dataset.sessions.slice(-6).map((session) => ({
      label: format(session.performedAt, "dd MMM"),
      volume: Math.round(session.totalVolumeKg),
      topSet: Math.max(...session.exerciseLogs.map((log) => log.weightKg)),
    })),
    recentSessions: sessionsDescending.slice(0, 4).map((session) => ({
      id: session.id,
      label: format(session.performedAt, "EEE, dd MMM"),
      dayName: session.dayName,
      calories: session.estimatedCaloriesBurned,
      volume: Math.round(session.totalVolumeKg),
    })),
    weeklyDigest: {
      weekLabel: `${format(digest.weekStart, "dd MMM")} week`,
      workoutsCompleted: digest.workoutsCompleted,
      workoutTarget: digest.workoutTarget,
      totalVolumeKg: Math.round(digest.totalVolumeKg),
      averageCaloriesBurned: digest.averageCaloriesBurned,
      highlight: digest.highlight,
      focusForNextWeek: digest.focusForNextWeek,
    },
    insights,
  };
}

export async function getDashboardSnapshot({
  allowDemoFallback = true,
}: {
  allowDemoFallback?: boolean;
} = {}) {
  const viewer = await getCurrentViewer();
  const databaseDataset = viewer ? await buildDatabaseDataset(viewer.id) : null;

  if (
    databaseDataset &&
    databaseDataset.dayTemplates.length > 0 &&
    databaseDataset.measurements.length > 0
  ) {
    return buildSnapshot(databaseDataset, false);
  }

  if (!allowDemoFallback) {
    return null;
  }

  return buildSnapshot(buildDemoDataset(), true);
}

export async function getOnboardingDefaults(
  userId?: string,
): Promise<OnboardingDefaults> {
  if (!userId || !hasUsableDatabaseUrl) {
    return {
      name: demoProfile.name,
      age: demoProfile.age,
      gender: demoProfile.gender,
      heightCm: demoProfile.heightCm,
      weightKg: demoProfile.currentWeightKg,
      goalType: demoGoal.goalType,
      activityLevel: demoGoal.activityLevel,
      experienceLevel: demoGoal.experienceLevel,
      targetWeightKg: demoGoal.targetWeightKg,
    };
  }

  const db = requirePrisma();
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { goal: true },
  });

  return {
    name: user?.name ?? demoProfile.name,
    age: user?.age ?? demoProfile.age,
    gender: user?.gender ?? demoProfile.gender,
    heightCm: user?.heightCm ?? demoProfile.heightCm,
    weightKg: user?.currentWeightKg ?? demoProfile.currentWeightKg,
    goalType: user?.goal?.goalType ?? demoGoal.goalType,
    activityLevel: user?.goal?.activityLevel ?? demoGoal.activityLevel,
    experienceLevel: user?.goal?.experienceLevel ?? demoGoal.experienceLevel,
    targetWeightKg: user?.goal?.targetWeightKg ?? demoGoal.targetWeightKg,
  };
}

export async function getAppShellData() {
  const viewerRecord = await getCurrentViewer();
  const viewer: ViewerState | null = viewerRecord
    ? {
        id: viewerRecord.id,
        email: viewerRecord.email,
        name: viewerRecord.name,
        onboardingComplete: viewerRecord.onboardingComplete,
        hasSeenWelcomeCarousel: viewerRecord.hasSeenWelcomeCarousel,
        trainingMode: viewerRecord.trainingMode,
        splitPreference: viewerRecord.splitPreference,
      }
    : null;

  const onboardingDefaults = await getOnboardingDefaults(viewer?.id);
  const dashboard =
    viewer?.onboardingComplete && viewer.id
      ? await getDashboardSnapshot({ allowDemoFallback: false })
      : null;

  return {
    viewer,
    onboardingDefaults,
    dashboard,
  };
}
