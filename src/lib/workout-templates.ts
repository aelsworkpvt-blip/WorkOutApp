export type SplitKey = "PPL" | "BRO";

export type ExerciseDemoMedia = {
  demoVideoLabel: string;
  demoVideoSource: string;
  demoVideoUrl: string;
};

export type WorkoutExerciseTemplate = {
  slug: string;
  name: string;
  muscleGroup:
    | "CHEST"
    | "BACK"
    | "SHOULDERS"
    | "LEGS"
    | "BICEPS"
    | "TRICEPS"
    | "GLUTES"
    | "HAMSTRINGS"
    | "QUADS"
    | "CALVES"
    | "CORE"
    | "FULL_BODY";
  equipment: string;
  instructions: string;
  progressCue: string;
  targetSets: number;
  repRangeMin: number;
  repRangeMax: number;
  restSeconds: number;
} & ExerciseDemoMedia;

type WorkoutExerciseTemplateInput = Omit<
  WorkoutExerciseTemplate,
  keyof ExerciseDemoMedia
>;

export type WorkoutDayTemplateShape = {
  slug: string;
  name: string;
  focus: string;
  accent: string;
  description: string;
  estimatedMinutes: number;
  exercises: WorkoutExerciseTemplate[];
};

type WorkoutDayTemplateInput = Omit<WorkoutDayTemplateShape, "exercises"> & {
  exercises: WorkoutExerciseTemplateInput[];
};

export const splitOptions = [
  {
    key: "PPL" as const,
    label: "Push Pull Legs",
    description:
      "Balanced hypertrophy flow with built-in recovery and clearer strength progression.",
    vibe: "Performance rhythm",
  },
  {
    key: "BRO" as const,
    label: "Bro Split",
    description:
      "Classic body-part focus with more volume per muscle group and a big pump feel.",
    vibe: "Body-part attack",
  },
];

function exercise(
  slug: string,
  name: string,
  muscleGroup: WorkoutExerciseTemplateInput["muscleGroup"],
  equipment: string,
  instructions: string,
  progressCue: string,
  targetSets: number,
  repRangeMin: number,
  repRangeMax: number,
  restSeconds: number,
): WorkoutExerciseTemplateInput {
  return {
    slug,
    name,
    muscleGroup,
    equipment,
    instructions,
    progressCue,
    targetSets,
    repRangeMin,
    repRangeMax,
    restSeconds,
  };
}

function getExerciseDemoMedia(
  exerciseName: string,
  equipment: string,
): ExerciseDemoMedia {
  const name = exerciseName.toLowerCase();
  const gear = equipment.toLowerCase();

  if (name.includes("push-up") || name.includes("push up")) {
    return {
      demoVideoLabel: "Push-up clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/40248/40248-720.mp4",
    };
  }

  if (name.includes("fly")) {
    return {
      demoVideoLabel: "Chest fly clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl:
        "https://assets.mixkit.co/active_storage/video_items/100546/1725385655/100546-video-720.mp4",
    };
  }

  if (name.includes("leg press")) {
    return {
      demoVideoLabel: "Leg press clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/14817/14817-720.mp4",
    };
  }

  if (name.includes("chest press")) {
    return {
      demoVideoLabel: "Chest press clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl:
        "https://assets.mixkit.co/active_storage/video_items/100538/1725384701/100538-video-720.mp4",
    };
  }

  if (name.includes("high bar back squat")) {
    return {
      demoVideoLabel: "Squat clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/52111/52111-720.mp4",
    };
  }

  if (name.includes("incline bench press")) {
    return {
      demoVideoLabel: "Pressing clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl:
        "https://assets.mixkit.co/active_storage/video_items/100543/1725384976/100543-video-720.mp4",
    };
  }

  if (name.includes("lat pulldown") || name.includes("pulldown")) {
    return {
      demoVideoLabel: "Pulldown clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/21269/21269-720.mp4",
    };
  }

  if (name.includes("incline dumbbell curl")) {
    return {
      demoVideoLabel: "Curl clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/36602/36602-720.mp4",
    };
  }

  if (
    name.includes("bench") ||
    name.includes("dip")
  ) {
    return {
      demoVideoLabel: "Pressing clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl:
        "https://assets.mixkit.co/active_storage/video_items/100543/1725384976/100543-video-720.mp4",
    };
  }

  if (name.includes("shoulder press") || name.includes("arnold press")) {
    return {
      demoVideoLabel: "Shoulder clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/36699/36699-720.mp4",
    };
  }

  if (
    name.includes("pull-up") ||
    name.includes("pull up") ||
    name.includes("chin-up") ||
    name.includes("chin up")
  ) {
    return {
      demoVideoLabel: "Pulldown clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/21269/21269-720.mp4",
    };
  }

  if (name.includes("row")) {
    return {
      demoVideoLabel: "Row clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl:
        "https://assets.mixkit.co/active_storage/video_items/100536/1725384352/100536-video-720.mp4",
    };
  }

  if (name.includes("deadlift") || name.includes("good morning")) {
    return {
      demoVideoLabel: "Hinge clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/49436/49436-720.mp4",
    };
  }

  if (name.includes("raise") || name.includes("rear delt")) {
    return {
      demoVideoLabel: "Shoulder clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/36699/36699-720.mp4",
    };
  }

  if (name.includes("curl")) {
    return {
      demoVideoLabel: "Curl clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/36602/36602-720.mp4",
    };
  }

  if (
    name.includes("lunge") ||
    name.includes("split squat") ||
    name.includes("step-up") ||
    name.includes("step up")
  ) {
    return {
      demoVideoLabel: "Lunge clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/52112/52112-720.mp4",
    };
  }

  if (name.includes("pushdown") || name.includes("extension")) {
    return {
      demoVideoLabel: "Cable clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl:
        "https://assets.mixkit.co/active_storage/video_items/100547/1725385703/100547-video-720.mp4",
    };
  }

  if (name.includes("bridge") || name.includes("thrust")) {
    return {
      demoVideoLabel: "Hinge clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/49436/49436-720.mp4",
    };
  }

  if (name.includes("calf")) {
    return {
      demoVideoLabel: "Lower-body clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/14817/14817-720.mp4",
    };
  }

  if (name.includes("squat") || gear.includes("barbell")) {
    return {
      demoVideoLabel: "Squat clip",
      demoVideoSource: "Mixkit",
      demoVideoUrl: "https://assets.mixkit.co/videos/52111/52111-720.mp4",
    };
  }

  return {
    demoVideoLabel: "Shoulder clip",
    demoVideoSource: "Mixkit",
    demoVideoUrl: "https://assets.mixkit.co/videos/36699/36699-720.mp4",
  };
}

