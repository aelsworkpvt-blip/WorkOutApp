import { redirect } from "next/navigation";
import { WorkoutSection } from "@/components/workout-section";
import { getDashboardSnapshot } from "@/lib/data";

export const dynamic = "force-dynamic";

type WorkoutsPageProps = {
  searchParams: Promise<{
    day?: string;
  }>;
};

export default async function WorkoutsPage({
  searchParams,
}: WorkoutsPageProps) {
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  if (!dashboard) {
    redirect("/");
  }

  const params = await searchParams;
  const activePlan =
    dashboard.workoutPlans.find((plan) => plan.slug === params.day) ??
    dashboard.todayPlan;

  return (
    <div className="grid gap-6">
      <WorkoutSection
        data={dashboard}
        activePlan={activePlan}
        activeDaySlug={activePlan.slug}
        dayHrefBase="/workouts"
        showSidebar={false}
        compactIntro
      />
    </div>
  );
}
