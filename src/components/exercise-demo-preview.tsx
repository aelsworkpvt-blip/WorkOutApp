"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play, X } from "lucide-react";

type ExerciseDemoPreviewProps = {
  exerciseName: string;
  muscleGroup: string;
  equipment: string;
  accent: string;
  instructions: string;
  progressCue: string;
  demoVideoLabel: string | null;
  demoVideoSource: string | null;
  demoVideoUrl: string | null;
  targetSets: number;
  repRangeLabel: string;
  restSeconds: number;
  allowFullscreen?: boolean;
};

type Profile =
  | "highBarSquat"
  | "inclineBench"
  | "latPulldown"
  | "inclineCurl"
  | "squat"
  | "bench"
  | "press"
  | "pull"
  | "row"
  | "hinge"
  | "raise"
  | "curl"
  | "lunge"
  | "pushdown"
  | "bridge"
  | "calf";

type ExerciseMedia = {
  label: string;
  source: string;
  src: string;
};

function getMotionMeta(exerciseName: string, equipment: string) {
  const name = exerciseName.toLowerCase();
  const gear = equipment.toLowerCase();

  if (name.includes("high bar back squat")) {
    return {
      profile: "highBarSquat" as const,
      label: "High-bar squat",
      focus:
        "Stay upright, let the knees travel, and keep the bar stacked over mid-foot.",
    };
  }
  if (name.includes("incline bench press")) {
    return {
      profile: "inclineBench" as const,
      label: "Incline press",
      focus:
        "Drive up and slightly back while the shoulder blades stay pinned to the bench.",
    };
  }
  if (name.includes("lat pulldown") || name.includes("pulldown")) {
    return {
      profile: "latPulldown" as const,
      label: "Lat pulldown",
      focus:
        "Chest stays tall while elbows drive toward the ribs instead of hands yanking down.",
    };
  }
  if (name.includes("incline dumbbell curl")) {
    return {
      profile: "inclineCurl" as const,
      label: "Incline curl",
      focus:
        "Keep elbows behind the torso and let the forearms sweep through the full curl.",
    };
  }
  if (
    name.includes("bench") ||
    name.includes("chest press") ||
    name.includes("push-up") ||
    name.includes("push up") ||
    name.includes("dip")
  ) {
    return {
      profile: "bench" as const,
      label: "Horizontal press",
      focus: "Shoulders stay packed while the press path repeats cleanly.",
    };
  }
  if (name.includes("shoulder press") || name.includes("arnold press")) {
    return {
      profile: "press" as const,
      label: "Vertical press",
      focus:
        "Stack wrists and elbows, then drive up without flaring the ribs.",
    };
  }
  if (
    name.includes("pull-up") ||
    name.includes("pull up") ||
    name.includes("chin-up") ||
    name.includes("chin up")
  ) {
    return {
      profile: "pull" as const,
      label: "Vertical pull",
      focus:
        "Think elbows down and keep the stretch honest overhead.",
    };
  }
  if (name.includes("row")) {
    return {
      profile: "row" as const,
      label: "Horizontal pull",
      focus:
        "Brace first, then row by driving elbows behind the torso.",
    };
  }
  if (name.includes("deadlift") || name.includes("good morning")) {
    return {
      profile: "hinge" as const,
      label: "Hip hinge",
      focus: "Push hips back, keep the lats on, and own the back angle.",
    };
  }
  if (name.includes("raise") || name.includes("rear delt")) {
    return {
      profile: "raise" as const,
      label: "Shoulder isolation",
      focus: "Lead with the elbows and keep the traps relaxed.",
    };
  }
  if (name.includes("curl")) {
    return {
      profile: "curl" as const,
      label: "Arm flexion",
      focus: "Pin the elbow and let the forearm do the moving.",
    };
  }
  if (
    name.includes("lunge") ||
    name.includes("split squat") ||
    name.includes("step-up") ||
    name.includes("step up")
  ) {
    return {
      profile: "lunge" as const,
      label: "Single-leg drive",
      focus: "Stay tall and make the front leg own the rep.",
    };
  }
  if (name.includes("pushdown") || name.includes("extension")) {
    return {
      profile: "pushdown" as const,
      label: "Triceps lockout",
      focus:
        "Keep the upper arm quiet while the elbow extends.",
    };
  }
  if (name.includes("bridge") || name.includes("thrust")) {
    return {
      profile: "bridge" as const,
      label: "Hip extension",
      focus: "Ribs down, glutes on, and no low-back overreach.",
    };
  }
  if (name.includes("calf")) {
    return {
      profile: "calf" as const,
      label: "Ankle drive",
      focus:
        "Pause the stretch, then rise high without bouncing.",
    };
  }
  if (name.includes("squat") || name.includes("leg press") || gear.includes("barbell")) {
    return {
      profile: "squat" as const,
      label: "Knee-dominant",
      focus: "Sit with control and stand through the whole foot.",
    };
  }
  return {
    profile: "press" as const,
    label: "Strength pattern",
    focus: "Keep every rep looking the same from start to finish.",
  };
}

