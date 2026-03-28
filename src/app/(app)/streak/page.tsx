import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronLeft, Dumbbell, Trophy } from "lucide-react";
import { GymAlarmSettings } from "@/components/gym-alarm-settings";
import { Last7DayHistoryPanel } from "@/components/last-7-day-history-panel";
import { SectionHead } from "@/components/section-head";
import { StreakBoard } from "@/components/streak-board";
import { StreakSpotlightCard } from "@/components/streak-spotlight-card";
import { WorkoutCalendarPanel } from "@/components/workout-calendar-panel";
import { getDashboardSnapshot, type DashboardSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

function getStreakStatusCopy(streak: DashboardSnapshot["streak"]) {
  if (streak.todayCompleted) {
    return "Today's training input is already locked in. Recovery matters now, then come back tomorrow to protect the chain.";
  }

  if (streak.canExtendToday) {
    return "Yesterday is covered. One workout log today keeps the momentum alive and pushes the streak higher.";
  }

  if (streak.lastLoggedAtLabel) {
    return "The chain is currently broken, but the next workout log starts a fresh run immediately.";
  }

  return "No streak yet. The first workout day you log becomes day one.";
}

export default async function StreakPage() {
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  if (!dashboard) {
    redirect("/");
  }

  return (
    <div className="grid gap-6">
      <section className="panel-dark p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHead
            eyebrow="Streak detail"
            title="Consistency should feel visible the second you open the app."
            description="This page turns the streak into a real feature instead of a tiny stat. You can see the live run, your best run, and the last seven days at a glance."
            dark
          />

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-white/84 transition hover:bg-white/8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="mt-6">
          <StreakSpotlightCard
            streak={dashboard.streak}
            userName={dashboard.profile.name}
            detailHref={null}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-dark p-6 sm:p-8">
          <StreakBoard streak={dashboard.streak} tone="dark" />
        </div>

        <div className="grid gap-6">
          <div className="panel-light p-6 sm:p-8">
            <SectionHead
              eyebrow="Live status"
              title="What the streak means right now."
              description={getStreakStatusCopy(dashboard.streak)}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/72 p-5">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                  <Trophy className="h-4 w-4 text-[#ff9f68]" />
                  Longest run
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#171717]">
                  {dashboard.streak.longest} day{dashboard.streak.longest === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/72 p-5">
                <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                  <CalendarRange className="h-4 w-4 text-[#79d2c0]" />
                  Last active
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#171717]">
                  {dashboard.streak.lastLoggedAtLabel ?? "None"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/workouts?day=${dashboard.todayPlan.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
              >
                <Dumbbell className="h-4 w-4" />
                {dashboard.streak.todayCompleted ? "Open workout page" : "Log today's workout"}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-semibold text-[#171717] transition hover:bg-white/88"
              >
                Return home
              </Link>
            </div>
          </div>

          <WorkoutCalendarPanel calendar={dashboard.workoutCalendar} />

          <GymAlarmSettings todayCompleted={dashboard.streak.todayCompleted} />

          <Last7DayHistoryPanel history={dashboard.last7DayHistory} />
        </div>
      </section>
    </div>
  );
}
