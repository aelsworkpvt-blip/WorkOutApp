import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { Pool } from "pg";
import { calculateNutritionTargets, calculateVolume, estimateWorkoutCalories } from "../src/lib/calculations";
import { demoGoal, demoMeasurements, demoProfile, demoSessionBlueprints, demoWeeklyDigests } from "../src/lib/app-fixture";
import { workoutTemplates } from "../src/lib/workout-templates";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const demoPasswordHash = await hash("DemoStrong123", 12);

  await prisma.exerciseLog.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.weeklyDigest.deleteMany();
  await prisma.measurementEntry.deleteMany();
  await prisma.nutritionTarget.deleteMany();
  await prisma.userGoal.deleteMany();
  await prisma.exerciseTemplate.deleteMany();
  await prisma.workoutDayTemplate.deleteMany();
  await prisma.user.deleteMany();

  const dayTemplateMap = new Map<
    string,
    {
      id: string;
      exerciseMap: Map<string, string>;
    }
  >();

  for (const [splitType, days] of Object.entries(workoutTemplates) as Array<
    [keyof typeof workoutTemplates, (typeof workoutTemplates)[keyof typeof workoutTemplates]]
  >) {
    for (const [dayIndex, day] of days.entries()) {
      const createdDay = await prisma.workoutDayTemplate.create({
        data: {
          splitType,
          slug: day.slug,
          name: day.name,
          focus: day.focus,
          accent: day.accent,
          description: day.description,
          order: dayIndex,
          estimatedMinutes: day.estimatedMinutes,
          exercises: {
            create: day.exercises.map((exercise, exerciseIndex) => ({
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
          },
        },
        include: {
          exercises: true,
        },
      });

      dayTemplateMap.set(day.slug, {
        id: createdDay.id,
        exerciseMap: new Map(
          createdDay.exercises.map((exercise) => [exercise.slug, exercise.id]),
        ),
      });
    }
  }

  const user = await prisma.user.create({
    data: {
      email: "demo@forgemotion.app",
      passwordHash: demoPasswordHash,
      name: demoProfile.name,
      age: demoProfile.age,
      gender: demoProfile.gender,
      heightCm: demoProfile.heightCm,
      currentWeightKg: demoProfile.currentWeightKg,
      trainingMode: "MUSCLE_GROWTH",
      splitPreference: demoProfile.splitPreference,
      onboardingComplete: true,
      hasSeenWelcomeCarousel: true,
    },
  });

  const nutrition = calculateNutritionTargets({
    age: demoProfile.age,
    gender: demoProfile.gender,
    heightCm: demoProfile.heightCm,
    weightKg: demoProfile.currentWeightKg,
    activityLevel: demoGoal.activityLevel,
    goalType: demoGoal.goalType,
  });

  await prisma.userGoal.create({
    data: {
      userId: user.id,
      goalType: demoGoal.goalType,
      activityLevel: demoGoal.activityLevel,
      experienceLevel: demoGoal.experienceLevel,
      targetWeightKg: demoGoal.targetWeightKg,
      notes: demoGoal.notes,
      weeklyWorkoutTarget: demoGoal.weeklyWorkoutTarget,
    },
  });

  await prisma.nutritionTarget.create({
    data: {
      userId: user.id,
      calories: nutrition.calories,
      proteinG: nutrition.proteinG,
      carbsG: nutrition.carbsG,
      fatG: nutrition.fatG,
      fiberG: nutrition.fiberG,
      hydrationLiters: nutrition.hydrationLiters,
    },
  });

  await prisma.measurementEntry.createMany({
    data: demoMeasurements.map((entry) => ({
      userId: user.id,
      recordedAt: new Date(entry.recordedAt),
      weightKg: entry.weightKg,
      chestCm: entry.chestCm,
      waistCm: entry.waistCm,
      hipsCm: entry.hipsCm,
      armCm: entry.armCm,
      thighCm: entry.thighCm,
      calfCm: entry.calfCm,
      bodyFatPct: entry.bodyFatPct,
    })),
  });

  for (const session of demoSessionBlueprints) {
    const dayTemplate = dayTemplateMap.get(session.daySlug);

    if (!dayTemplate) {
      continue;
    }

    const totalVolumeKg = session.logs.reduce(
      (total, log) =>
        total +
        calculateVolume({
          setsCompleted: log.setsCompleted,
          repsCompleted: log.repsCompleted,
          weightKg: log.weightKg,
        }),
      0,
    );

    await prisma.workoutSession.create({
      data: {
        userId: user.id,
        dayTemplateId: dayTemplate.id,
        performedAt: new Date(session.performedAt),
        durationMin: session.durationMin,
        estimatedCaloriesBurned: estimateWorkoutCalories({
          bodyWeightKg: demoProfile.currentWeightKg,
          durationMin: session.durationMin,
        }),
        totalVolumeKg,
        notes: session.notes,
        exerciseLogs: {
          create: session.logs.map((log) => ({
            exerciseTemplateId: dayTemplate.exerciseMap.get(log.exerciseSlug)!,
            setsCompleted: log.setsCompleted,
            repsCompleted: log.repsCompleted,
            weightKg: log.weightKg,
            achievedMaxKg: log.achievedMaxKg ?? null,
          })),
        },
      },
    });
  }

  await prisma.weeklyDigest.createMany({
    data: demoWeeklyDigests.map((digest) => ({
      userId: user.id,
      weekStart: new Date(digest.weekStart),
      workoutsCompleted: digest.workoutsCompleted,
      workoutTarget: digest.workoutTarget,
      totalVolumeKg: digest.totalVolumeKg,
      averageCaloriesBurned: digest.averageCaloriesBurned,
      highlight: digest.highlight,
      focusForNextWeek: digest.focusForNextWeek,
    })),
  });

  console.log("Seeded Forge Motion demo athlete and workout templates.");
  console.log("Demo login: demo@forgemotion.app / DemoStrong123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
