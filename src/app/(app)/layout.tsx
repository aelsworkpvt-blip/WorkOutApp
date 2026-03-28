import { AppShell } from "@/components/app-shell";
import { getDashboardSnapshot } from "@/lib/data";
import { requireAppViewer } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await requireAppViewer();
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  const alarm = dashboard
    ? {
        userName: dashboard.profile.name,
        todayCompleted: dashboard.streak.todayCompleted,
        currentStreak: dashboard.streak.current,
        workoutHref: `/workouts?day=${dashboard.todayPlan.slug}`,
      }
    : null;

  return (
    <AppShell viewer={viewer} alarm={alarm}>
      {children}
    </AppShell>
  );
}
