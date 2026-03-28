import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { GymAlarmManager } from "@/components/gym-alarm-manager";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { WelcomeCarousel } from "@/components/welcome-carousel";
import type { ViewerState } from "@/lib/data";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/workouts", label: "Workout Picker" },
  { href: "/progress", label: "Weekly Progress" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({
  viewer,
  alarm,
  children,
}: {
  viewer: ViewerState;
  alarm: {
    userName: string;
    todayCompleted: boolean;
    currentStreak: number;
    workoutHref: string;
  } | null;
  children: React.ReactNode;
}) {
  const userName =
    viewer.name?.trim().split(" ")[0] ?? viewer.email?.split("@")[0] ?? "Athlete";

  return (
    <main className="px-4 py-4 pb-28 sm:px-6 lg:px-8">
      {!viewer.hasSeenWelcomeCarousel ? (
        <WelcomeCarousel userName={userName} />
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="panel-light hidden flex-col gap-4 p-4 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-light)]/78">
                FitX
              </p>
              <p className="mt-2 text-lg font-[family:var(--font-sora)] text-[#171717]">
                Mobile-first training flow
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {appLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="rounded-full border border-black/8 bg-white/65 px-4 py-2 text-sm font-semibold text-[#171717] transition hover:-translate-y-0.5"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/68 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted-light)]/75">
                Signed in
              </p>
              <p className="mt-1 text-sm font-semibold text-[#171717]">
                {viewer.email ?? viewer.name ?? "Athlete"}
              </p>
            </div>
            <form action={logoutAction} className="hidden lg:block">
              <button
                type="submit"
                className="rounded-full bg-[#171717] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {children}
      </div>

      {alarm ? (
        <GymAlarmManager
          userName={alarm.userName}
          todayCompleted={alarm.todayCompleted}
          currentStreak={alarm.currentStreak}
          workoutHref={alarm.workoutHref}
        />
      ) : null}

      <MobileBottomNav />
    </main>
  );
}
