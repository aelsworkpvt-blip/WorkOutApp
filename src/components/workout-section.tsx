"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import type { DashboardSnapshot } from "@/lib/data";
import { logWorkoutAction } from "@/app/actions";
import { SectionHead } from "@/components/section-head";
import { SubmitButton } from "@/components/submit-button";

type WorkoutSectionProps = {
  data: DashboardSnapshot;
  activePlan: DashboardSnapshot["workoutPlans"][number];
  activeDaySlug: string;
  onSelectDay?: (slug: string) => void;
  dayHrefBase?: string;
  showSidebar?: boolean;
  compactIntro?: boolean;
};

export function WorkoutSection({
  data,
  activePlan,
  activeDaySlug,
  onSelectDay,
  dayHrefBase,
  showSidebar = true,
  compactIntro = false,
}: WorkoutSectionProps) {
  const sectionClassName = showSidebar
    ? "grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
    : "grid gap-6";
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const selectedExercise =
    activePlan.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;

  useEffect(() => {
    if (!selectedExerciseId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedExerciseId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedExerciseId]);

  async function handleLogWorkout(formData: FormData) {
    await logWorkoutAction(formData);
    setSelectedExerciseId(null);
  }

  return (
    <section id="workout" className={sectionClassName}>
      <div className="panel-dark p-6 sm:p-8">
        {compactIntro ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">
              Workout picker
            </p>
            <h1 className="mt-3 text-3xl font-[family:var(--font-sora)] text-white sm:text-4xl">
              {activePlan.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/62">
              {activePlan.focus}
            </p>
          </div>
        ) : (
          <SectionHead
            eyebrow="Workout picker"
            title="Choose today&apos;s day first, then pick from all available workouts."
            description="If it is Bro Split, choose Chest or Shoulders. If it is PPL, choose Push, Pull, or Legs. Then log only the exercises you want."
            dark
          />
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {data.planDays.map((day) => (
            dayHrefBase ? (
              <Link
                key={day.id}
                href={`${dayHrefBase}?day=${day.slug}`}
                className={
                  day.slug === activeDaySlug
                    ? "rounded-full px-4 py-3 text-sm font-semibold text-[#151515]"
                    : "rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white/72"
                }
                style={
                  day.slug === activeDaySlug
                    ? { backgroundColor: activePlan.accent }
                    : undefined
                }
              >
                {day.name}
              </Link>
            ) : (
              <button
                key={day.id}
                type="button"
                onClick={() => onSelectDay?.(day.slug)}
                className={
                  day.slug === activeDaySlug
                    ? "rounded-full px-4 py-3 text-sm font-semibold text-[#151515]"
                    : "rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white/72"
                }
                style={
                  day.slug === activeDaySlug
                    ? { backgroundColor: activePlan.accent }
                    : undefined
                }
              >
                {day.name}
              </button>
            )
          ))}
        </div>

        {!compactIntro ? (
          <div className="mt-6 rounded-[26px] border border-white/8 bg-white/4 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                  Selected workout area
                </p>
                <h3 className="mt-2 text-2xl font-[family:var(--font-sora)] text-white">
                  {activePlan.name}
                </h3>
                <p className="mt-2 text-sm text-white/62">{activePlan.focus}</p>
              </div>
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/74">
                {activePlan.exerciseCount} available exercises
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {activePlan.exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => setSelectedExerciseId(exercise.id)}
              className="group rounded-[26px] border border-white/8 bg-white/4 p-4 text-left transition hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/6 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#171717]"
                    style={{ backgroundColor: activePlan.accent }}
                  >
                    {exercise.muscleGroup}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/48">
                    {exercise.equipment}
                  </span>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/48 transition group-hover:text-white/78">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-4 text-xl font-[family:var(--font-sora)] text-white sm:text-2xl">
                {exercise.name}
              </h3>
              <p className="mt-2 text-sm text-white/62">
                {exercise.targetSets} sets | {exercise.repRangeLabel} | {exercise.restSeconds}s rest
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedExercise ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(8,11,18,0.72)] p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedExerciseId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedExercise.name} workout dialog`}
            className="panel-dark w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#171717]"
                    style={{ backgroundColor: activePlan.accent }}
                  >
                    {selectedExercise.muscleGroup}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/48">
                    {selectedExercise.equipment}
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Exercise details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExerciseId(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/76 transition hover:bg-white/8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 text-3xl font-[family:var(--font-sora)] text-white">
              {selectedExercise.name}
            </h3>
            <p className="mt-2 text-sm text-white/62">
              {selectedExercise.targetSets} sets | {selectedExercise.repRangeLabel} | {selectedExercise.restSeconds}s rest
            </p>
            <p className="mt-5 max-w-xl text-sm leading-8 text-white/68">
              {selectedExercise.progressCue}
            </p>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4 text-sm leading-7 text-white/74">
              {selectedExercise.lastLog ? (
                <>
                  <p className="text-white/44">Last workout memory</p>
                  <p className="mt-2">
                    {selectedExercise.lastLog.performedAtLabel}: {selectedExercise.lastLog.setsCompleted} x {selectedExercise.lastLog.repsCompleted} @ {selectedExercise.lastLog.weightKg}kg
                  </p>
                  <p className="mt-2 text-[#ffd54f]">
                    {selectedExercise.suggestionLabel}: try {selectedExercise.suggestedWeightKg ?? selectedExercise.lastLog.weightKg}kg / {selectedExercise.suggestedReps ?? selectedExercise.lastLog.repsCompleted} reps
                  </p>
                </>
              ) : (
                <p>No history yet. Your first log will create the baseline.</p>
              )}
            </div>

            <form action={handleLogWorkout} className="panel-dark-soft mt-5 p-4 sm:p-5">
              <input type="hidden" name="dayTemplateId" value={activePlan.id} />
              <input type="hidden" name="exerciseTemplateId" value={selectedExercise.id} />
              <div className="grid grid-cols-3 gap-3">
                <label className="text-xs uppercase tracking-[0.18em] text-white/45">Sets<input name="setsCompleted" type="number" defaultValue={selectedExercise.targetSets} className="field-dark mt-2" /></label>
                <label className="text-xs uppercase tracking-[0.18em] text-white/45">Reps<input name="repsCompleted" type="number" defaultValue={selectedExercise.suggestedReps ?? selectedExercise.lastLog?.repsCompleted ?? 8} className="field-dark mt-2" /></label>
                <label className="text-xs uppercase tracking-[0.18em] text-white/45">Kg<input name="weightKg" type="number" step="0.5" defaultValue={selectedExercise.suggestedWeightKg ?? selectedExercise.lastLog?.weightKg ?? 20} className="field-dark mt-2" /></label>
              </div>
              <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-white/45">
                Notes
                <textarea
                  name="notes"
                  rows={3}
                  className="field-dark mt-2 min-h-[96px] resize-none"
                  placeholder="Pump, bar speed, technique..."
                />
              </label>
              <div className="mt-5 space-y-3">
                <p className="text-xs leading-6 text-white/44">
                  Log only the exercises you perform today.
                </p>
                <SubmitButton pendingLabel="Logging..." className="w-full bg-[#ffd54f] text-[#151515] hover:bg-[#ffe07a]">
                  Log workout
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showSidebar ? (
        <div className="grid gap-6">
          <div className="panel-light p-6">
            <SectionHead
              eyebrow="Weekly digest"
              title="A recap lifters actually want to read."
              description="Consistency, calories, and volume condensed into one sharp summary."
            />
            <div className="mt-6 grid gap-4">
              <div className="rounded-[26px] bg-white/72 p-5">
                <p className="text-sm text-[var(--muted-light)]">{data.weeklyDigest.weekLabel}</p>
                <h3 className="mt-2 text-2xl font-[family:var(--font-sora)]">
                  {data.weeklyDigest.workoutsCompleted}/{data.weeklyDigest.workoutTarget} sessions
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted-light)]">{data.weeklyDigest.highlight}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-[#141923] p-5 text-white">
                  <p className="text-sm text-white/50">Average calories</p>
                  <p className="mt-2 text-3xl font-semibold">{data.weeklyDigest.averageCaloriesBurned}</p>
                </div>
                <div className="rounded-[22px] bg-[#141923] p-5 text-white">
                  <p className="text-sm text-white/50">Total volume</p>
                  <p className="mt-2 text-3xl font-semibold">{data.weeklyDigest.totalVolumeKg}kg</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-dark p-6">
            <SectionHead
              eyebrow="Recent sessions"
              title="Quick glance training ledger."
              description="A compact history card for people who want receipts for every session."
              dark
            />
            <div className="mt-6 space-y-3">
              {data.recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/4 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{session.dayName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">{session.label}</p>
                  </div>
                  <div className="text-right text-sm text-white/65">
                    <p>{session.volume}kg volume</p>
                    <p>{session.calories} cal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
