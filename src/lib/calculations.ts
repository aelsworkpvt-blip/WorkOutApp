type GoalKey = "FAT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "PERFORMANCE";
type ActivityKey = "LIGHT" | "MODERATE" | "HIGH" | "ATHLETE";
type GenderKey = "MALE" | "FEMALE" | "OTHER";

export function activityMultiplier(activityLevel: ActivityKey) {
  switch (activityLevel) {
    case "LIGHT":
      return 1.35;
    case "MODERATE":
      return 1.55;
    case "HIGH":
      return 1.72;
    case "ATHLETE":
      return 1.9;
    default:
      return 1.55;
  }
}

export function calculateBmr({
  weightKg,
  heightCm,
  age,
  gender,
}: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: GenderKey;
}) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === "MALE") {
    return base + 5;
  }

  if (gender === "FEMALE") {
    return base - 161;
  }

  return base - 78;
}

export function calculateNutritionTargets({
  age,
  gender,
  heightCm,
  weightKg,
  activityLevel,
  goalType,
}: {
  age: number;
  gender: GenderKey;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityKey;
  goalType: GoalKey;
}) {
  const maintenanceCalories =
    calculateBmr({ age, gender, heightCm, weightKg }) *
    activityMultiplier(activityLevel);

  const targetCalories =
    goalType === "FAT_LOSS"
      ? maintenanceCalories - 350
      : goalType === "MUSCLE_GAIN"
        ? maintenanceCalories + 280
        : goalType === "PERFORMANCE"
          ? maintenanceCalories + 120
          : maintenanceCalories;

  const proteinG =
    goalType === "FAT_LOSS"
      ? weightKg * 2.2
      : goalType === "MUSCLE_GAIN"
        ? weightKg * 2.05
        : weightKg * 1.85;

  const fatG = Math.max(weightKg * 0.8, 55);
  const fiberG = Math.max(targetCalories / 1000, 2.2) * 14;
  const remainingCalories = targetCalories - proteinG * 4 - fatG * 9;
  const carbsG = remainingCalories / 4;
  const hydrationLiters = Math.max(2.8, weightKg * 0.04);

  return {
    calories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(Math.max(carbsG, 120)),
    fatG: Math.round(fatG),
    fiberG: Math.round(fiberG),
    hydrationLiters: Math.round(hydrationLiters * 10) / 10,
  };
}

export function calculateVolume({
  setsCompleted,
  repsCompleted,
  weightKg,
}: {
  setsCompleted: number;
  repsCompleted: number;
  weightKg: number;
}) {
  return Number((setsCompleted * repsCompleted * weightKg).toFixed(2));
}

export function estimateWorkoutCalories({
  bodyWeightKg,
  durationMin,
  intensityScale = 6.4,
}: {
  bodyWeightKg: number;
  durationMin: number;
  intensityScale?: number;
}) {
  const calories = (intensityScale * 3.5 * bodyWeightKg * durationMin) / 200;
  return Math.round(calories);
}

export function getProgressSuggestion({
  weightKg,
  repsCompleted,
  repRangeMax,
}: {
  weightKg: number;
  repsCompleted: number;
  repRangeMax: number;
}) {
  if (repsCompleted >= repRangeMax) {
    return {
      nextWeightKg: Number((weightKg + 2.5).toFixed(1)),
      nextReps: repRangeMax,
      label: "Time to nudge the load up",
    };
  }

  return {
    nextWeightKg: weightKg,
    nextReps: repsCompleted + 1,
    label: "Beat the rep count before loading heavier",
  };
}

export function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return `${value}`;
}

export function formatSigned(value: number, fractionDigits = 1) {
  const rounded = value.toFixed(fractionDigits);
  return value > 0 ? `+${rounded}` : rounded;
}