function withExerciseDemoMedia(
  templates: Record<SplitKey, WorkoutDayTemplateInput[]>,
): Record<SplitKey, WorkoutDayTemplateShape[]> {
  return Object.fromEntries(
    Object.entries(templates).map(([splitKey, days]) => [
      splitKey,
      days.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          ...getExerciseDemoMedia(exercise.name, exercise.equipment),
        })),
      })),
    ]),
  ) as Record<SplitKey, WorkoutDayTemplateShape[]>;
}

const pushPrimeBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("push-prime-flat-dumbbell-press", "Flat Dumbbell Press", "CHEST", "Dumbbells", "Keep the elbows 45 degrees and press both bells evenly.", "Own all working reps before taking the next pair up.", 3, 8, 10, 90),
  exercise("push-prime-machine-chest-press", "Machine Chest Press", "CHEST", "Machine", "Stay glued to the pad and drive through the palms.", "Add a rep to every set before the next plate jump.", 3, 8, 12, 90),
  exercise("push-prime-incline-smith-press", "Incline Smith Press", "CHEST", "Smith Machine", "Lower to upper chest and keep the shoulder blades tucked.", "Use the rails for stability and chase cleaner reps first.", 3, 8, 10, 90),
  exercise("push-prime-seated-machine-shoulder-press", "Seated Machine Shoulder Press", "SHOULDERS", "Machine", "Keep forearms stacked under the handles and press smoothly.", "Stay smooth through lockout before loading the stack heavier.", 3, 8, 10, 90),
  exercise("push-prime-arnold-press", "Arnold Press", "SHOULDERS", "Dumbbells", "Rotate through the press without losing rib control.", "Only add load when the turn and lockout stay clean.", 3, 10, 12, 75),
  exercise("push-prime-dumbbell-lateral-raise", "Dumbbell Lateral Raise", "SHOULDERS", "Dumbbells", "Lead with elbows and keep the traps quiet.", "Slow the lowering phase before using heavier bells.", 3, 12, 15, 60),
  exercise("push-prime-machine-lateral-raise", "Machine Lateral Raise", "SHOULDERS", "Machine", "Stay seated tall and sweep the elbows wide.", "Control the top pause before moving the pin up.", 3, 12, 15, 60),
  exercise("push-prime-pec-deck-fly", "Pec Deck Fly", "CHEST", "Machine", "Open into the stretch and squeeze the handles together hard.", "Win the squeeze, then chase extra reps.", 3, 12, 15, 60),
  exercise("push-prime-high-to-low-cable-fly", "High To Low Cable Fly", "CHEST", "Cable", "Sweep down and in without shrugging the shoulders.", "Keep tension constant and add reps before weight.", 3, 12, 15, 60),
  exercise("push-prime-assisted-dip", "Assisted Dip", "TRICEPS", "Machine", "Stay tall, keep elbows tracking back, and avoid bouncing.", "Reduce assistance when every rep stays controlled.", 3, 8, 12, 75),
  exercise("push-prime-close-grip-bench-press", "Close Grip Bench Press", "TRICEPS", "Barbell", "Tuck elbows and press with the triceps driving the bar.", "Small jumps win here. Keep the wrists stacked.", 3, 6, 8, 120),
  exercise("push-prime-overhead-rope-extension", "Overhead Rope Extension", "TRICEPS", "Cable", "Keep ribs down and reach long at the bottom.", "Earn the stretch first, then chase the next pin.", 3, 10, 14, 60),
  exercise("push-prime-single-arm-pushdown", "Single Arm Pushdown", "TRICEPS", "Cable", "Pin the elbow and finish with a hard triceps lockout.", "Match both sides before adding load.", 3, 10, 14, 60),
  exercise("push-prime-dumbbell-front-raise", "Dumbbell Front Raise", "SHOULDERS", "Dumbbells", "Raise with control and keep the torso quiet.", "Clean reps matter more than heavier bells here.", 3, 10, 12, 60),
  exercise("push-prime-deficit-push-up", "Deficit Push-Up", "CHEST", "Bodyweight", "Sink into the stretch and drive the floor away.", "Add reps or a weighted vest once the sets stay crisp.", 3, 12, 20, 60),
];

const pullPowerBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("pull-power-assisted-pull-up", "Assisted Pull-Up", "BACK", "Machine", "Drive elbows down and keep the chest lifted to the bar.", "Reduce assistance only when the range stays full.", 3, 8, 12, 90),
  exercise("pull-power-wide-grip-lat-pulldown", "Wide Grip Lat Pulldown", "BACK", "Cable", "Pull shoulders down first and bring elbows toward the ribs.", "Keep the same path every set before adding weight.", 3, 8, 12, 75),
  exercise("pull-power-seated-cable-row", "Seated Cable Row", "BACK", "Cable", "Finish with elbows, not torso swing, and pause on the squeeze.", "Beat the pause quality before moving the stack.", 3, 8, 12, 75),
  exercise("pull-power-one-arm-dumbbell-row", "One Arm Dumbbell Row", "BACK", "Dumbbells", "Brace hard and pull the elbow toward the hip.", "Keep the torso locked before reaching for a heavier bell.", 3, 8, 12, 75),
  exercise("pull-power-t-bar-row", "T-Bar Row", "BACK", "Machine", "Stay hinged and keep the chest proud into the pad.", "Add load only when the top squeeze stays sharp.", 3, 8, 10, 90),
  exercise("pull-power-machine-high-row", "Machine High Row", "BACK", "Machine", "Drive elbows down and back while keeping shoulders low.", "Pause the contracted position before increasing load.", 3, 8, 12, 75),
  exercise("pull-power-straight-arm-pulldown", "Straight Arm Pulldown", "BACK", "Cable", "Keep elbows soft and sweep through the lats.", "Keep tension from top to bottom before going heavier.", 3, 12, 15, 60),
  exercise("pull-power-face-pull", "Face Pull", "SHOULDERS", "Cable", "Pull toward the nose and separate the rope at the end.", "Own the rear-delt squeeze before adding plates.", 3, 12, 15, 60),
  exercise("pull-power-dumbbell-shrug", "Dumbbell Shrug", "BACK", "Dumbbells", "Rise straight up and pause without rolling the shoulders.", "Longer pauses beat faster reps here.", 3, 10, 14, 60),
  exercise("pull-power-reverse-grip-row", "Reverse Grip Row", "BACK", "Machine", "Use the underhand grip to keep elbows close to the body.", "Stay strict and collect reps before weight.", 3, 8, 12, 75),
  exercise("pull-power-incline-dumbbell-curl", "Incline Dumbbell Curl", "BICEPS", "Dumbbells", "Let the biceps stretch and keep the elbows back.", "Own the bottom range before increasing bells.", 3, 10, 12, 60),
  exercise("pull-power-hammer-curl", "Hammer Curl", "BICEPS", "Dumbbells", "Keep wrists neutral and resist the lowering phase.", "Match both sides before moving heavier.", 3, 10, 12, 60),
  exercise("pull-power-preacher-curl", "Preacher Curl", "BICEPS", "Machine", "Stay glued to the pad and control the bottom stretch.", "Smooth tempo earns the next weight jump.", 3, 10, 12, 60),
  exercise("pull-power-cable-curl", "Cable Curl", "BICEPS", "Cable", "Keep elbows fixed and squeeze at eye level.", "Add reps across all sets before loading the stack.", 3, 12, 15, 60),
  exercise("pull-power-bayesian-curl", "Bayesian Curl", "BICEPS", "Cable", "Step forward to keep tension and curl from a long stretch.", "Use clean range before chasing extra pins.", 3, 10, 14, 60),
];

const legsLaunchBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("legs-launch-hack-squat", "Hack Squat", "LEGS", "Machine", "Stay locked into the pad and lower with full control.", "Own depth and tempo before adding more plates.", 3, 8, 10, 120),
  exercise("legs-launch-bulgarian-split-squat", "Bulgarian Split Squat", "QUADS", "Dumbbells", "Stay tall and let the front leg do the work.", "Add reps before you add heavier dumbbells.", 3, 8, 12, 75),
  exercise("legs-launch-leg-extension", "Leg Extension", "QUADS", "Machine", "Lift through the quads and pause at the top.", "Make the top squeeze obvious before raising the stack.", 3, 12, 15, 60),
  exercise("legs-launch-lying-leg-curl", "Lying Leg Curl", "HAMSTRINGS", "Machine", "Keep hips pressed into the pad and curl smoothly.", "Pause hard at the top before progressing.", 3, 10, 14, 60),
  exercise("legs-launch-barbell-hip-thrust", "Barbell Hip Thrust", "GLUTES", "Barbell", "Tuck the ribs, lock the glutes, and avoid overextending.", "Stay explosive at the top before adding load.", 3, 8, 12, 90),
  exercise("legs-launch-walking-lunge", "Walking Lunge", "GLUTES", "Dumbbells", "Use a long stride and stay balanced from rep to rep.", "Add total steps before heavier dumbbells.", 3, 12, 16, 75),
  exercise("legs-launch-smith-reverse-lunge", "Smith Reverse Lunge", "GLUTES", "Smith Machine", "Step back far enough to keep the front heel planted.", "Win stability first, then load the bar more.", 3, 8, 12, 75),
  exercise("legs-launch-goblet-squat", "Goblet Squat", "QUADS", "Dumbbells", "Sit deep with the chest tall and elbows inside the knees.", "Extend range and pause quality before heavier weight.", 3, 10, 15, 75),
  exercise("legs-launch-adductor-machine", "Adductor Machine", "LEGS", "Machine", "Control the inward squeeze and don't bounce the stack.", "Slow reps beat sloppy heavier reps.", 3, 12, 15, 60),
  exercise("legs-launch-seated-calf-raise", "Seated Calf Raise", "CALVES", "Machine", "Take the heel lower than you think and squeeze the top.", "Longer pauses come before more plates.", 4, 12, 15, 60),
  exercise("legs-launch-step-up", "Step-Up", "GLUTES", "Dumbbells", "Drive through the working leg and avoid pushing off the trail foot.", "Raise box control before you raise load.", 3, 10, 12, 75),
  exercise("legs-launch-glute-bridge", "Glute Bridge", "GLUTES", "Barbell", "Brace the core and finish with a hard glute lockout.", "Own the top pause before more weight.", 3, 10, 12, 75),
  exercise("legs-launch-smith-squat", "Smith Squat", "QUADS", "Smith Machine", "Keep the stance stable and sit straight down into the quads.", "Use full depth before progressing the bar.", 3, 8, 10, 90),
  exercise("legs-launch-single-leg-press", "Single Leg Press", "QUADS", "Machine", "Keep hips level and drive through the full foot.", "Match sides perfectly before increasing plates.", 3, 10, 12, 75),
  exercise("legs-launch-cable-kickback", "Cable Kickback", "GLUTES", "Cable", "Keep the torso still and squeeze the glute at the finish.", "Range and control come before more stack.", 3, 12, 15, 60),
];

const chestCarveBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("chest-carve-flat-dumbbell-press", "Flat Dumbbell Press", "CHEST", "Dumbbells", "Stay packed into the bench and press evenly on both sides.", "Add load only when both sides stay in sync.", 3, 8, 10, 90),
  exercise("chest-carve-incline-barbell-press", "Incline Barbell Press", "CHEST", "Barbell", "Touch high on the chest and keep elbows under the bar.", "Small jumps and clean bar speed win here.", 3, 6, 8, 120),
  exercise("chest-carve-smith-machine-bench-press", "Smith Machine Bench Press", "CHEST", "Smith Machine", "Control the bottom and press without shoulder roll.", "Milk the stability for cleaner volume before adding weight.", 3, 8, 10, 90),
  exercise("chest-carve-plate-loaded-chest-press", "Plate Loaded Chest Press", "CHEST", "Machine", "Stay pinned to the seat and drive through the palms.", "Even lockouts come before extra plates.", 3, 8, 12, 90),
  exercise("chest-carve-seated-machine-chest-press", "Seated Machine Chest Press", "CHEST", "Machine", "Set the seat right and press through the mid palm.", "Beat last week's total reps before weight.", 3, 8, 12, 90),
  exercise("chest-carve-pec-deck-fly", "Pec Deck Fly", "CHEST", "Machine", "Open into the stretch and meet in the middle without shrugging.", "Hold the squeeze before raising the pin.", 3, 12, 15, 60),
  exercise("chest-carve-flat-cable-fly", "Flat Cable Fly", "CHEST", "Cable", "Sweep straight through the chest line and keep tension on.", "Smooth reps first, then move the stack.", 3, 12, 15, 60),
  exercise("chest-carve-high-to-low-cable-fly", "High To Low Cable Fly", "CHEST", "Cable", "Pull down and in while keeping shoulders low.", "Stay stretched and controlled before adding weight.", 3, 12, 15, 60),
  exercise("chest-carve-incline-cable-fly", "Incline Cable Fly", "CHEST", "Cable", "Bring the hands up and together without bending the elbows more.", "Own the upper-chest squeeze before going heavier.", 3, 12, 15, 60),
  exercise("chest-carve-push-up", "Push-Up", "CHEST", "Bodyweight", "Stay straight from head to heel and press through the floor.", "Add reps or a plate once the sets stay clean.", 3, 15, 25, 60),
  exercise("chest-carve-deficit-push-up", "Deficit Push-Up", "CHEST", "Bodyweight", "Use the extra range to load the stretch under control.", "Longer range first, then more reps.", 3, 12, 20, 60),
  exercise("chest-carve-dumbbell-squeeze-press", "Dumbbell Squeeze Press", "CHEST", "Dumbbells", "Crush the bells together and keep chest tension constant.", "Keep the squeeze honest before more load.", 3, 10, 12, 75),
  exercise("chest-carve-machine-dip", "Machine Dip", "CHEST", "Machine", "Lean slightly forward and stay smooth into the bottom.", "Lower the assistance or increase the load gradually.", 3, 8, 12, 75),
  exercise("chest-carve-decline-machine-press", "Decline Machine Press", "CHEST", "Machine", "Drive the handles down and away without shrugging.", "Stay controlled in the bottom stretch before extra weight.", 3, 8, 12, 75),
  exercise("chest-carve-single-arm-cable-press", "Single Arm Cable Press", "CHEST", "Cable", "Stay square through the torso and press without twisting.", "Match left and right quality before loading higher.", 3, 10, 12, 60),
  exercise("chest-carve-hex-press", "Hex Press", "CHEST", "Dumbbells", "Keep the bells touching throughout the press for constant tension.", "Add reps before taking the next dumbbell jump.", 3, 10, 12, 75),
];

const backBuildBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("back-build-pull-up", "Pull-Up", "BACK", "Bodyweight", "Pull the chest up and keep the legs quiet under you.", "Add load only when all reps stay full range.", 3, 6, 10, 120),
  exercise("back-build-assisted-pull-up", "Assisted Pull-Up", "BACK", "Machine", "Drive elbows down while keeping the chest proud.", "Reduce assistance once full range feels easy.", 3, 8, 12, 90),
  exercise("back-build-neutral-lat-pulldown", "Neutral Lat Pulldown", "BACK", "Cable", "Think elbows to hips and stretch fully at the top.", "Consistent form beats extra plates.", 3, 8, 12, 75),
  exercise("back-build-close-grip-seated-row", "Close Grip Seated Row", "BACK", "Cable", "Stay tall and finish every rep with the elbows tight.", "Pause the squeeze before loading up.", 3, 8, 12, 75),
  exercise("back-build-chest-supported-row", "Chest Supported Row", "BACK", "Machine", "Push the chest into the pad and row without jerking.", "Add load when the top position stays locked in.", 3, 8, 10, 90),
  exercise("back-build-one-arm-dumbbell-row", "One Arm Dumbbell Row", "BACK", "Dumbbells", "Brace with intent and drive the elbow behind the hip.", "Keep the torso still before heavier bells.", 3, 8, 12, 75),
  exercise("back-build-t-bar-row", "T-Bar Row", "BACK", "Machine", "Stay hinged and let the elbows travel back hard.", "Use cleaner pauses before chasing weight.", 3, 8, 10, 90),
  exercise("back-build-machine-high-row", "Machine High Row", "BACK", "Machine", "Keep the shoulders low and pull through the upper back.", "One more clean rep beats a sloppy jump.", 3, 8, 12, 75),
  exercise("back-build-single-arm-lat-pulldown", "Single Arm Lat Pulldown", "BACK", "Cable", "Pull toward the pocket and don't rotate the torso.", "Match sides before climbing the stack.", 3, 10, 12, 60),
  exercise("back-build-reverse-grip-pulldown", "Reverse Grip Pulldown", "BACK", "Cable", "Use the underhand grip to keep elbows close and low.", "Smooth reps first, then extra load.", 3, 10, 12, 75),
  exercise("back-build-face-pull", "Face Pull", "SHOULDERS", "Cable", "Pull to the face and split the rope at the finish.", "Rear-delt tension first, heavier stack later.", 3, 12, 15, 60),
  exercise("back-build-back-extension", "Back Extension", "BACK", "Bodyweight", "Move through the hips and finish with glutes, not low-back crank.", "Add a plate only when reps stay controlled.", 3, 12, 15, 60),
  exercise("back-build-dumbbell-pullover", "Dumbbell Pullover", "BACK", "Dumbbells", "Reach long overhead and pull back through the lats.", "Stretch quality matters more than load here.", 3, 10, 12, 75),
  exercise("back-build-cable-pullover", "Cable Pullover", "BACK", "Cable", "Keep arms long and drag the handle through the lats.", "Use range and tension before more stack.", 3, 12, 15, 60),
  exercise("back-build-hammer-strength-row", "Hammer Strength Row", "BACK", "Machine", "Drive one side at a time without torso sway.", "Beat total reps before adding plates.", 3, 8, 12, 75),
  exercise("back-build-iso-lateral-row", "Iso Lateral Row", "BACK", "Machine", "Keep the chest up and finish with the elbows behind the body.", "Stay even on both sides before adding load.", 3, 8, 12, 75),
];

const shoulderSculptBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("shoulder-sculpt-seated-dumbbell-press", "Seated Dumbbell Press", "SHOULDERS", "Dumbbells", "Press up without arching and keep the bells in line.", "Only move up when both sides lock out clean.", 3, 8, 10, 90),
  exercise("shoulder-sculpt-machine-shoulder-press", "Machine Shoulder Press", "SHOULDERS", "Machine", "Stay pinned to the seat and drive through the handles.", "Control the lowering phase before more stack.", 3, 8, 10, 90),
  exercise("shoulder-sculpt-arnold-press", "Arnold Press", "SHOULDERS", "Dumbbells", "Rotate smoothly and finish with elbows stacked under the wrist.", "Stay fluid before reaching for the next pair.", 3, 10, 12, 75),
  exercise("shoulder-sculpt-cable-lateral-raise", "Cable Lateral Raise", "SHOULDERS", "Cable", "Lead with the elbow and keep the shoulder down.", "Tempo beats heavier pins here.", 3, 12, 15, 60),
  exercise("shoulder-sculpt-machine-lateral-raise", "Machine Lateral Raise", "SHOULDERS", "Machine", "Stay seated tall and move through the side delts only.", "Smoother reps first, more stack second.", 3, 12, 15, 60),
  exercise("shoulder-sculpt-leaning-lateral-raise", "Leaning Lateral Raise", "SHOULDERS", "Cable", "Use the lean for range and stop before shrugging.", "Own the top position before adding load.", 3, 12, 15, 60),
  exercise("shoulder-sculpt-rear-delt-cable-fly", "Rear Delt Cable Fly", "SHOULDERS", "Cable", "Open wide and keep the neck relaxed throughout.", "Squeeze the back of the shoulder before raising the pin.", 3, 12, 15, 60),
  exercise("shoulder-sculpt-face-pull", "Face Pull", "SHOULDERS", "Cable", "Pull toward the face and externally rotate at the finish.", "Make every rep identical before going heavier.", 3, 12, 15, 60),
  exercise("shoulder-sculpt-front-dumbbell-raise", "Front Dumbbell Raise", "SHOULDERS", "Dumbbells", "Lift with control and keep the ribs stacked down.", "Add reps before taking a bigger bell.", 3, 10, 12, 60),
  exercise("shoulder-sculpt-plate-front-raise", "Plate Front Raise", "SHOULDERS", "Plate", "Keep the plate close and stop at eye level.", "Smooth control beats momentum.", 3, 10, 12, 60),
  exercise("shoulder-sculpt-upright-row", "Upright Row", "SHOULDERS", "EZ Bar", "Pull to mid chest and let elbows lead the bar.", "Keep shoulders calm and range comfortable.", 3, 8, 10, 75),
  exercise("shoulder-sculpt-smith-machine-press", "Smith Machine Press", "SHOULDERS", "Smith Machine", "Use the fixed path to keep the press stacked and stable.", "Stay crisp through lockout before more weight.", 3, 8, 10, 90),
  exercise("shoulder-sculpt-landmine-press", "Landmine Press", "SHOULDERS", "Barbell", "Press up and forward without leaning away from the bar.", "Increase reps before loading plates.", 3, 8, 12, 75),
  exercise("shoulder-sculpt-machine-rear-delt-fly", "Machine Rear Delt Fly", "SHOULDERS", "Machine", "Sweep wide and keep upper traps quiet.", "Own the rear-delt squeeze before extra weight.", 3, 12, 15, 60),
  exercise("shoulder-sculpt-seated-rear-delt-row", "Seated Rear Delt Row", "SHOULDERS", "Cable", "Row high with elbows flared and chest tall.", "Stay strict before moving the stack.", 3, 10, 12, 60),
  exercise("shoulder-sculpt-dumbbell-shrug", "Dumbbell Shrug", "SHOULDERS", "Dumbbells", "Rise straight up and pause the top hard.", "Longer pauses beat heavier bells here.", 3, 10, 14, 60),
];

const armArsenalBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("arm-arsenal-ez-bar-curl", "EZ Bar Curl", "BICEPS", "EZ Bar", "Stay tall and let the biceps move the bar, not the hips.", "Add reps before adding plates.", 3, 8, 12, 60),
  exercise("arm-arsenal-incline-dumbbell-curl", "Incline Dumbbell Curl", "BICEPS", "Dumbbells", "Keep elbows behind the body and own the stretch.", "Stretch quality comes before heavier dumbbells.", 3, 10, 12, 60),
  exercise("arm-arsenal-preacher-curl", "Preacher Curl", "BICEPS", "Machine", "Glue the upper arm down and control the bottom range.", "Use cleaner tempo before more load.", 3, 10, 12, 60),
  exercise("arm-arsenal-cable-curl", "Cable Curl", "BICEPS", "Cable", "Keep constant tension and squeeze without shoulder swing.", "Add total reps before climbing the stack.", 3, 12, 15, 60),
  exercise("arm-arsenal-reverse-curl", "Reverse Curl", "BICEPS", "EZ Bar", "Keep wrists flat and pull without elbow drift.", "Stay strict before using more weight.", 3, 10, 12, 60),
  exercise("arm-arsenal-concentration-curl", "Concentration Curl", "BICEPS", "Dumbbells", "Squeeze the top and lower slower than you lift.", "Increase clean reps before heavier weight.", 3, 10, 12, 60),
  exercise("arm-arsenal-spider-curl", "Spider Curl", "BICEPS", "EZ Bar", "Let the arms hang and curl without swinging the shoulders.", "Beat last week's reps before more load.", 3, 10, 12, 60),
  exercise("arm-arsenal-cross-body-hammer-curl", "Cross Body Hammer Curl", "BICEPS", "Dumbbells", "Drive the thumb toward the opposite shoulder and stay smooth.", "Match both sides before going heavier.", 3, 10, 12, 60),
  exercise("arm-arsenal-rope-pushdown", "Rope Pushdown", "TRICEPS", "Cable", "Split the rope hard and keep elbows pinned.", "Lockout quality comes before heavier stack.", 3, 10, 14, 60),
  exercise("arm-arsenal-straight-bar-pushdown", "Straight Bar Pushdown", "TRICEPS", "Cable", "Press straight down and don't let the shoulders roll.", "Beat total reps before adding weight.", 3, 10, 14, 60),
  exercise("arm-arsenal-overhead-cable-extension", "Overhead Cable Extension", "TRICEPS", "Cable", "Let the elbows travel naturally and fully stretch the triceps.", "Own the lengthened position before extra stack.", 3, 10, 14, 60),
  exercise("arm-arsenal-cable-kickback", "Cable Kickback", "TRICEPS", "Cable", "Stay hinged and lock the elbow in one place.", "Keep the finish crisp before more load.", 3, 12, 15, 60),
  exercise("arm-arsenal-close-grip-bench-press", "Close Grip Bench Press", "TRICEPS", "Barbell", "Tuck the elbows and drive with the triceps through the bar.", "Add small jumps while bar speed stays strong.", 3, 6, 8, 120),
  exercise("arm-arsenal-assisted-dip", "Assisted Dip", "TRICEPS", "Machine", "Stay upright and use the triceps to finish each rep.", "Reduce assistance as control improves.", 3, 8, 12, 75),
  exercise("arm-arsenal-single-arm-overhead-extension", "Single Arm Overhead Extension", "TRICEPS", "Cable", "Reach long through the stretch and finish with a clean lockout.", "Match both sides before adding more stack.", 3, 10, 14, 60),
  exercise("arm-arsenal-reverse-grip-pushdown", "Reverse Grip Pushdown", "TRICEPS", "Cable", "Keep elbows tucked and squeeze hard at the bottom.", "Stay smooth before loading higher.", 3, 12, 15, 60),
];