function VideoStage({
  exerciseName,
  equipment,
  label,
  source,
  clipSource,
  isPlaying,
  tall,
  onError,
}: {
  exerciseName: string;
  equipment: string;
  label: string;
  source: string;
  clipSource: string;
  isPlaying: boolean;
  tall?: boolean;
  onError?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isPlaying) {
      const playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
      return;
    }

    video.pause();
  }, [isPlaying]);

  return (
    <div className={tall ? "relative h-[56vh] min-h-[340px] w-full" : "relative h-36 w-full"}>
      <video
        ref={videoRef}
        src={clipSource}
        className="h-full w-full object-cover"
        autoPlay
        loop
      muted
      playsInline
      preload="metadata"
      aria-label={`${exerciseName} exercise demo video`}
      onError={onError}
    />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,11,18,0.96)] via-[rgba(8,11,18,0.38)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-4 py-3">
        <span className="rounded-full border border-white/10 bg-[rgba(8,11,18,0.72)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/64">
          {source} clip
        </span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
            {tall ? "Full-screen demo" : "Exercise clip"}
          </p>
          <p className="mt-1 text-sm text-white/78">{label}</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/64">{equipment}</span>
      </div>
    </div>
  );
}

function VideoFallback({
  accent,
  label,
  equipment,
}: {
  accent: string;
  label: string;
  equipment: string;
}) {
  return (
    <div
      className="relative h-36 w-full overflow-hidden"
      style={{
        background: `radial-gradient(circle at 18% 18%, ${accent}2a 0, transparent 42%), linear-gradient(135deg, #10151f 0%, #161d2a 100%)`,
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-end px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
          Exercise clip
        </p>
        <p className="mt-1 text-sm text-white/78">{label}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/54">
          {equipment}
        </p>
      </div>
    </div>
  );
}

export function ExerciseDemoPreview({
  exerciseName,
  muscleGroup,
  equipment,
  accent,
  instructions,
  progressCue,
  demoVideoLabel,
  demoVideoSource,
  demoVideoUrl,
  targetSets,
  repRangeLabel,
  restSeconds,
  allowFullscreen = true,
}: ExerciseDemoPreviewProps) {
  const meta = getMotionMeta(exerciseName, equipment);
  const media: ExerciseMedia = {
    label: demoVideoLabel ?? `${meta.label} clip`,
    source: demoVideoSource ?? "ExerciseDB",
    src: demoVideoUrl ?? "",
  };
  const [isPlaying, setIsPlaying] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    setVideoUnavailable(!demoVideoUrl);
  }, [demoVideoUrl]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <div
        className="mt-4 overflow-hidden rounded-[22px] border border-white/8"
        style={{
          background: `radial-gradient(circle at 18% 18%, ${accent}2c 0, transparent 38%), linear-gradient(135deg, #10151f 0%, #161d2a 100%)`,
        }}
      >
        <div className="relative">
          {videoUnavailable ? (
            <VideoFallback accent={accent} label={media.label} equipment={equipment} />
          ) : (
            <VideoStage
              exerciseName={exerciseName}
              equipment={equipment}
              label={media.label}
              source={media.source}
              clipSource={media.src}
              isPlaying={!isOpen && isPlaying}
              onError={() => setVideoUnavailable(true)}
            />
          )}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[rgba(7,10,18,0.74)] text-white/82 transition hover:bg-[rgba(7,10,18,0.92)]"
              aria-label={isPlaying ? `Pause ${exerciseName} demo` : `Play ${exerciseName} demo`}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            {allowFullscreen ? (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[rgba(7,10,18,0.74)] text-white/82 transition hover:bg-[rgba(7,10,18,0.92)]"
                aria-label={`Open ${exerciseName} full-screen demo`}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {allowFullscreen && isOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(4,7,12,0.9)] p-4 backdrop-blur-md sm:items-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${exerciseName} demo viewer`}
            className="panel-dark max-h-[92vh] w-full max-w-4xl overflow-y-auto p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Exercise motion viewer
                </p>
                <h3 className="mt-3 text-3xl font-[family:var(--font-sora)] text-white sm:text-4xl">
                  {exerciseName}
                </h3>
                <p className="mt-2 text-sm text-white/62">
                  {targetSets} sets | {repRangeLabel} | {restSeconds}s rest
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? "Pause demo" : "Play demo"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/82 transition hover:bg-white/8"
                  aria-label={`Close ${exerciseName} full-screen demo`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className="mt-5 overflow-hidden rounded-[28px] border border-white/8"
              style={{
                background: `radial-gradient(circle at 18% 18%, ${accent}2f 0, transparent 38%), linear-gradient(135deg, #0f1520 0%, #182033 100%)`,
              }}
            >
              {videoUnavailable ? (
                <div className="flex h-[56vh] min-h-[340px] w-full items-center justify-center px-8 text-center text-sm leading-7 text-white/66">
                  Demo clip unavailable right now for this exercise.
                </div>
              ) : (
                <VideoStage
                  exerciseName={exerciseName}
                  equipment={equipment}
                  label={media.label}
                  source={media.source}
                  clipSource={media.src}
                  isPlaying={isPlaying}
                  tall
                  onError={() => setVideoUnavailable(true)}
                />
              )}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Setup & position
                </p>
                <p className="mt-3 text-sm leading-7 text-white/74">{instructions}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Motion focus
                </p>
                <p className="mt-3 text-sm leading-7 text-white/74">{meta.focus}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Progress cue
                </p>
                <p className="mt-3 text-sm leading-7 text-white/74">{progressCue}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-[#0f1520] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  Rhythm
                </p>
                <p className="mt-3 text-sm leading-7 text-white/74">
                  Repeat {targetSets} working sets in the {repRangeLabel} range, keep the path
                  smooth, and take about {restSeconds} seconds before the next set.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
