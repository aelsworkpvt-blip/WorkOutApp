import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, Dumbbell, Flame, HeartPulse } from "lucide-react";
import { Last7DayHistoryPanel } from "@/components/last-7-day-history-panel";
import { SectionHead } from "@/components/section-head";
import { WorkoutCalendarPanel } from "@/components/workout-calendar-panel";
import { getDashboardSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  if (!dashboard) {
    redirect("/");
  }

  return (
    <div className="grid gap-6">
      <section className="panel-dark p-6 sm:p-8">
        <SectionHead
          eyebrow="History"
          title="Your training record, without digging."
          description="History now has its own home. See your monthly workout calendar, the last 7 days, and recent sessions from one clean page."
          dark
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <HeartPulse className="h-4 w-4 text-[#ff9f68]" />
              Active streak
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.streak.current} day{dashboard.streak.current === 1 ? "" : "s"}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <CalendarRange className="h-4 w-4 text-[#79d2c0]" />
              Month active days
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.workoutCalendar.activeDays}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <Dumbbell className="h-4 w-4 text-[#ffd54f]" />
              Month sessions
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.workoutCalendar.totalSessions}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <Flame className="h-4 w-4 text-[#ffb36c]" />
              Last 7 active days
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.streak.completedDaysLast7}/7
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/workouts?day=${dashboard.todayPlan.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-[#ffd54f] px-4 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#ffe07a]"
          >
            <Dumbbell className="h-4 w-4" />
            Open workouts
          </Link>
          <Link
            href="/streak"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
          >
            Open streak detail
          </Link>
        </div>
      </section>

      <WorkoutCalendarPanel calendar={dashboard.workoutCalendar} />

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Last7DayHistoryPanel history={dashboard.last7DayHistory} />

        <div className="panel-light p-6 sm:p-8">
          <SectionHead
            eyebrow="Recent sessions"
            title="Fast lookup for the latest training blocks."
            description="This stays useful when you want a quick answer without opening a specific day."
          />

          <div className="mt-6 space-y-3">
            {dashboard.recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-[22px] bg-white/72 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#171717]">{session.dayName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted-light)]">
                    {session.label}
                  </p>
                </div>
                <div className="text-right text-sm text-[var(--muted-light)]">
                  <p>{session.volume}kg volume</p>
                  <p>{session.calories} cal</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