const legFoundryBonusExercises: WorkoutExerciseTemplateInput[] = [
  exercise("leg-foundry-back-squat", "Back Squat", "QUADS", "Barbell", "Brace hard, stay stacked, and push evenly through the feet.", "Depth and speed stay the priority before more load.", 3, 5, 8, 180),
  exercise("leg-foundry-leg-press", "Leg Press", "LEGS", "Machine", "Use full range without letting the knees cave inward.", "Own every inch of depth before adding plates.", 3, 10, 12, 90),
  exercise("leg-foundry-romanian-deadlift", "Romanian Deadlift", "HAMSTRINGS", "Barbell", "Push the hips back and keep the lats locked tight.", "Grow the stretch before chasing heavier load.", 3, 6, 8, 120),
  exercise("leg-foundry-leg-extension", "Leg Extension", "QUADS", "Machine", "Lift with intent and pause at the top of every rep.", "Top-end squeeze beats extra stack.", 3, 12, 15, 60),
  exercise("leg-foundry-seated-leg-curl", "Seated Leg Curl", "HAMSTRINGS", "Machine", "Keep hips pinned and squeeze the hamstrings hard.", "Pause the shortened position before moving heavier.", 3, 10, 14, 60),
  exercise("leg-foundry-bulgarian-split-squat", "Bulgarian Split Squat", "GLUTES", "Dumbbells", "Drop straight down and let the front leg drive up.", "Increase reps before heavier dumbbells.", 3, 8, 12, 75),
  exercise("leg-foundry-barbell-hip-thrust", "Barbell Hip Thrust", "GLUTES", "Barbell", "Keep ribs tucked and finish with a hard glute squeeze.", "Add load only if the top stays explosive.", 3, 8, 12, 90),
  exercise("leg-foundry-walking-lunge", "Walking Lunge", "GLUTES", "Dumbbells", "Use controlled steps and stay tall through the torso.", "Add total steps before extra weight.", 3, 12, 16, 75),
  exercise("leg-foundry-smith-reverse-lunge", "Smith Reverse Lunge", "GLUTES", "Smith Machine", "Step back with control and keep the front foot planted.", "Stability first, then load.", 3, 8, 12, 75),
  exercise("leg-foundry-goblet-squat", "Goblet Squat", "QUADS", "Dumbbells", "Sit deep and keep the chest tall over the weight.", "Full range comes before more load.", 3, 10, 15, 75),
  exercise("leg-foundry-step-up", "Step-Up", "GLUTES", "Dumbbells", "Drive through the box leg and don't bounce off the trail foot.", "Increase box control before heavier bells.", 3, 10, 12, 75),
  exercise("leg-foundry-adductor-machine", "Adductor Machine", "LEGS", "Machine", "Control the inward squeeze and own the end range.", "Stay smooth before heavier stack.", 3, 12, 15, 60),
  exercise("leg-foundry-standing-calf-raise", "Standing Calf Raise", "CALVES", "Machine", "Sink into the stretch and squeeze high at the top.", "Longer pauses beat sloppy heavier reps.", 4, 12, 15, 60),
  exercise("leg-foundry-single-leg-press", "Single Leg Press", "QUADS", "Machine", "Keep hips square and press through the full foot.", "Match both sides before loading heavier.", 3, 10, 12, 75),
  exercise("leg-foundry-glute-bridge", "Glute Bridge", "GLUTES", "Barbell", "Brace first and finish every rep with the glutes.", "Control the top pause before adding more load.", 3, 10, 12, 75),
];

