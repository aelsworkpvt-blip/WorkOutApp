import type { DashboardSnapshot } from "@/lib/data";

type StreakBoardProps = {
  streak: DashboardSnapshot["streak"];
  tone?: "dark" | "light";
};

function getStatusMessage(streak: DashboardSnapshot["streak"]) {
  if (streak.todayCompleted) {
    return "Today's workout input is locked in. Show up again tomorrow to keep the chain alive.";
  }

  if (streak.canExtendToday) {
    return `Yesterday is covered. Log today's workout to push the streak to ${streak.current + 1} days.`;
  }

  if (streak.lastLoggedAtLabel) {
    return `Last input was ${streak.lastLoggedAtLabel}. Log today to restart the streak.`;
  }

  return "No daily workout inputs yet. Your first log starts the streak.";
}

function getStatusBadge(streak: DashboardSnapshot["streak"]) {
  if (streak.todayCompleted) {
    return "Today done";
  }

  if (streak.canExtendToday) {
    return "Log today";
  }

  if (streak.lastLoggedAtLabel) {
    return "Restart today";
  }

  return "Start now";
}

export function StreakBoard({
  streak,
  tone = "dark",
}: StreakBoardProps) {
  const dark = tone === "dark";
  const shellClassName = dark
    ? "rounded-[26px] border border-white/8 bg-white/4 p-5 sm:p-6"
    : "rounded-[26px] bg-white/72 p-5 sm:p-6";
  const cardClassName = dark
    ? "rounded-[22px] border border-white/10 bg-[#0f1520] p-4"
    : "rounded-[22px] bg-white p-4";
  const eyebrowClassName = dark
    ? "text-[11px] uppercase tracking-[0.24em] text-white/40"
    : "text-[11px] uppercase tracking-[0.24em] text-[var(--muted-light)]";
  const bodyClassName = dark ? "text-white/68" : "text-[var(--muted-light)]";
  const headlineValueClassName = dark ? "text-white" : "text-[#171717]";
  const secondaryValueClassName = dark ? "text-white" : "text-[#171717]";
  const activityLabelClassName = dark ? "text-white/40" : "text-[var(--muted-light)]";

  return (
    <section className={shellClassName}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className={eyebrowClassName}>Daily streak</p>
            <span className="rounded-full bg-[#ffd54f] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#151515]">
              {getStatusBadge(streak)}
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <p className={`text-5xl font-semibold sm:text-6xl ${headlineValueClassName}`}>
              {streak.current}
            </p>
            <p className={`${bodyClassName} pb-2 text-sm uppercase tracking-[0.22em]`}>
              day{streak.current === 1 ? "" : "s"}
            </p>
          </div>

          <p className={`mt-4 max-w-2xl text-sm leading-7 ${bodyClassName}`}>
            {getStatusMessage(streak)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <div className={cardClassName}>
            <p className={eyebrowClassName}>Longest</p>
            <p className={`mt-3 text-2xl font-semibold ${secondaryValueClassName}`}>
              {streak.longest}d
            </p>
            <p className={`mt-2 text-sm ${bodyClassName}`}>Best run so far</p>
          </div>
          <div className={cardClassName}>
            <p className={eyebrowClassName}>Last input</p>
            <p className={`mt-3 text-2xl font-semibold ${secondaryValueClassName}`}>
              {streak.lastLoggedAtLabel ?? "None"}
            </p>
            <p className={`mt-2 text-sm ${bodyClassName}`}>Most recent logged day</p>
          </div>
          <div className={cardClassName}>
            <p className={eyebrowClassName}>Last 7 days</p>
            <p className={`mt-3 text-2xl font-semibold ${secondaryValueClassName}`}>
              {streak.completedDaysLast7}/7
            </p>
            <p className={`mt-2 text-sm ${bodyClassName}`}>Days with workout input</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {streak.week.map((day) => (
          <div
            key={day.dateKey}
            className={
              day.completed
                ? "rounded-[20px] border border-transparent bg-[#ffd54f] px-3 py-4 text-center text-[#151515]"
                : day.isToday
                  ? dark
                    ? "rounded-[20px] border border-dashed border-[#79d2c0]/60 bg-[#0f1520] px-3 py-4 text-center text-white"
                    : "rounded-[20px] border border-dashed border-[#79d2c0] bg-white px-3 py-4 text-center text-[#171717]"
                  : dark
                    ? "rounded-[20px] border border-white/8 bg-[#0f1520] px-3 py-4 text-center text-white"
                    : "rounded-[20px] bg-white px-3 py-4 text-center text-[#171717]"
            }
          >
            <p className={`text-[11px] uppercase tracking-[0.18em] ${day.completed ? "text-[#151515]/65" : activityLabelClassName}`}>
              {day.label}
            </p>
            <p className="mt-3 text-xl font-semibold">{day.dayOfMonth}</p>
            <p className={`mt-2 text-xs ${day.completed ? "text-[#151515]/72" : bodyClassName}`}>
              {day.completed ? "Done" : day.isToday ? "Open" : "Rest"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
