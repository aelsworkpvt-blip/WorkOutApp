import type { DashboardSnapshot } from "@/lib/data";
import { SectionHead } from "@/components/section-head";

export function Last7DayHistoryPanel({
  history,
}: {
  history: DashboardSnapshot["last7DayHistory"];
}) {
  return (
    <div className="panel-dark p-6 sm:p-8">
      <SectionHead
        eyebrow="7-day history"
        title="Workout history for the last 7 days."
        description="Every calendar day is shown here, including missed days. Multiple sessions in one day still count as one streak day."
        dark
      />

      <div className="mt-6 space-y-3">
        {history.map((day) => (
          <div
            key={day.dateKey}
            className={
              day.completed
                ? "rounded-[24px] border border-white/10 bg-white/4 p-4"
                : "rounded-[24px] border border-dashed border-white/10 bg-white/2 p-4"
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-white">{day.label}</p>
                  <span
                    className={
                      day.completed
                        ? "rounded-full bg-[#ffd54f] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#151515]"
                        : "rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52"
                    }
                  >
                    {day.completed
                      ? `${day.sessionCount} session${day.sessionCount === 1 ? "" : "s"}`
                      : "Missed"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/58">
                  {day.dayName} {day.dayOfMonth}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-white/8 bg-[#0f1520] px-4 py-3 text-sm text-white/68">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                    Calories
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {day.completed ? day.totalCalories : 0}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/8 bg-[#0f1520] px-4 py-3 text-sm text-white/68">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                    Volume
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {day.completed ? `${day.totalVolumeKg}kg` : "0kg"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {day.sessions.length > 0 ? (
                day.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-[18px] border border-white/8 bg-[#0f1520] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{session.dayName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/42">
                        {session.timeLabel}
                      </p>
                    </div>
                    <div className="text-right text-sm text-white/64">
                      <p>{session.volume}kg volume</p>
                      <p>{session.calories} cal</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-dashed border-white/8 bg-[#0f1520] px-4 py-4 text-sm leading-7 text-white/54">
                  No workout logged on this day.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
