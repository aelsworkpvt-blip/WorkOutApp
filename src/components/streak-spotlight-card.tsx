import Link from "next/link";
import { Check, ChevronRight, Flame, Zap } from "lucide-react";
import type { DashboardSnapshot } from "@/lib/data";

type StreakSpotlightCardProps = {
  streak: DashboardSnapshot["streak"];
  userName: string;
  detailHref?: string | null;
  actionLabel?: string;
};

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "Athlete";
}

function getHeadline(streak: DashboardSnapshot["streak"]) {
  if (streak.current > 0) {
    return `${streak.current} Day${streak.current === 1 ? "" : "s"} Streak`;
  }

  return "Start Your Streak";
}

function getSubcopy(streak: DashboardSnapshot["streak"], userName: string) {
  const firstName = getFirstName(userName);

  if (streak.todayCompleted) {
    return `You're doing really great, on fire, ${firstName}!`;
  }

  if (streak.canExtendToday) {
    return `One workout today pushes the fire further, ${firstName}.`;
  }

  if (streak.lastLoggedAtLabel) {
    return `You paused for a bit. Let's light it back up today, ${firstName}.`;
  }

  return `Your first workout log starts the streak, ${firstName}.`;
}

function getCardBackground(streak: DashboardSnapshot["streak"]) {
  if (streak.todayCompleted || streak.canExtendToday) {
    return {
      background:
        "radial-gradient(circle at 50% 6%, rgba(255,245,213,0.95), rgba(255,245,213,0.12) 18%, transparent 32%), linear-gradient(180deg, #ff7b31 0%, #f05c1d 52%, #d84f18 100%)",
      boxShadow: "0 30px 80px rgba(216,79,24,0.32)",
    };
  }

  return {
    background:
      "radial-gradient(circle at 50% 8%, rgba(255,243,255,0.95), rgba(255,243,255,0.12) 18%, transparent 32%), linear-gradient(180deg, #7b4dff 0%, #6a35ff 48%, #4f1fff 100%)",
    boxShadow: "0 30px 80px rgba(79,31,255,0.28)",
  };
}

function isFocusDay(
  day: DashboardSnapshot["streak"]["week"][number],
  streak: DashboardSnapshot["streak"],
) {
  return day.isToday && (streak.todayCompleted || streak.canExtendToday);
}

export function StreakSpotlightCard({
  streak,
  userName,
  detailHref = "/streak",
  actionLabel = "See Details",
}: StreakSpotlightCardProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[34px] border border-white/14 p-6 text-white sm:p-8"
      style={getCardBackground(streak)}
    >
      <div className="pointer-events-none absolute inset-x-8 top-5 h-24 rounded-full bg-white/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-0 h-44 w-44 rounded-full bg-black/10 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-white/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-md">
          <Zap className="h-10 w-10 fill-white text-white drop-shadow-[0_6px_18px_rgba(255,255,255,0.45)]" />
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
          {getHeadline(streak)}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/84 sm:text-base">
          {getSubcopy(streak, userName)}
        </p>

        <div className="mt-7 grid w-full grid-cols-7 gap-2 rounded-[24px] bg-black/14 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:p-4">
          {streak.week.map((day) => {
            const focusDay = isFocusDay(day, streak);
            const done = day.completed && !focusDay;

            return (
              <div key={day.dateKey} className="flex flex-col items-center gap-2">
                <div
                  className={
                    focusDay
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-white/14 text-white shadow-[0_10px_24px_rgba(255,131,68,0.32)] ring-1 ring-white/18"
                      : done
                        ? "flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white ring-1 ring-white/18"
                        : "flex h-9 w-9 items-center justify-center rounded-full border border-white/24 bg-transparent text-white/60"
                  }
                >
                  {focusDay ? (
                    <Flame className="h-4 w-4 fill-[#ffb36c] text-[#ffb36c]" />
                  ) : done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-current/60" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-medium tracking-[0.08em] text-white/76">
                    {day.label}
                  </p>
                  <p className="mt-1 text-[11px] text-white/58">{day.dayOfMonth}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-full bg-white/12 px-4 py-2 text-sm text-white/88 backdrop-blur-md">
            Longest: {streak.longest} day{streak.longest === 1 ? "" : "s"}
          </div>
          <div className="rounded-full bg-white/12 px-4 py-2 text-sm text-white/88 backdrop-blur-md">
            Last 7 days: {streak.completedDaysLast7}/7
          </div>
        </div>

        {detailHref ? (
          <Link
            href={detailHref}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/14 px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] transition hover:bg-white/18"
          >
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
