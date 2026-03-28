"use client";

import Link from "next/link";
import { BarChart3, Dumbbell, Flame, Gauge, HeartPulse, Scale } from "lucide-react";
import type { DashboardSnapshot } from "@/lib/data";

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#ffd54f ${value}%, rgba(255,255,255,0.08) ${value}% 100%)`,
      }}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#111622]">
        <span className="text-lg font-semibold text-white">{value}%</span>
      </div>
    </div>
  );
}

export function DashboardHero({
  data,
  activePlan,
}: {
  data: DashboardSnapshot;
  activePlan: DashboardSnapshot["workoutPlans"][number];
}) {
  const nav = [
    { href: "/workouts", label: "Workout", icon: Dumbbell },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "#fuel", label: "Fuel", icon: Flame },
  ];

  return (
    <section id="dashboard" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="panel-dark p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-white/45">
          FitX
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-[family:var(--font-sora)] text-white sm:text-5xl">
          Train with memory, not guesswork.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
          Every set remembers your last win. Your next workout shows the load,
          rep target, body progress, calories, and weekly digest in one place.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.heroStats.map((stat) => (
            <div key={stat.label} className="panel-dark-soft p-5">
              <p className="text-sm text-white/50">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-white/58">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-dark-soft flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-white/55">Weekly target lock</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/40">
                {data.completion.workoutsCompleted}/{data.completion.workoutTarget} sessions
              </p>
            </div>
            <ProgressRing value={data.completion.percent} />
          </div>

          <div className="panel-dark-soft p-5">
            <div className="flex flex-wrap items-center gap-2">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {data.insights.map((insight) => (
                <div
                  key={insight}
                  className="rounded-[20px] border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-white/70"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel-light p-5 sm:p-6">
        <div className="panel-dark p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                Today&apos;s focus
              </p>
              <h2 className="mt-2 text-2xl font-[family:var(--font-sora)] text-white">
                {activePlan.name}
              </h2>
              <p className="mt-2 text-sm text-white/62">{activePlan.focus}</p>
            </div>
            <div
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#151515]"
              style={{ backgroundColor: activePlan.accent }}
            >
              {activePlan.estimatedMinutes} min
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {data.planDays.map((day) => (
              <div
                key={day.id}
                className={
                  day.slug === activePlan.slug
                    ? "rounded-[22px] border border-transparent bg-white/10 px-4 py-4"
                    : "rounded-[22px] border border-white/8 bg-white/4 px-4 py-4"
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{day.name}</p>
                    <p className="mt-1 text-xs text-white/58">{day.focus}</p>
                  </div>
                  <div className="text-right text-xs text-white/55">
                    <p>{day.exerciseCount} lifts</p>
                    <p>{day.estimatedMinutes} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-white/55">
                <Gauge className="h-4 w-4 text-[#ffd54f]" />
                Pace
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{data.completion.percent}%</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-white/55">
                <Scale className="h-4 w-4 text-[#79d2c0]" />
                Weight
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">
                {data.profile.currentWeightKg}kg
              </p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2 text-white/55">
                <HeartPulse className="h-4 w-4 text-[#ff9f68]" />
                Daily streak
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">
                {data.completion.streak}d
              </p>
              <p className="mt-2 text-sm text-white/58">
                {data.streak.todayCompleted
                  ? "Logged today"
                  : data.streak.canExtendToday
                    ? "Ready for today's log"
                    : data.streak.lastLoggedAtLabel
                      ? "Restart with today's log"
                      : "First log starts it"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
