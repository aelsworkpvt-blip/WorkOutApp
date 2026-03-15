-- CreateEnum
CREATE TYPE "TrainingMode" AS ENUM ('MUSCLE_GROWTH', 'FAT_LOSS', 'BODY_RECOMPOSITION');

-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "heightCm" DROP NOT NULL,
ALTER COLUMN "currentWeightKg" DROP NOT NULL,
ALTER COLUMN "splitPreference" DROP NOT NULL,
ALTER COLUMN "splitPreference" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "email" TEXT,
ADD COLUMN "hasSeenWelcomeCarousel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "trainingMode" "TrainingMode";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
