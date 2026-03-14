"use client";

import { BarChart3, Dumbbell, Flame, Gauge } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { AuthSection } from "@/components/auth-section";
import { DashboardHero } from "@/components/dashboard-hero";
import { OnboardingSection } from "@/components/onboarding-section";
import { ProgressSection } from "@/components/progress-section";
import { WorkoutSection } from "@/components/workout-section";
import type { DashboardSnapshot, OnboardingDefaults, ViewerState } from "@/lib/data";
import { splitOptions, type SplitKey } from "@/lib/workout-templates";

type FlowStep = "auth" | "split" | "onboarding" | "dashboard";

function getInitialStep(
  viewer: ViewerState | null,
  dashboard: DashboardSnapshot | null,
): FlowStep {
  if (!viewer) {
    return "auth";
  }

  if (viewer.onboardingComplete && dashboard) {
    return "dashboard";
  }

  return "split";
}

export function AppFlow({
  viewer,
  onboardingDefaults,
  dashboard,
}: {
  viewer: ViewerState | null;
  onboardingDefaults: OnboardingDefaults;
  dashboard: DashboardSnapshot | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>(() =>
    getInitialStep(viewer, dashboard),
  );
  const [selectedSplit, setSelectedSplit] = useState<SplitKey>(
    viewer?.splitPreference ?? "PPL",
  );
  const [activeDaySlug, setActiveDaySlug] = useState(dashboard?.todayPlan.slug ?? "");

  const navItems = [
    { href: "#dashboard", label: "Pulse", icon: Gauge },
    { href: "#workout", label: "Workout", icon: Dumbbell },
    { href: "#progress", label: "Progress", icon: BarChart3 },
    { href: "#fuel", label: "Fuel", icon: Flame },
  ];

  const activePlan = dashboard
    ? dashboard.workoutPlans.find((plan) => plan.slug === activeDaySlug) ??
      dashboard.todayPlan
    : null;

  async function handleLogout() {
    await logoutAction();
    setStep("auth");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <main className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {viewer && step !== "auth" ? (
          <div className="panel-light flex flex-col gap-3 p-4 text-sm text-[var(--muted-light)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted-light)]/75">
                Account active
              </span>
              <span className="font-semibold text-[#171717]">
                {viewer.email ?? "Signed in athlete"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#171717] px-4 py-2 font-semibold text-white transition hover:bg-[#2b2b2b]"
            >
              Logout
            </button>
          </div>
        ) : null}

        {step === "auth" ? <AuthSection /> : null}

        {step === "split" ? (
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="panel-dark p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Forge Motion
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-[family:var(--font-sora)] text-white sm:text-5xl">
                Start with the split. Dashboard comes later.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                First choose `Push Pull Legs` or `Bro Split`. After that the user
                goes through onboarding, and only then lands on the dashboard.
              </p>
            </div>

            <div className="grid gap-4">
              {splitOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setSelectedSplit(option.key);
                    setStep("onboarding");
                  }}
                  className="panel-light text-left p-6 transition hover:-translate-y-0.5"
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
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === "onboarding" ? (
          <OnboardingSection
            defaults={onboardingDefaults}
            selectedSplit={selectedSplit}
            onBack={() => setStep("split")}
            onComplete={(split) => {
              setSelectedSplit(split);
              setStep("dashboard");
              startTransition(() => {
                router.refresh();
              });
            }}
          />
        ) : null}

        {step === "dashboard" && dashboard && activePlan && viewer ? (
          <>
            <DashboardHero data={dashboard} activePlan={activePlan} />
            <WorkoutSection
              data={dashboard}
              activePlan={activePlan}
              activeDaySlug={activeDaySlug}
              onSelectDay={setActiveDaySlug}
            />
            <ProgressSection data={dashboard} />

            <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-4 md:hidden">
              <div className="flex items-center gap-2 rounded-full border border-white/12 bg-[#111622]/94 px-3 py-2 shadow-[0_20px_60px_rgba(10,14,22,0.28)] backdrop-blur-xl">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/78 transition hover:bg-white/8"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
