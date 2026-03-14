import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupShell } from "@/components/setup-shell";
import { requireSetupViewer } from "@/lib/route-helpers";
import { splitOptions } from "@/lib/workout-templates";

export const dynamic = "force-dynamic";

export default async function SplitPage() {
  const viewer = await requireSetupViewer();

  if (!viewer.trainingMode) {
    redirect("/mode");
  }

  if (viewer.splitPreference) {
    redirect(`/onboarding?split=${viewer.splitPreference}`);
  }

  return (
    <SetupShell viewer={viewer}>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-dark p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-white/45">
            Split first
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-[family:var(--font-sora)] text-white sm:text-5xl">
            Choose the training style before the app builds your workout flow.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
            On mobile this is now its own clean screen. Pick the split, move into
            onboarding, then land on the dashboard only after setup is done.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              "Push Pull Legs gives a simple rhythm for lifters who want repeatable progression.",
              "Bro Split gives body-part focus when you want chest, back, shoulders, arms, and legs on separate days.",
              "You can still choose the exact workout day later from the workout picker page.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {splitOptions.map((option) => (
            <Link
              key={option.key}
              href={`/onboarding?split=${option.key}`}
              className="panel-light p-6 transition hover:-translate-y-0.5"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-light)]">
                {option.vibe}
              </p>
              <h2 className="mt-3 text-3xl font-[family:var(--font-sora)] text-[#191714]">
                {option.label}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-light)]">
                {option.description}
              </p>
              <span className="mt-6 inline-flex rounded-full bg-[#171717] px-4 py-2 text-sm font-semibold text-white">
                Choose {option.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </SetupShell>
  );
}
