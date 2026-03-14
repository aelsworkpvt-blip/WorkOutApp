"use client";

import type { OnboardingDefaults } from "@/lib/data";
import { useRouter } from "next/navigation";
import { saveOnboardingAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { SectionHead } from "@/components/section-head";
import { splitOptions, type SplitKey } from "@/lib/workout-templates";

type OnboardingSectionProps = {
  defaults: OnboardingDefaults;
  selectedSplit: SplitKey;
  onBack?: () => void;
  onComplete?: (split: SplitKey) => void;
  backHref?: string;
  redirectTo?: string;
};

export function OnboardingSection({
  defaults,
  selectedSplit,
  onBack,
  onComplete,
  backHref,
  redirectTo = "/dashboard",
}: OnboardingSectionProps) {
  const router = useRouter();
  const split = splitOptions.find((item) => item.key === selectedSplit)!;

  async function handleSubmit(formData: FormData) {
    formData.set("splitPreference", selectedSplit);
    await saveOnboardingAction(formData);

    if (onComplete) {
      onComplete(selectedSplit);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    router.push(backHref ?? "/split");
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="panel-dark p-6 sm:p-8">
        <SectionHead
          eyebrow="Onboarding"
          title="Now collect the body details before the dashboard."
          description="Muscle growth mode is active for now, so this setup is tuned for gaining size, tracking progression, and supporting recovery."
          dark
        />

        <form action={handleSubmit} className="mt-8 grid gap-4">
          <input type="hidden" name="splitPreference" value={selectedSplit} />
          <input type="hidden" name="goalType" value="MUSCLE_GAIN" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-white/68">Name<input name="name" defaultValue={defaults.name} className="field-dark" /></label>
            <label className="text-sm text-white/68">Age<input name="age" type="number" defaultValue={defaults.age} className="field-dark" /></label>
            <label className="text-sm text-white/68">Gender<select name="gender" defaultValue={defaults.gender} className="field-dark"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label>
            <label className="text-sm text-white/68">Height (cm)<input name="heightCm" type="number" defaultValue={defaults.heightCm} className="field-dark" /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-white/68">Weight (kg)<input name="weightKg" type="number" step="0.1" defaultValue={defaults.weightKg} className="field-dark" /></label>
            <div className="rounded-[20px] border border-white/10 bg-white/4 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Mode</p>
              <p className="mt-2 text-sm font-semibold text-white">Muscle Growth</p>
              <p className="mt-2 text-xs leading-6 text-white/50">Other modes are coming soon.</p>
            </div>
            <label className="text-sm text-white/68">Activity<select name="activityLevel" defaultValue={defaults.activityLevel} className="field-dark"><option value="LIGHT">Light</option><option value="MODERATE">Moderate</option><option value="HIGH">High</option><option value="ATHLETE">Athlete</option></select></label>
            <label className="text-sm text-white/68">Experience<select name="experienceLevel" defaultValue={defaults.experienceLevel} className="field-dark"><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-white/68">Target weight<input name="targetWeightKg" type="number" step="0.1" defaultValue={defaults.targetWeightKg ?? ""} className="field-dark" /></label>
            <label className="text-sm text-white/68">Chest (cm)<input name="chestCm" type="number" step="0.1" className="field-dark" /></label>
            <label className="text-sm text-white/68">Waist (cm)<input name="waistCm" type="number" step="0.1" className="field-dark" /></label>
            <label className="text-sm text-white/68">Hips (cm)<input name="hipsCm" type="number" step="0.1" className="field-dark" /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-white/68">Arm<input name="armCm" type="number" step="0.1" className="field-dark" /></label>
            <label className="text-sm text-white/68">Thigh<input name="thighCm" type="number" step="0.1" className="field-dark" /></label>
            <label className="text-sm text-white/68">Calf<input name="calfCm" type="number" step="0.1" className="field-dark" /></label>
            <label className="text-sm text-white/68">Body fat %<input name="bodyFatPct" type="number" step="0.1" className="field-dark" /></label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/6"
            >
              Back to split choice
            </button>
            <SubmitButton pendingLabel="Saving onboarding..." className="bg-[#ffd54f] text-[#161616] hover:bg-[#ffe07a]">
              Continue to dashboard
            </SubmitButton>
          </div>
        </form>
      </div>

      <div className="grid gap-6">
        <div className="panel-light p-6">
          <SectionHead
            eyebrow="Chosen split"
            title={split.label}
            description={split.description}
          />
          <div className="mt-6 rounded-[24px] bg-[#141923] p-5 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Training vibe
            </p>
            <p className="mt-2 text-2xl font-[family:var(--font-sora)]">{split.vibe}</p>
            <p className="mt-4 text-sm leading-7 text-white/64">
              After onboarding, the user lands on the dashboard and can choose the
              exact day to train today.
            </p>
          </div>
        </div>

        <div className="panel-dark p-6">
          <SectionHead
            eyebrow="What unlocks next"
            title="Dashboard only after onboarding."
            description="The next screen gives day selection, available workouts, logging, and workout memory."
            dark
          />
          <div className="mt-6 grid gap-3">
            {[
              "Choose today's area: Push, Pull, Legs, Chest, Shoulders, Arms, or Back.",
              "See all workouts available for that area.",
              "Pick the exercises you want to perform and log sets, reps, and weight.",
              "See the last performance so progression feels obvious.",
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
