"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lightbulb, Search, X, Youtube } from "lucide-react";
import type { WorkoutPageData } from "@/lib/data";
import {
  deleteExerciseLogAction,
  logWorkoutAction,
  updateExerciseLogAction,
} from "@/app/actions";
import { ExerciseDemoPreview } from "@/components/exercise-demo-preview";
import { SectionHead } from "@/components/section-head";
import { SubmitButton } from "@/components/submit-button";

type WorkoutSectionProps = {
  data: WorkoutPageData;
  activePlan: WorkoutPageData["workoutPlans"][number];
  activeDaySlug: string;
  onSelectDay?: (slug: string) => void;
  dayHrefBase?: string;
  showSidebar?: boolean;
  compactIntro?: boolean;
};

type WorkoutExercise = WorkoutPageData["workoutPlans"][number]["exercises"][number];

function buildYoutubeSearchUrl(exercise: WorkoutExercise) {
  const query = `${exercise.name} exercise form tutorial ${exercise.equipment}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

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
  const [hintExerciseId, setHintExerciseId] = useState<string | null>(null);
  const [searchState, setSearchState] = useState({
    daySlug: activeDaySlug,
    query: "",
  });
  const searchQuery =
    searchState.daySlug === activeDaySlug ? searchState.query : "";
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();
  const selectedExercise =
    activePlan.exercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
  const hintExercise =
    activePlan.exercises.find((exercise) => exercise.id === hintExerciseId) ?? null;
  const visibleExercises = activePlan.exercises.filter((exercise) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    return [exercise.name, exercise.equipment, exercise.muscleGroup].some((value) =>
      value.toLowerCase().includes(normalizedSearchQuery),
    );
  });

  useEffect(() => {
    if (!selectedExerciseId && !hintExerciseId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedExerciseId(null);
        setHintExerciseId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hintExerciseId, selectedExerciseId]);

  async function handleLogWorkout(formData: FormData) {
    await logWorkoutAction(formData);
    setSelectedExerciseId(null);
  }

  async function handleUpdateExerciseLog(formData: FormData) {
    await updateExerciseLogAction(formData);
  }

  async function handleDeleteExerciseLog(formData: FormData) {
    await deleteExerciseLogAction(formData);
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
                prefetch={false}
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
                {normalizedSearchQuery
                  ? `${visibleExercises.length}/${activePlan.exerciseCount} matches`
                  : `${activePlan.exerciseCount} available exercises`}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-[26px] border border-white/8 bg-white/4 p-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
              Search exercises
            </span>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/42" />
              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchState({
                    daySlug: activeDaySlug,
                    query: event.target.value,
                  })
                }
                placeholder="Search by lift, equipment, or muscle group"
                className="field-dark w-full pr-12 pl-11"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() =>
                    setSearchState({
                      daySlug: activeDaySlug,
                      query: "",
                    })
                  }
                  className="absolute top-1/2 right-3 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/72 transition hover:bg-white/10"
                  aria-label="Clear exercise search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </label>
          <p className="mt-3 text-xs leading-6 text-white/44">
            {normalizedSearchQuery
              ? `Showing ${visibleExercises.length} matching exercises inside ${activePlan.name}.`
              : `Browse all ${activePlan.exerciseCount} exercise options for ${activePlan.name}.`}
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {visibleExercises.map((exercise) => (
            <div
              key={exercise.id}
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
                <div className="flex items-center gap-2">
                  <a
                    href={buildYoutubeSearchUrl(exercise)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/52 transition hover:border-[#ff5f57]/50 hover:text-[#ff5f57]"
                    aria-label={`Watch ${exercise.name} on YouTube`}
                    title={`Watch ${exercise.name} on YouTube`}
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setHintExerciseId(exercise.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/52 transition hover:border-[#ffd54f]/45 hover:text-[#ffd54f]"
                    aria-label={`Show workout hints for ${exercise.name}`}
                    title={`Show workout hints for ${exercise.name}`}
                  >
                    <Lightbulb className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedExerciseId(exercise.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/48 transition group-hover:text-white/78 hover:border-white/18"
                    aria-label={`Open details for ${exercise.name}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExerciseId(exercise.id)}
                className="block w-full text-left"
              >
                <h3 className="mt-4 text-xl font-[family:var(--font-sora)] text-white sm:text-2xl">
                  {exercise.name}
                </h3>
                <p className="mt-2 text-sm text-white/62">
                  {exercise.targetSets} sets | {exercise.repRangeLabel} | {exercise.restSeconds}s rest
                </p>
              </button>
            </div>
          ))}

          {visibleExercises.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-white/12 bg-white/4 p-6 text-sm leading-7 text-white/62">
              No exercises match that search yet. Try a broader name, equipment,
              or muscle group.
            </div>
          ) : null}
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

            <ExerciseDemoPreview
              exerciseName={selectedExercise.name}
              muscleGroup={selectedExercise.muscleGroup}
              equipment={selectedExercise.equipment}
              accent={activePlan.accent}
              instructions={selectedExercise.instructions}
              progressCue={selectedExercise.progressCue}
              demoVideoLabel={selectedExercise.demoVideoLabel}
              demoVideoSource={selectedExercise.demoVideoSource}
              demoVideoUrl={selectedExercise.demoVideoUrl}
              targetSets={selectedExercise.targetSets}
              repRangeLabel={selectedExercise.repRangeLabel}
              restSeconds={selectedExercise.restSeconds}
              allowFullscreen={false}
            />

            <div className="mt-5 grid gap-3">
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Setup
                </p>
                <p className="mt-2 text-sm leading-7 text-white/74">
                  {selectedExercise.instructions}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Progress cue
                </p>
                <p className="mt-2 text-sm leading-7 text-white/74">
                  {selectedExercise.progressCue}
                </p>
              </div>
            </div>

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

            <div className="mt-5 rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                    Exercise history
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/64">
                    Edit or delete old logs for this lift. The latest entries stay right here so progression is obvious.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/52">
                  {selectedExercise.historyLogs.length} logs
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {selectedExercise.historyLogs.length > 0 ? (
                  selectedExercise.historyLogs.map((log) => (
                    <div
                      key={log.logId}
                      className="rounded-[20px] border border-white/8 bg-[#111826] px-4 py-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {log.performedAtLabel} at {log.timeLabel}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                            {log.setsCompleted} x {log.repsCompleted} @ {log.weightKg}kg
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/46">
                          Log entry
                        </div>
                      </div>

                      <form action={handleUpdateExerciseLog} className="mt-4 space-y-3">
                        <input type="hidden" name="logId" value={log.logId} />
                        <div className="grid grid-cols-3 gap-3">
                          <label className="text-xs uppercase tracking-[0.18em] text-white/45">
                            Sets
                            <input
                              name="setsCompleted"
                              type="number"
                              defaultValue={log.setsCompleted}
                              className="field-dark mt-2"
                            />
                          </label>
                          <label className="text-xs uppercase tracking-[0.18em] text-white/45">
                            Reps
                            <input
                              name="repsCompleted"
                              type="number"
                              defaultValue={log.repsCompleted}
                              className="field-dark mt-2"
                            />
                          </label>
                          <label className="text-xs uppercase tracking-[0.18em] text-white/45">
                            Kg
                            <input
                              name="weightKg"
                              type="number"
                              step="0.5"
                              defaultValue={log.weightKg}
                              className="field-dark mt-2"
                            />
                          </label>
                        </div>
                        <label className="block text-xs uppercase tracking-[0.18em] text-white/45">
                          Notes
                          <textarea
                            name="notes"
                            rows={2}
                            defaultValue={log.notes ?? ""}
                            className="field-dark mt-2 min-h-[84px] resize-none"
                            placeholder="Pump, soreness, technique..."
                          />
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <SubmitButton
                            pendingLabel="Saving..."
                            className="flex-1 bg-[#ffd54f] text-[#151515] hover:bg-[#ffe07a]"
                          >
                            Save changes
                          </SubmitButton>
                        </div>
                      </form>

                      <form action={handleDeleteExerciseLog} className="mt-3">
                        <input type="hidden" name="logId" value={log.logId} />
                        <SubmitButton
                          pendingLabel="Deleting..."
                          className="w-full border border-[#ff6e63]/35 bg-[#2a1518] text-[#ffb7b1] hover:bg-[#381b1f]"
                        >
                          Delete log
                        </SubmitButton>
                      </form>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-white/8 bg-[#111826] px-4 py-4 text-sm leading-7 text-white/56">
                    No history yet for this exercise. The first few logs you enter will start building the progression record here.
                  </div>
                )}
              </div>
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

      {hintExercise ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(8,11,18,0.72)] p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setHintExerciseId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${hintExercise.name} workout hints`}
            className="panel-dark w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#171717]"
                    style={{ backgroundColor: activePlan.accent }}
                  >
                    {hintExercise.muscleGroup}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/48">
                    {hintExercise.equipment}
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Workout hint
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHintExerciseId(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/76 transition hover:bg-white/8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 text-3xl font-[family:var(--font-sora)] text-white">
              {hintExercise.name}
            </h3>
            <p className="mt-2 text-sm text-white/62">
              Position, control, and clean range cues before you load it heavier.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Position
                </p>
                <p className="mt-2 text-sm leading-7 text-white/74">
                  {hintExercise.instructions}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Angle & control
                </p>
                <p className="mt-2 text-sm leading-7 text-white/74">
                  {hintExercise.progressCue}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Range & pace
                </p>
                <p className="mt-2 text-sm leading-7 text-white/74">
                  Complete {hintExercise.targetSets} working sets in the {hintExercise.repRangeLabel} range, own the full ROM, and rest about {hintExercise.restSeconds} seconds between sets.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={buildYoutubeSearchUrl(hintExercise)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5f57] px-4 py-3 text-sm font-semibold text-[#151515] transition hover:bg-[#ff837d]"
              >
                <Youtube className="h-4 w-4" />
                Watch on YouTube
              </a>
              <button
                type="button"
                onClick={() => {
                  setHintExerciseId(null);
                  setSelectedExerciseId(hintExercise.id);
                }}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Open full exercise card
              </button>
            </div>
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
