"use client";

import type { DashboardSnapshot } from "@/lib/data";
import { ProgressCharts } from "@/components/progress-charts";
import { SectionHead } from "@/components/section-head";
import { SubmitButton } from "@/components/submit-button";
import { saveMeasurementEntryAction } from "@/app/actions";

export function ProgressSection({ data }: { data: DashboardSnapshot }) {
  return (
    <section id="progress" className="grid gap-6">
      <ProgressCharts
        measurements={data.recentMeasurements}
        strength={data.strengthTrend}
      />

      <div className="panel-light p-6 sm:p-8">
        <SectionHead
          eyebrow="Weekly check-in"
          title="Measurement entries that prove the plan is working."
          description="Bodyweight alone lies. Waist, chest, arms, thighs, and body-fat trend make the progress feel real."
        />

        <form action={saveMeasurementEntryAction} className="mt-8 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-[var(--muted-light)]">Weight<input name="weightKg" type="number" step="0.1" defaultValue={data.profile.currentWeightKg} className="field-light" /></label>
            <label className="text-sm text-[var(--muted-light)]">Chest<input name="chestCm" type="number" step="0.1" className="field-light" /></label>
            <label className="text-sm text-[var(--muted-light)]">Waist<input name="waistCm" type="number" step="0.1" className="field-light" /></label>
            <label className="text-sm text-[var(--muted-light)]">Hips<input name="hipsCm" type="number" step="0.1" className="field-light" /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-[var(--muted-light)]">Arm<input name="armCm" type="number" step="0.1" className="field-light" /></label>
            <label className="text-sm text-[var(--muted-light)]">Thigh<input name="thighCm" type="number" step="0.1" className="field-light" /></label>
            <label className="text-sm text-[var(--muted-light)]">Calf<input name="calfCm" type="number" step="0.1" className="field-light" /></label>
            <label className="text-sm text-[var(--muted-light)]">Body fat %<input name="bodyFatPct" type="number" step="0.1" className="field-light" /></label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-[22px] bg-white/72 px-4 py-4 text-sm leading-7 text-[var(--muted-light)]">
              Weekly entries feed the progress charts, recalculated calories, and the digest.
            </div>
            <SubmitButton pendingLabel="Saving measurement..." className="bg-[#171717] text-white hover:bg-[#262626]">
              Save weekly check-in
            </SubmitButton>
          </div>
        </form>
      </div>
    </section>
  );
}
