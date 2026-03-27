import { format, startOfWeek, subDays } from "date-fns";
import { cache } from "react";
import type { PrismaClient } from "@prisma/client";
import { getCurrentViewer } from "@/lib/auth";
import { calculateNutritionTargets, calculateVolume, formatCompactNumber, formatSigned, getProgressSuggestion } from "@/lib/calculations";
import { demoGoal, demoMeasurements, demoProfile, demoSessionBlueprints, demoWeeklyDigests } from "@/lib/app-fixture";
import { hasUsableDatabaseUrl, requirePrisma } from "@/lib/prisma";
import { workoutTemplates } from "@/lib/workout-templates";
import { ensureWorkoutTemplatesSeeded } from "@/lib/workout-template-bootstrap";

const LIVE_GOAL_TYPE = "MUSCLE_GAIN" as const;

type RawExercise = {
  id: string;
  slug: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: string;
  progressCue: string;
  demoVideoLabel: string | null;
  demoVideoSource: string | null;
  demoVideoUrl: string | null;
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
  goalType: typeof LIVE_GOAL_TYPE;
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
      instructions: string;
      demoVideoLabel: string | null;
      demoVideoSource: string | null;
      demoVideoUrl: string | null;
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
      instructions: string;
      demoVideoLabel: string | null;
      demoVideoSource: string | null;
      demoVideoUrl: string | null;
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

type PlanDaySnapshot = DashboardSnapshot["planDays"][number];
type WorkoutPlanSnapshot = DashboardSnapshot["workoutPlans"][number];
type CompletionSnapshot = DashboardSnapshot["completion"];
type RecentMeasurementSnapshot = DashboardSnapshot["recentMeasurements"][number];
type StrengthTrendSnapshot = DashboardSnapshot["strengthTrend"][number];
type RecentSessionSnapshot = DashboardSnapshot["recentSessions"][number];
type WeeklyDigestSnapshot = DashboardSnapshot["weeklyDigest"];

export type WorkoutPageData = Pick<
  DashboardSnapshot,
  "planDays" | "workoutPlans" | "todayPlan" | "weeklyDigest" | "recentSessions"
>;

export type ProgressPageData = Pick<
  DashboardSnapshot,
  "weeklyDigest" | "recentMeasurements" | "strengthTrend"
> & {
  profile: Pick<DashboardSnapshot["profile"], "currentWeightKg">;
};

export type ProfilePageData = {
  profile: Pick<
    DashboardSnapshot["profile"],
    "name" | "currentWeightKg" | "splitPreference"
  >;
  nutrition: Pick<DashboardSnapshot["nutrition"], "calories">;
  completion: Pick<DashboardSnapshot["completion"], "workoutTarget">;
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
        demoVideoLabel: exercise.demoVideoLabel,
        demoVideoSource: exercise.demoVideoSource,
        demoVideoUrl: exercise.demoVideoUrl,
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

async function loadDayTemplates(
  db: PrismaClient,
  userSplitPreference: RawDataset["user"]["splitPreference"],
) {
  return db.workoutDayTemplate.findMany({
    where: { splitType: userSplitPreference },
    orderBy: { order: "asc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });
}

const buildDatabaseDataset = cache(async function buildDatabaseDataset(
  userId: string,
): Promise<RawDataset | null> {
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

    const sessionsPromise = db.workoutSession.findMany({
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

    let dayTemplates = await loadDayTemplates(db, user.splitPreference);

    // Seed templates only for empty databases instead of writing on every page read.
    if (dayTemplates.length === 0) {
      await ensureWorkoutTemplatesSeeded(db);
      dayTemplates = await loadDayTemplates(db, user.splitPreference);
    }

    const sessions = await sessionsPromise;

    const nutrition =
      user.goal.goalType === LIVE_GOAL_TYPE && user.nutritionTarget
        ? user.nutritionTarget
        : calculateNutritionTargets({
            age: user.age,
            gender: user.gender,
            heightCm: user.heightCm,
            weightKg: user.currentWeightKg,
            activityLevel: user.goal.activityLevel,
            goalType: LIVE_GOAL_TYPE,
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
        goalType: LIVE_GOAL_TYPE,
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
          demoVideoLabel: exercise.demoVideoLabel,
          demoVideoSource: exercise.demoVideoSource,
          demoVideoUrl: exercise.demoVideoUrl,
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
});

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

function getSessionsDescending(sessions: RawSession[]) {
  return [...sessions].sort(
    (left, right) => right.performedAt.getTime() - left.performedAt.getTime(),
  );
}

function buildLastLogMap(sessions: RawSession[]) {
  const lastLogMap = new Map<
    string,
    RawExerciseLog & {
      performedAt: Date;
    }
  >();

  for (const session of getSessionsDescending(sessions)) {
    for (const log of session.exerciseLogs) {
      if (!lastLogMap.has(log.exerciseId)) {
        lastLogMap.set(log.exerciseId, { ...log, performedAt: session.performedAt });
      }
    }
  }

  return lastLogMap;
}

function buildWorkoutPlansSection(
  dayTemplates: RawDayTemplate[],
  sessions: RawSession[],
): {
  planDays: PlanDaySnapshot[];
  workoutPlans: WorkoutPlanSnapshot[];
  todayPlan: WorkoutPlanSnapshot;
} {
  const todayIndex = new Date().getDay() % dayTemplates.length;
  const defaultPlan = dayTemplates[todayIndex];
  const lastLogMap = buildLastLogMap(sessions);

  const workoutPlans = dayTemplates.map((day) => ({
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
        instructions: exercise.instructions,
        demoVideoLabel: exercise.demoVideoLabel,
        demoVideoSource: exercise.demoVideoSource,
        demoVideoUrl: exercise.demoVideoUrl,
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
  }));

  const todayPlan =
    workoutPlans.find((plan) => plan.slug === defaultPlan.slug) ?? workoutPlans[0];

  return {
    planDays: dayTemplates.map((day) => ({
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
    todayPlan,
  };
}

function buildWeeklyMetrics(sessions: RawSession[], workoutTarget: number) {
  const recentWindow = subDays(new Date(), 7);
  const weeklySessions = sessions.filter((session) => session.performedAt >= recentWindow);
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
    Math.round((workoutsCompleted / workoutTarget) * 100),
  );

  return {
    weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    weeklySessions,
    weeklyVolumeKg,
    weeklyCaloriesBurned,
    workoutsCompleted,
    percent,
  };
}

function buildCompletionSnapshot(
  sessions: RawSession[],
  workoutTarget: number,
): CompletionSnapshot {
  const metrics = buildWeeklyMetrics(sessions, workoutTarget);

  return {
    workoutsCompleted: metrics.workoutsCompleted,
    workoutTarget,
    percent: metrics.percent,
    streak: calculateStreak(sessions),
    weeklyVolumeKg: Math.round(metrics.weeklyVolumeKg),
    weeklyCaloriesBurned: metrics.weeklyCaloriesBurned,
  };
}

function buildWeeklyDigestSnapshot(
  digests: RawDigest[],
  sessions: RawSession[],
  workoutTarget: number,
): WeeklyDigestSnapshot {
  const metrics = buildWeeklyMetrics(sessions, workoutTarget);
  const digest =
    digests[0] ??
    ({
      weekStart: metrics.weekStart,
      workoutsCompleted: metrics.workoutsCompleted,
      workoutTarget,
      totalVolumeKg: metrics.weeklyVolumeKg,
      averageCaloriesBurned: metrics.weeklySessions.length
        ? Math.round(metrics.weeklyCaloriesBurned / metrics.weeklySessions.length)
        : 0,
      highlight: "Momentum is building. Keep the progressive overload honest.",
      focusForNextWeek: "Repeat the split and turn one more set into quality work.",
    } satisfies RawDigest);

  return {
    weekLabel: `${format(digest.weekStart, "dd MMM")} week`,
    workoutsCompleted: digest.workoutsCompleted,
    workoutTarget: digest.workoutTarget,
    totalVolumeKg: Math.round(digest.totalVolumeKg),
    averageCaloriesBurned: digest.averageCaloriesBurned,
    highlight: digest.highlight,
    focusForNextWeek: digest.focusForNextWeek,
  };
}

function buildRecentMeasurements(
  measurements: RawMeasurement[],
): RecentMeasurementSnapshot[] {
  return [...measurements]
    .sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime())
    .slice(-5)
    .map((entry) => ({
      label: format(entry.recordedAt, "dd MMM"),
      weight: entry.weightKg,
      waist: entry.waistCm,
      arm: entry.armCm,
    }));
}

function buildStrengthTrend(sessions: RawSession[]): StrengthTrendSnapshot[] {
  return sessions.slice(-6).map((session) => ({
    label: format(session.performedAt, "dd MMM"),
    volume: Math.round(session.totalVolumeKg),
    topSet: Math.max(0, ...session.exerciseLogs.map((log) => log.weightKg)),
  }));
}

function buildRecentSessions(sessions: RawSession[]): RecentSessionSnapshot[] {
  return getSessionsDescending(sessions).slice(0, 4).map((session) => ({
    id: session.id,
    label: format(session.performedAt, "EEE, dd MMM"),
    dayName: session.dayName,
    calories: session.estimatedCaloriesBurned,
    volume: Math.round(session.totalVolumeKg),
  }));
}

function buildSnapshot(dataset: RawDataset, isDemoMode: boolean): DashboardSnapshot {
  const completion = buildCompletionSnapshot(
    dataset.sessions,
    dataset.goal.weeklyWorkoutTarget,
  );
  const { planDays, workoutPlans, todayPlan } = buildWorkoutPlansSection(
    dataset.dayTemplates,
    dataset.sessions,
  );
  const weeklyDigest = buildWeeklyDigestSnapshot(
    dataset.digests,
    dataset.sessions,
    dataset.goal.weeklyWorkoutTarget,
  );
  const recentMeasurements = buildRecentMeasurements(dataset.measurements);
  const strengthTrend = buildStrengthTrend(dataset.sessions);
  const recentSessions = buildRecentSessions(dataset.sessions);
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

  const strongestExercise = todayPlan.exercises.find((exercise) => exercise.lastLog);
  const insights = [
    `${dataset.user.name.split(" ")[0]}, your weekly pace is ${completion.percent}% of target and your streak is ${completion.streak} sessions deep.`,
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
    planDays,
    workoutPlans,
    todayPlan: {
      ...todayPlan,
    },
    completion,
    heroStats: [
      {
        label: "Weekly drive",
        value: `${completion.percent}%`,
        detail: `${completion.workoutsCompleted}/${dataset.goal.weeklyWorkoutTarget} sessions`,
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
        value: `${formatCompactNumber(completion.weeklyVolumeKg)}`,
        detail: "Kg moved this week",
      },
    ],
    recentMeasurements,
    strengthTrend,
    recentSessions,
    weeklyDigest,
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

export const getWorkoutPageData = cache(
  async function getWorkoutPageData(): Promise<WorkoutPageData | null> {
    if (!hasUsableDatabaseUrl) {
      return null;
    }

    const viewer = await getCurrentViewer();

    if (!viewer?.id) {
      return null;
    }

    try {
      const db = requirePrisma();
      const user = await db.user.findUnique({
        where: { id: viewer.id },
        select: {
          splitPreference: true,
          goal: {
            select: {
              weeklyWorkoutTarget: true,
            },
          },
        },
      });

      if (!user?.goal || !user.splitPreference) {
        return null;
      }

      const sessionsPromise = db.workoutSession.findMany({
        where: { userId: viewer.id },
        orderBy: { performedAt: "asc" },
        include: {
          dayTemplate: {
            select: {
              name: true,
            },
          },
          exerciseLogs: {
            include: {
              exerciseTemplate: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const digestsPromise = db.weeklyDigest.findMany({
        where: { userId: viewer.id },
        orderBy: { weekStart: "desc" },
        take: 1,
      });

      let dayTemplates = await loadDayTemplates(db, user.splitPreference);

      if (dayTemplates.length === 0) {
        await ensureWorkoutTemplatesSeeded(db);
        dayTemplates = await loadDayTemplates(db, user.splitPreference);
      }

      if (dayTemplates.length === 0) {
        return null;
      }

      const [sessions, digests] = await Promise.all([
        sessionsPromise,
        digestsPromise,
      ]);

      const rawSessions: RawSession[] = sessions.map((session) => ({
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
      }));

      const rawDigests: RawDigest[] = digests.map((digest) => ({
        weekStart: digest.weekStart,
        workoutsCompleted: digest.workoutsCompleted,
        workoutTarget: digest.workoutTarget,
        totalVolumeKg: digest.totalVolumeKg,
        averageCaloriesBurned: digest.averageCaloriesBurned,
        highlight: digest.highlight,
        focusForNextWeek: digest.focusForNextWeek,
      }));

      const { planDays, workoutPlans, todayPlan } = buildWorkoutPlansSection(
        dayTemplates,
        rawSessions,
      );

      return {
        planDays,
        workoutPlans,
        todayPlan,
        weeklyDigest: buildWeeklyDigestSnapshot(
          rawDigests,
          rawSessions,
          user.goal.weeklyWorkoutTarget,
        ),
        recentSessions: buildRecentSessions(rawSessions),
      };
    } catch (error) {
      console.error("Unable to build workout page data:", error);
      return null;
    }
  },
);

export const getProgressPageData = cache(
  async function getProgressPageData(): Promise<ProgressPageData | null> {
    if (!hasUsableDatabaseUrl) {
      return null;
    }

    const viewer = await getCurrentViewer();

    if (!viewer?.id) {
      return null;
    }

    try {
      const db = requirePrisma();
      const recentWindow = subDays(new Date(), 7);

      const [user, measurements, digests, strengthSessions, weeklySessions] =
        await Promise.all([
          db.user.findUnique({
            where: { id: viewer.id },
            select: {
              currentWeightKg: true,
              goal: {
                select: {
                  weeklyWorkoutTarget: true,
                },
              },
            },
          }),
          db.measurementEntry.findMany({
            where: { userId: viewer.id },
            orderBy: { recordedAt: "desc" },
            take: 5,
            select: {
              recordedAt: true,
              weightKg: true,
              waistCm: true,
              armCm: true,
            },
          }),
          db.weeklyDigest.findMany({
            where: { userId: viewer.id },
            orderBy: { weekStart: "desc" },
            take: 1,
          }),
          db.workoutSession.findMany({
            where: { userId: viewer.id },
            orderBy: { performedAt: "desc" },
            take: 6,
            select: {
              id: true,
              performedAt: true,
              totalVolumeKg: true,
              exerciseLogs: {
                select: {
                  weightKg: true,
                },
              },
            },
          }),
          db.workoutSession.findMany({
            where: {
              userId: viewer.id,
              performedAt: {
                gte: recentWindow,
              },
            },
            orderBy: { performedAt: "asc" },
            select: {
              id: true,
              performedAt: true,
              estimatedCaloriesBurned: true,
              totalVolumeKg: true,
            },
          }),
        ]);

      if (!user?.goal || user.currentWeightKg === null) {
        return null;
      }

      const recentMeasurements =
        measurements.length > 0
          ? [...measurements].reverse().map((entry) => ({
              label: format(entry.recordedAt, "dd MMM"),
              weight: entry.weightKg,
              waist: entry.waistCm,
              arm: entry.armCm,
            }))
          : [
              {
                label: format(new Date(), "dd MMM"),
                weight: user.currentWeightKg,
                waist: null,
                arm: null,
              },
            ];

      const rawStrengthSessions: RawSession[] = [...strengthSessions]
        .reverse()
        .map((session) => ({
          id: session.id,
          dayTemplateId: "",
          dayName: "",
          performedAt: session.performedAt,
          durationMin: 0,
          estimatedCaloriesBurned: 0,
          totalVolumeKg: session.totalVolumeKg,
          exerciseLogs: session.exerciseLogs.map((log, index) => ({
            id: `${session.id}-${index}`,
            exerciseId: "",
            exerciseName: "",
            setsCompleted: 0,
            repsCompleted: 0,
            weightKg: log.weightKg,
            achievedMaxKg: null,
          })),
        }));

      const rawWeeklySessions: RawSession[] = weeklySessions.map((session) => ({
        id: session.id,
        dayTemplateId: "",
        dayName: "",
        performedAt: session.performedAt,
        durationMin: 0,
        estimatedCaloriesBurned: session.estimatedCaloriesBurned,
        totalVolumeKg: session.totalVolumeKg,
        exerciseLogs: [],
      }));

      const rawDigests: RawDigest[] = digests.map((digest) => ({
        weekStart: digest.weekStart,
        workoutsCompleted: digest.workoutsCompleted,
        workoutTarget: digest.workoutTarget,
        totalVolumeKg: digest.totalVolumeKg,
        averageCaloriesBurned: digest.averageCaloriesBurned,
        highlight: digest.highlight,
        focusForNextWeek: digest.focusForNextWeek,
      }));

      return {
        profile: {
          currentWeightKg: user.currentWeightKg,
        },
        recentMeasurements,
        strengthTrend: buildStrengthTrend(rawStrengthSessions),
        weeklyDigest: buildWeeklyDigestSnapshot(
          rawDigests,
          rawWeeklySessions,
          user.goal.weeklyWorkoutTarget,
        ),
      };
    } catch (error) {
      console.error("Unable to build progress page data:", error);
      return null;
    }
  },
);

export const getProfilePageData = cache(
  async function getProfilePageData(): Promise<ProfilePageData | null> {
    if (!hasUsableDatabaseUrl) {
      return null;
    }

    const viewer = await getCurrentViewer();

    if (!viewer?.id) {
      return null;
    }

    try {
      const db = requirePrisma();
      const user = await db.user.findUnique({
        where: { id: viewer.id },
        select: {
          name: true,
          age: true,
          gender: true,
          heightCm: true,
          currentWeightKg: true,
          splitPreference: true,
          nutritionTarget: {
            select: {
              calories: true,
            },
          },
          goal: {
            select: {
              activityLevel: true,
              weeklyWorkoutTarget: true,
            },
          },
        },
      });

      if (!user?.goal || user.currentWeightKg === null || !user.splitPreference) {
        return null;
      }

      let calories = user.nutritionTarget?.calories ?? null;

      if (calories === null) {
        if (user.age === null || user.gender === null || user.heightCm === null) {
          return null;
        }

        calories = calculateNutritionTargets({
          age: user.age,
          gender: user.gender,
          heightCm: user.heightCm,
          weightKg: user.currentWeightKg,
          activityLevel: user.goal.activityLevel,
          goalType: LIVE_GOAL_TYPE,
        }).calories;
      }

      return {
        profile: {
          name: viewer.name ?? user.name ?? "Athlete",
          currentWeightKg: user.currentWeightKg,
          splitPreference: user.splitPreference,
        },
        nutrition: {
          calories,
        },
        completion: {
          workoutTarget: user.goal.weeklyWorkoutTarget,
        },
      };
    } catch (error) {
      console.error("Unable to build profile page data:", error);
      return null;
    }
  },
);

const getOnboardingDefaultsCached = cache(async function getOnboardingDefaultsCached(
  userId?: string,
): Promise<OnboardingDefaults> {
  if (!userId || !hasUsableDatabaseUrl) {
    return {
      name: demoProfile.name,
      age: demoProfile.age,
      gender: demoProfile.gender,
      heightCm: demoProfile.heightCm,
      weightKg: demoProfile.currentWeightKg,
      goalType: LIVE_GOAL_TYPE,
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
    goalType: LIVE_GOAL_TYPE,
    activityLevel: user?.goal?.activityLevel ?? demoGoal.activityLevel,
    experienceLevel: user?.goal?.experienceLevel ?? demoGoal.experienceLevel,
    targetWeightKg: user?.goal?.targetWeightKg ?? demoGoal.targetWeightKg,
  };
});

export async function getOnboardingDefaults(userId?: string) {
  return getOnboardingDefaultsCached(userId);
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
