import { redirect } from "next/navigation";
import { WorkoutSection } from "@/components/workout-section";
import { getWorkoutPageData } from "@/lib/data";

export const dynamic = "force-dynamic";

type WorkoutsPageProps = {
  searchParams: Promise<{
    day?: string;
  }>;
};

export default async function WorkoutsPage({
  searchParams,
}: WorkoutsPageProps) {
  const workoutPage = await getWorkoutPageData();

  if (!workoutPage) {
    redirect("/");
  }

  const params = await searchParams;
  const activePlan =
    workoutPage.workoutPlans.find((plan) => plan.slug === params.day) ??
    workoutPage.todayPlan;

  return (
    <div className="grid gap-6">
      <WorkoutSection
        data={workoutPage}
        activePlan={activePlan}
        activeDaySlug={activePlan.slug}
        dayHrefBase="/workouts"
        showSidebar={false}
        compactIntro
      />
    </div>
  );
}
