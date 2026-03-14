import { redirect } from "next/navigation";
import { getCurrentViewer } from "@/lib/auth";

type MinimalViewer = {
  onboardingComplete: boolean;
  trainingMode: "MUSCLE_GROWTH" | "FAT_LOSS" | "BODY_RECOMPOSITION" | null;
  splitPreference: "PPL" | "BRO" | null;
};

export function getHomePath(viewer: MinimalViewer | null) {
  if (!viewer) {
    return "/auth";
  }

  if (viewer.onboardingComplete) {
    return "/dashboard";
  }

  if (!viewer.trainingMode) {
    return "/mode";
  }

  if (viewer.splitPreference) {
    return `/onboarding?split=${viewer.splitPreference}`;
  }

  return "/split";
}

export async function requireAuthenticatedViewer() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/auth");
  }

  return viewer;
}

export async function requireSetupViewer() {
  const viewer = await requireAuthenticatedViewer();

  if (viewer.onboardingComplete) {
    redirect("/dashboard");
  }

  return viewer;
}

export async function requireAppViewer() {
  const viewer = await requireAuthenticatedViewer();

  if (!viewer.onboardingComplete) {
    redirect(getHomePath(viewer));
  }

  return viewer;
}
