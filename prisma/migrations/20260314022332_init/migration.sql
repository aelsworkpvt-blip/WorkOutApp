-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('FAT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'PERFORMANCE');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('PPL', 'BRO');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('LIGHT', 'MODERATE', 'HIGH', 'ATHLETE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'LEGS', 'BICEPS', 'TRICEPS', 'GLUTES', 'HAMSTRINGS', 'QUADS', 'CALVES', 'CORE', 'FULL_BODY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "currentWeightKg" DOUBLE PRECISION NOT NULL,
    "splitPreference" "SplitType" NOT NULL DEFAULT 'PPL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalType" "GoalType" NOT NULL,
    "activityLevel" "ActivityLevel" NOT NULL,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "targetWeightKg" DOUBLE PRECISION,
    "notes" TEXT,
    "weeklyWorkoutTarget" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinG" INTEGER NOT NULL,
    "carbsG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,
    "fiberG" INTEGER NOT NULL,
    "hydrationLiters" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "chestCm" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "hipsCm" DOUBLE PRECISION,
    "armCm" DOUBLE PRECISION,
    "thighCm" DOUBLE PRECISION,
    "calfCm" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,

    CONSTRAINT "MeasurementEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDayTemplate" (
    "id" TEXT NOT NULL,
    "splitType" "SplitType" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "focus" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,

    CONSTRAINT "WorkoutDayTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseTemplate" (
    "id" TEXT NOT NULL,
    "dayTemplateId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "equipment" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "progressCue" TEXT NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "repRangeMin" INTEGER NOT NULL,
    "repRangeMax" INTEGER NOT NULL,
    "restSeconds" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayTemplateId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMin" INTEGER NOT NULL,
    "estimatedCaloriesBurned" INTEGER NOT NULL,
    "totalVolumeKg" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseTemplateId" TEXT NOT NULL,
    "setsCompleted" INTEGER NOT NULL,
    "repsCompleted" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "achievedMaxKg" DOUBLE PRECISION,
    "perceivedEffort" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyDigest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "workoutsCompleted" INTEGER NOT NULL,
    "workoutTarget" INTEGER NOT NULL,
    "totalVolumeKg" DOUBLE PRECISION NOT NULL,
    "averageCaloriesBurned" INTEGER NOT NULL,
    "highlight" TEXT NOT NULL,
    "focusForNextWeek" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyDigest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_key" ON "UserGoal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionTarget_userId_key" ON "NutritionTarget"("userId");

-- CreateIndex
CREATE INDEX "MeasurementEntry_userId_recordedAt_idx" ON "MeasurementEntry"("userId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDayTemplate_slug_key" ON "WorkoutDayTemplate"("slug");

-- CreateIndex
CREATE INDEX "WorkoutDayTemplate_splitType_order_idx" ON "WorkoutDayTemplate"("splitType", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseTemplate_slug_key" ON "ExerciseTemplate"("slug");

-- CreateIndex
CREATE INDEX "ExerciseTemplate_dayTemplateId_order_idx" ON "ExerciseTemplate"("dayTemplateId", "order");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_performedAt_idx" ON "WorkoutSession"("userId", "performedAt");

-- CreateIndex
CREATE INDEX "ExerciseLog_exerciseTemplateId_createdAt_idx" ON "ExerciseLog"("exerciseTemplateId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyDigest_userId_weekStart_key" ON "WeeklyDigest"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionTarget" ADD CONSTRAINT "NutritionTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementEntry" ADD CONSTRAINT "MeasurementEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_dayTemplateId_fkey" FOREIGN KEY ("dayTemplateId") REFERENCES "WorkoutDayTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_dayTemplateId_fkey" FOREIGN KEY ("dayTemplateId") REFERENCES "WorkoutDayTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseTemplateId_fkey" FOREIGN KEY ("exerciseTemplateId") REFERENCES "ExerciseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyDigest" ADD CONSTRAINT "WeeklyDigest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
