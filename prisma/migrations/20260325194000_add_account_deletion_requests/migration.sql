CREATE TYPE "AccountDeletionRequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

CREATE TABLE "AccountDeletionRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT,
    "status" "AccountDeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccountDeletionRequest_email_requestedAt_idx" ON "AccountDeletionRequest"("email", "requestedAt");

CREATE INDEX "AccountDeletionRequest_status_requestedAt_idx" ON "AccountDeletionRequest"("status", "requestedAt");