const rawWorkoutTemplates: Record<SplitKey, WorkoutDayTemplateInput[]> = {
  PPL: [
    {
      slug: "push-prime",
      name: "Push Prime",
      focus: "Chest, shoulders, triceps",
      accent: "#ffd54f",
      description: "Heavy presses first, delts and triceps polished after.",
      estimatedMinutes: 68,
      exercises: [
        {
          slug: "incline-bench-press",
          name: "Incline Bench Press",
          muscleGroup: "CHEST",
          equipment: "Barbell",
          instructions: "Drive through the upper chest and keep the ribcage tall.",
          progressCue: "Add 2.5kg once you own the top of the rep range.",
          targetSets: 4,
          repRangeMin: 6,
          repRangeMax: 8,
          restSeconds: 150,
        },
        {
          slug: "seated-dumbbell-shoulder-press",
          name: "Seated Dumbbell Shoulder Press",
          muscleGroup: "SHOULDERS",
          equipment: "Dumbbells",
          instructions: "Keep wrists stacked and elbows slightly forward.",
          progressCue: "Chase clean lockouts before loading heavier.",
          targetSets: 4,
          repRangeMin: 8,
          repRangeMax: 10,
          restSeconds: 120,
        },
        {
          slug: "machine-chest-fly",
          name: "Machine Chest Fly",
          muscleGroup: "CHEST",
          equipment: "Machine",
          instructions: "Squeeze inward slowly and control the eccentric.",
          progressCue: "Pause for one second in the contracted position.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 75,
        },
        {
          slug: "cable-lateral-raise",
          name: "Cable Lateral Raise",
          muscleGroup: "SHOULDERS",
          equipment: "Cable",
          instructions: "Lead with the elbow and stop just above shoulder height.",
          progressCue: "Own the tempo, then add a rep before weight.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        {
          slug: "rope-pushdown",
          name: "Rope Pushdown",
          muscleGroup: "TRICEPS",
          equipment: "Cable",
          instructions: "Split the rope hard at the bottom without swinging.",
          progressCue: "Finish the set with elbows pinned, not shoulders rolling.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 14,
          restSeconds: 60,
        },
        ...pushPrimeBonusExercises,
      ],
    },
    {
      slug: "pull-power",
      name: "Pull Power",
      focus: "Back width, rear delts, biceps",
      accent: "#79d2c0",
      description: "Upper-back density and lat width with smart arm finishers.",
      estimatedMinutes: 72,
      exercises: [
        {
          slug: "weighted-pull-up",
          name: "Weighted Pull-Up",
          muscleGroup: "BACK",
          equipment: "Bodyweight",
          instructions: "Chest up, pull elbows to ribs, avoid leg swing.",
          progressCue: "Add 1.25kg when all sets stay explosive.",
          targetSets: 4,
          repRangeMin: 5,
          repRangeMax: 8,
          restSeconds: 150,
        },
        {
          slug: "chest-supported-row",
          name: "Chest Supported Row",
          muscleGroup: "BACK",
          equipment: "Machine",
          instructions: "Drive elbows back and pause on the top.",
          progressCue: "Beat last week with one extra rep before load.",
          targetSets: 4,
          repRangeMin: 8,
          repRangeMax: 10,
          restSeconds: 120,
        },
        {
          slug: "neutral-grip-lat-pulldown",
          name: "Neutral Grip Lat Pulldown",
          muscleGroup: "BACK",
          equipment: "Cable",
          instructions: "Pull to upper chest and control the stretch overhead.",
          progressCue: "Think elbows to hips, not hands to chest.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 75,
        },
        {
          slug: "rear-delt-fly",
          name: "Rear Delt Fly",
          muscleGroup: "SHOULDERS",
          equipment: "Machine",
          instructions: "Keep traps quiet and sweep with the upper arm.",
          progressCue: "Use cleaner range before adding plates.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        {
          slug: "ez-bar-curl",
          name: "EZ Bar Curl",
          muscleGroup: "BICEPS",
          equipment: "Barbell",
          instructions: "Keep elbows under shoulders and resist on the way down.",
          progressCue: "Stay strict and add reps across all working sets.",
          targetSets: 3,
          repRangeMin: 8,
          repRangeMax: 12,
          restSeconds: 60,
        },
        ...pullPowerBonusExercises,
      ],
    },
    {
      slug: "legs-launch",
      name: "Legs Launch",
      focus: "Quads, glutes, hamstrings, calves",
      accent: "#ff9f68",
      description: "Squat-centered lower-body work with posterior-chain support.",
      estimatedMinutes: 76,
      exercises: [
        {
          slug: "high-bar-back-squat",
          name: "High Bar Back Squat",
          muscleGroup: "QUADS",
          equipment: "Barbell",
          instructions: "Brace hard, sit between the hips, and drive evenly up.",
          progressCue: "When depth and speed stay clean, add 2.5kg.",
          targetSets: 4,
          repRangeMin: 5,
          repRangeMax: 8,
          restSeconds: 180,
        },
        {
          slug: "romanian-deadlift",
          name: "Romanian Deadlift",
          muscleGroup: "HAMSTRINGS",
          equipment: "Barbell",
          instructions: "Push hips back and keep lats packed all set long.",
          progressCue: "Grow range first, then chase extra load.",
          targetSets: 4,
          repRangeMin: 6,
          repRangeMax: 8,
          restSeconds: 150,
        },
        {
          slug: "leg-press",
          name: "Leg Press",
          muscleGroup: "LEGS",
          equipment: "Machine",
          instructions: "Full depth, knees track with toes, no bouncing.",
          progressCue: "Own 12 reps before stacking another plate.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 90,
        },
        {
          slug: "seated-leg-curl",
          name: "Seated Leg Curl",
          muscleGroup: "HAMSTRINGS",
          equipment: "Machine",
          instructions: "Keep hips pinned and squeeze the shortened position.",
          progressCue: "Pause hard on every rep, then progress load.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 14,
          restSeconds: 75,
        },
        {
          slug: "standing-calf-raise",
          name: "Standing Calf Raise",
          muscleGroup: "CALVES",
          equipment: "Machine",
          instructions: "Stretch long at the bottom and rise with control.",
          progressCue: "Use slower eccentrics before jumping weight.",
          targetSets: 4,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        ...legsLaunchBonusExercises,
      ],
    },
  ],
  BRO: [
    {
      slug: "chest-carve",
      name: "Chest Carve",
      focus: "Chest thickness and upper-pec detail",
      accent: "#ffd54f",
      description: "Classic chest day with pressing strength and cable finishers.",
      estimatedMinutes: 70,
      exercises: [
        {
          slug: "flat-bench-press",
          name: "Flat Bench Press",
          muscleGroup: "CHEST",
          equipment: "Barbell",
          instructions: "Plant the feet and keep the bar path deliberate.",
          progressCue: "Add 2.5kg when bar speed is still snappy.",
          targetSets: 4,
          repRangeMin: 5,
          repRangeMax: 8,
          restSeconds: 150,
        },
        {
          slug: "incline-dumbbell-press",
          name: "Incline Dumbbell Press",
          muscleGroup: "CHEST",
          equipment: "Dumbbells",
          instructions: "Pull shoulder blades down into the bench.",
          progressCue: "Beat last week's total reps before loading heavier.",
          targetSets: 4,
          repRangeMin: 8,
          repRangeMax: 10,
          restSeconds: 120,
        },
        {
          slug: "low-to-high-cable-fly",
          name: "Low To High Cable Fly",
          muscleGroup: "CHEST",
          equipment: "Cable",
          instructions: "Sweep upward and pause without shrugging.",
          progressCue: "Stay smooth and stretch the eccentric.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        {
          slug: "assisted-dips",
          name: "Assisted Dips",
          muscleGroup: "CHEST",
          equipment: "Machine",
          instructions: "Lean slightly forward and keep elbows controlled.",
          progressCue: "Reduce assistance gradually as control improves.",
          targetSets: 3,
          repRangeMin: 8,
          repRangeMax: 12,
          restSeconds: 75,
        },
        ...chestCarveBonusExercises,
      ],
    },
    {
      slug: "back-build",
      name: "Back Build",
      focus: "Back density and lat stretch",
      accent: "#79d2c0",
      description: "Heavy posterior-chain pull with rows and pulldowns.",
      estimatedMinutes: 74,
      exercises: [
        {
          slug: "conventional-deadlift",
          name: "Conventional Deadlift",
          muscleGroup: "BACK",
          equipment: "Barbell",
          instructions: "Wedge into the bar and drive the floor away.",
          progressCue: "Move fast singles before loading further.",
          targetSets: 3,
          repRangeMin: 3,
          repRangeMax: 5,
          restSeconds: 180,
        },
        {
          slug: "wide-grip-pulldown",
          name: "Wide Grip Pulldown",
          muscleGroup: "BACK",
          equipment: "Cable",
          instructions: "Pull shoulders down first, then elbows.",
          progressCue: "Keep every rep identical and crisp.",
          targetSets: 4,
          repRangeMin: 8,
          repRangeMax: 12,
          restSeconds: 90,
        },
        {
          slug: "seated-cable-row",
          name: "Seated Cable Row",
          muscleGroup: "BACK",
          equipment: "Cable",
          instructions: "Finish with the elbows and stop torso sway.",
          progressCue: "Pause longer on the final two reps of each set.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 75,
        },
        {
          slug: "straight-arm-pulldown",
          name: "Straight Arm Pulldown",
          muscleGroup: "BACK",
          equipment: "Cable",
          instructions: "Sweep through the lats with soft elbows.",
          progressCue: "Keep abs tight and ribcage stacked.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        ...backBuildBonusExercises,
      ],
    },
    {
      slug: "shoulder-sculpt",
      name: "Shoulder Sculpt",
      focus: "Delts and upper-frame shape",
      accent: "#8db4ff",
      description: "Strong overhead work followed by high-tension delt volume.",
      estimatedMinutes: 62,
      exercises: [
        {
          slug: "standing-overhead-press",
          name: "Standing Overhead Press",
          muscleGroup: "SHOULDERS",
          equipment: "Barbell",
          instructions: "Brace the trunk and press in a straight line.",
          progressCue: "Add weight only if the lockout stays strong.",
          targetSets: 4,
          repRangeMin: 5,
          repRangeMax: 8,
          restSeconds: 150,
        },
        {
          slug: "dumbbell-lateral-raise",
          name: "Dumbbell Lateral Raise",
          muscleGroup: "SHOULDERS",
          equipment: "Dumbbells",
          instructions: "Lead with elbows and keep the shrug out.",
          progressCue: "Slow the lowering phase before increasing load.",
          targetSets: 4,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        {
          slug: "reverse-pec-deck",
          name: "Reverse Pec Deck",
          muscleGroup: "SHOULDERS",
          equipment: "Machine",
          instructions: "Open the arms wide and keep neck relaxed.",
          progressCue: "Try extra pauses before more plates.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        {
          slug: "cable-y-raise",
          name: "Cable Y Raise",
          muscleGroup: "SHOULDERS",
          equipment: "Cable",
          instructions: "Raise in a Y path and hold the top position.",
          progressCue: "Earn range and control before heavier pins.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 60,
        },
        ...shoulderSculptBonusExercises,
      ],
    },
    {
      slug: "arm-arsenal",
      name: "Arm Arsenal",
      focus: "Biceps and triceps volume",
      accent: "#ff9f68",
      description: "Alternating curls and extensions to keep the pump rolling.",
      estimatedMinutes: 58,
      exercises: [
        {
          slug: "barbell-curl",
          name: "Barbell Curl",
          muscleGroup: "BICEPS",
          equipment: "Barbell",
          instructions: "Stay tall and don't drift the elbows back.",
          progressCue: "Add reps before swinging the bar.",
          targetSets: 4,
          repRangeMin: 8,
          repRangeMax: 10,
          restSeconds: 75,
        },
        {
          slug: "hammer-curl",
          name: "Hammer Curl",
          muscleGroup: "BICEPS",
          equipment: "Dumbbells",
          instructions: "Keep the wrist neutral and elbows pinned.",
          progressCue: "Own both arms evenly before increasing weight.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 60,
        },
        {
          slug: "skull-crusher",
          name: "Skull Crusher",
          muscleGroup: "TRICEPS",
          equipment: "EZ Bar",
          instructions: "Let the bar travel behind the head for stretch.",
          progressCue: "Stay strict and don't flare elbows out.",
          targetSets: 3,
          repRangeMin: 8,
          repRangeMax: 10,
          restSeconds: 75,
        },
        {
          slug: "rope-overhead-extension",
          name: "Rope Overhead Extension",
          muscleGroup: "TRICEPS",
          equipment: "Cable",
          instructions: "Keep ribs down and reach long at the bottom.",
          progressCue: "Stretch fully and own the lockout.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        ...armArsenalBonusExercises,
      ],
    },
    {
      slug: "leg-foundry",
      name: "Leg Foundry",
      focus: "Full lower-body hypertrophy",
      accent: "#73d89f",
      description: "Heavy compound work backed by machine volume and calves.",
      estimatedMinutes: 78,
      exercises: [
        {
          slug: "front-squat",
          name: "Front Squat",
          muscleGroup: "QUADS",
          equipment: "Barbell",
          instructions: "Elbows high, torso tall, and knees forward.",
          progressCue: "Add 2.5kg once posture stays upright on every rep.",
          targetSets: 4,
          repRangeMin: 5,
          repRangeMax: 8,
          restSeconds: 180,
        },
        {
          slug: "hack-squat",
          name: "Hack Squat",
          muscleGroup: "LEGS",
          equipment: "Machine",
          instructions: "Stay controlled through depth and keep feet planted.",
          progressCue: "Beat total reps before loading up.",
          targetSets: 4,
          repRangeMin: 8,
          repRangeMax: 10,
          restSeconds: 120,
        },
        {
          slug: "lying-leg-curl",
          name: "Lying Leg Curl",
          muscleGroup: "HAMSTRINGS",
          equipment: "Machine",
          instructions: "Press hips into the pad for a clean squeeze.",
          progressCue: "Pause the top to make each rep count.",
          targetSets: 3,
          repRangeMin: 10,
          repRangeMax: 12,
          restSeconds: 75,
        },
        {
          slug: "walking-lunge",
          name: "Walking Lunge",
          muscleGroup: "GLUTES",
          equipment: "Dumbbells",
          instructions: "Long stride, torso tall, and drive off the front foot.",
          progressCue: "Increase total steps before heavier dumbbells.",
          targetSets: 3,
          repRangeMin: 12,
          repRangeMax: 16,
          restSeconds: 75,
        },
        {
          slug: "seated-calf-raise",
          name: "Seated Calf Raise",
          muscleGroup: "CALVES",
          equipment: "Machine",
          instructions: "Full stretch and a hard squeeze up top.",
          progressCue: "Extend the pause, then chase extra load.",
          targetSets: 4,
          repRangeMin: 12,
          repRangeMax: 15,
          restSeconds: 60,
        },
        ...legFoundryBonusExercises,
      ],
    },
  ],
};

export const workoutTemplates: Record<SplitKey, WorkoutDayTemplateShape[]> =
  withExerciseDemoMedia(rawWorkoutTemplates);
