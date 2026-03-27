import type { PrismaClient } from "@prisma/client";
import { workoutTemplates } from "@/lib/workout-templates";

export async function ensureWorkoutTemplatesSeeded(db: PrismaClient) {
  for (const [splitType, days] of Object.entries(workoutTemplates) as Array<
    [keyof typeof workoutTemplates, (typeof workoutTemplates)[keyof typeof workoutTemplates]]
  >) {
    for (const [dayIndex, day] of days.entries()) {
      const dayTemplate = await db.workoutDayTemplate.upsert({
        where: { slug: day.slug },
        update: {
          splitType,
          name: day.name,
          focus: day.focus,
          accent: day.accent,
          description: day.description,
          order: dayIndex,
          estimatedMinutes: day.estimatedMinutes,
        },
        create: {
          splitType,
          slug: day.slug,
          name: day.name,
          focus: day.focus,
          accent: day.accent,
          description: day.description,
          order: dayIndex,
          estimatedMinutes: day.estimatedMinutes,
        },
      });

      for (const [exerciseIndex, exercise] of day.exercises.entries()) {
        await db.exerciseTemplate.upsert({
          where: { slug: exercise.slug },
          update: {
            dayTemplateId: dayTemplate.id,
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
          },
          create: {
            dayTemplateId: dayTemplate.id,
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
          },
        });
      }
    }
  }
}
