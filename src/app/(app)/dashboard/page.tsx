import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronRight, Flame, Target, Utensils } from "lucide-react";
import { DashboardHero } from "@/components/dashboard-hero";
import { SectionHead } from "@/components/section-head";
import { StreakSpotlightCard } from "@/components/streak-spotlight-card";
import { getDashboardSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  if (!dashboard) {
    redirect("/");
  }

  const todayPlan = dashboard.todayPlan;

  return (
    <div className="grid gap-6">
      <StreakSpotlightCard
        streak={dashboard.streak}
        userName={dashboard.profile.name}
      />

      <DashboardHero data={dashboard} activePlan={todayPlan} />

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="panel-light p-6 sm:p-8">
          <SectionHead
            eyebrow="Today"
            title="Your day starts from one focused decision."
            description="Use the dashboard as the quick read, then jump into the workout picker or weekly page for the deeper actions."
          />

          <div className="mt-6 grid gap-4">
            <Link
              href={`/workouts?day=${todayPlan.slug}`}
              className="rounded-[26px] bg-[#171717] p-5 text-white transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Ready to train
                  </p>
                  <h3 className="mt-2 text-2xl font-[family:var(--font-sora)]">
                    Open {todayPlan.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/65">
                    {todayPlan.exerciseCount} exercises queued with workout memory
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 text-[#ffd54f]" />
              </div>
            </Link>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/72 p-5">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                  <Target className="h-4 w-4 text-[#ff9f68]" />
                  Goal pace
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#171717]">
                  {dashboard.completion.percent}%
                </p>
                <p className="mt-2 text-sm text-[var(--muted-light)]">
                  {dashboard.completion.workoutsCompleted}/{dashboard.completion.workoutTarget} workouts this week
                </p>
              </div>

              <div className="rounded-[24px] bg-white/72 p-5">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                  <Flame className="h-4 w-4 text-[#ffd54f]" />
                  Weekly burn
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#171717]">
                  {dashboard.completion.weeklyCaloriesBurned}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-light)]">
                  Calories estimated from your logged sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div id="fuel" className="panel-dark p-6 sm:p-8">
          <SectionHead
            eyebrow="Fuel"
            title="Macros and calories live on the dashboard."
            description="The quick nutrition read stays here so workout and weekly pages can stay clean and focused on their own jobs."
            dark
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Calories",
                value: `${dashboard.nutrition.calories}`,
                detail: "Daily target",
                icon: Flame,
                accent: "#ffd54f",
              },
              {
                label: "Protein",
                value: `${dashboard.nutrition.proteinG}g`,
                detail: "Muscle support",
                icon: Utensils,
                accent: "#79d2c0",
              },
              {
                label: "Carbs",
                value: `${dashboard.nutrition.carbsG}g`,
                detail: "Training energy",
                icon: Utensils,
                accent: "#8db4ff",
              },
              {
                label: "Fat + Fiber",
                value: `${dashboard.nutrition.fatG}g / ${dashboard.nutrition.fiberG}g`,
                detail: "Recovery and digestion",
                icon: Utensils,
                accent: "#ff9f68",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/8 bg-white/4 p-5">
                <div className="flex items-center gap-2 text-sm text-white/55">
                  <item.icon className="h-4 w-4" style={{ color: item.accent }} />
                  {item.label}
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-white/58">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <CalendarRange className="h-4 w-4 text-[#ffd54f]" />
              Weekly digest teaser
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              {dashboard.weeklyDigest.highlight}
            </p>
            <p className="mt-2 text-sm leading-7 text-white/64">
              Want the full measurement and weekly review? Open the weekly progress
              page for charts, check-in, and the weekly recap.
            </p>
            <Link
              href="/progress"
              className="mt-5 inline-flex rounded-full bg-[#ffd54f] px-4 py-2 text-sm font-semibold text-[#171717]"
            >
              Open weekly page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
