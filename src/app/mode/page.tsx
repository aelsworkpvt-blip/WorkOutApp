import { redirect } from "next/navigation";
import { SetupShell } from "@/components/setup-shell";
import { TrainingModeSection } from "@/components/training-mode-section";
import { getHomePath, requireSetupViewer } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

export default async function ModePage() {
  const viewer = await requireSetupViewer();

  if (viewer.trainingMode) {
    redirect(getHomePath(viewer));
  }

  return (
    <SetupShell viewer={viewer}>
      <TrainingModeSection />
    </SetupShell>
  );
}
