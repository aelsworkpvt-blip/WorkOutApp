import { redirect } from "next/navigation";
import { Flame, Scale, TrendingUp } from "lucide-react";
import { ProgressSection } from "@/components/progress-section";
import { SectionHead } from "@/components/section-head";
import { getDashboardSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  if (!dashboard) {
    redirect("/");
  }

  return (
    <div className="grid gap-6">
      <section className="panel-dark p-6 sm:p-8">
        <SectionHead
          eyebrow="Weekly digest"
          title="Weekly performance snapshot."
          description="Check your workout count, average burn, and moved volume for the current week."
          dark
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <TrendingUp className="h-4 w-4 text-[#79d2c0]" />
              Sessions
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.weeklyDigest.workoutsCompleted}/{dashboard.weeklyDigest.workoutTarget}
            </p>
            <p className="mt-2 text-sm text-white/58">{dashboard.weeklyDigest.weekLabel}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <Flame className="h-4 w-4 text-[#ffd54f]" />
              Avg burn
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.weeklyDigest.averageCaloriesBurned}
            </p>
            <p className="mt-2 text-sm text-white/58">Calories per workout</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <Scale className="h-4 w-4 text-[#ff9f68]" />
              Volume
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dashboard.weeklyDigest.totalVolumeKg}kg
            </p>
            <p className="mt-2 text-sm text-white/58">Moved this week</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/8 bg-white/4 p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-white/40">
            Highlight
          </p>
          <p className="mt-3 text-lg font-semibold text-white">
            {dashboard.weeklyDigest.highlight}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/64">
            Next focus: {dashboard.weeklyDigest.focusForNextWeek}
          </p>
        </div>
      </section>

      <ProgressSection data={dashboard} />
    </div>
  );
}
