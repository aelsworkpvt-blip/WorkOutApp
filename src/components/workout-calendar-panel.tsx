import { CalendarRange, Dumbbell, Trophy } from "lucide-react";
import type { DashboardSnapshot } from "@/lib/data";
import { SectionHead } from "@/components/section-head";

export function WorkoutCalendarPanel({
  calendar,
}: {
  calendar: DashboardSnapshot["workoutCalendar"];
}) {
  return (
    <div className="panel-light p-6 sm:p-8">
      <SectionHead
        eyebrow="Workout calendar"
        title={`${calendar.monthLabel} at a glance.`}
        description="The calendar marks every workout day in the current month so consistency is visible without opening individual logs."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] bg-white/72 p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
            <CalendarRange className="h-4 w-4 text-[#79d2c0]" />
            Active days
          </div>
          <p className="mt-3 text-3xl font-semibold text-[#171717]">
            {calendar.activeDays}
          </p>
        </div>
        <div className="rounded-[24px] bg-white/72 p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
            <Dumbbell className="h-4 w-4 text-[#ff9f68]" />
            Sessions
          </div>
          <p className="mt-3 text-3xl font-semibold text-[#171717]">
            {calendar.totalSessions}
          </p>
        </div>
        <div className="rounded-[24px] bg-white/72 p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
            <Trophy className="h-4 w-4 text-[#ffd54f]" />
            Volume
          </div>
          <p className="mt-3 text-3xl font-semibold text-[#171717]">
            {calendar.totalVolumeKg}kg
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-7 gap-2">
          {calendar.weekdays.map((weekday) => (
            <div
              key={weekday}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-light)]"
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendar.days.map((day) => (
            <div
              key={day.dateKey}
              className={
                day.isCurrentMonth
                  ? day.completed
                    ? "min-h-[108px] rounded-[20px] border border-transparent bg-[#171717] px-3 py-3 text-white"
                    : day.isToday
                      ? "min-h-[108px] rounded-[20px] border border-dashed border-[#79d2c0] bg-white px-3 py-3 text-[#171717]"
                      : "min-h-[108px] rounded-[20px] bg-white px-3 py-3 text-[#171717]"
                  : "min-h-[108px] rounded-[20px] bg-white/40 px-3 py-3 text-[#171717]/42"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{day.dayOfMonth}</p>
                {day.completed ? (
                  <span className="rounded-full bg-[#ffd54f] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#151515]">
                    {day.sessionCount}x
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-1 text-[11px] leading-5">
                <p
                  className={
                    day.isCurrentMonth
                      ? day.completed
                        ? "text-white/72"
                        : "text-[var(--muted-light)]"
                      : "text-inherit"
                  }
                >
                  {day.label}
                </p>
                <p
                  className={
                    day.completed
                      ? "text-white/78"
                      : day.isCurrentMonth
                        ? "text-[var(--muted-light)]"
                        : "text-inherit"
                  }
                >
                  {day.completed
                    ? `${day.totalVolumeKg}kg`
                    : day.isToday
                      ? "Open day"
                      : "No workout"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
