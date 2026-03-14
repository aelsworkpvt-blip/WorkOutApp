import { redirect } from "next/navigation";
import { OnboardingSection } from "@/components/onboarding-section";
import { SetupShell } from "@/components/setup-shell";
import { getOnboardingDefaults } from "@/lib/data";
import { requireSetupViewer } from "@/lib/route-helpers";
import type { SplitKey } from "@/lib/workout-templates";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams: Promise<{
    split?: string;
  }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const viewer = await requireSetupViewer();
  const params = await searchParams;
  const splitParam = params.split;

  if (!viewer.trainingMode) {
    redirect("/mode");
  }

  if (splitParam !== "PPL" && splitParam !== "BRO") {
    redirect("/split");
  }

  const defaults = await getOnboardingDefaults(viewer.id);

  return (
    <SetupShell viewer={viewer}>
      <OnboardingSection
        defaults={defaults}
        selectedSplit={splitParam as SplitKey}
        backHref="/split"
        redirectTo="/dashboard"
      />
    </SetupShell>
  );
}
