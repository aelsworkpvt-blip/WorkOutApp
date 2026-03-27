"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Layers3, Sparkles } from "lucide-react";
import { selectTrainingModeAction } from "@/app/actions";

const modes = [
  {
    key: "MUSCLE_GROWTH",
    label: "Muscle Growth",
    description:
      "Built for lifters who want size, strength progression, workout memory, and structured split training.",
    accent: "#ffd54f",
    icon: Sparkles,
    cta: "Start muscle growth",
    available: true,
  },
  {
    key: "FAT_LOSS",
    label: "Fat Loss",
    description:
      "Calorie-focused training flow with bodyweight reduction, conditioning support, and tighter recovery tracking.",
    accent: "#79d2c0",
    icon: Flame,
    cta: "Coming soon",
    available: false,
  },
  {
    key: "BODY_RECOMPOSITION",
    label: "Body Recomposition",
    description:
      "A mode for gaining muscle while trimming fat with smarter nutrition targets and progress balancing.",
    accent: "#ff9f68",
    icon: Layers3,
    cta: "Coming soon",
    available: false,
  },
] as const;

export function TrainingModeSection() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<string | null>(null);

  async function handleMuscleGrowthSelection(formData: FormData) {
    setPendingMode("MUSCLE_GROWTH");
    const result = await selectTrainingModeAction(formData);
    setPendingMode(null);

    if (!result.success) {
      setMessage(result.error ?? "Unable to save the mode right now.");
      return;
    }

    setMessage(null);
    startTransition(() => {
      router.push("/split");
      router.refresh();
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="panel-dark p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-white/45">
          Training mode
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-[family:var(--font-sora)] text-white sm:text-5xl">
          Choose your training direction before the split.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
          Muscle Growth is the live experience right now. Fat Loss and Body
          Recomposition stay here as visible roadmap modes, but they remain
          locked until those systems are ready.
        </p>

        <div className="mt-8 grid gap-3">
          {[
            "Muscle Growth is the only live path right now.",
            "Once you choose it, the app continues into split selection and onboarding.",
            "The other two modes stay visible on purpose so the roadmap feels obvious, but they are intentionally locked for now.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68"
            >
              {item}
            </div>
          ))}
        </div>

        {message ? (
          <div className="mt-6 rounded-[22px] border border-[#f1c27d] bg-[#fff2dd] px-4 py-4 text-sm text-[#8b5f17]">
            {message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        {modes.map((mode) =>
          mode.available ? (
            <form
              key={mode.key}
              action={handleMuscleGrowthSelection}
              className="panel-light p-6"
            >
              <input type="hidden" name="trainingMode" value={mode.key} />
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: mode.accent }}
                >
                  <mode.icon className="h-5 w-5 text-[#171717]" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-light)]">
                    Available now
                  </p>
                  <h2 className="mt-1 text-3xl font-[family:var(--font-sora)] text-[#191714]">
                    {mode.label}
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-light)]">
                {mode.description}
              </p>
              <button
                type="submit"
                disabled={pendingMode === mode.key}
                className="mt-6 inline-flex rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b] disabled:opacity-60"
              >
                {pendingMode === mode.key ? "Opening..." : mode.cta}
              </button>
            </form>
          ) : (
            <button
              key={mode.key}
              type="button"
              onClick={() =>
                setMessage(`${mode.label} is coming soon. For now, continue with Muscle Growth.`)
              }
              className="panel-light p-6 text-left transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: mode.accent }}
                >
                  <mode.icon className="h-5 w-5 text-[#171717]" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-light)]">
                    Coming soon
                  </p>
                  <h2 className="mt-1 text-3xl font-[family:var(--font-sora)] text-[#191714]">
                    {mode.label}
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-light)]">
                {mode.description}
              </p>
              <span className="mt-6 inline-flex rounded-full border border-black/8 bg-white/72 px-4 py-2 text-sm font-semibold text-[#171717]">
                {mode.cta}
              </span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}
