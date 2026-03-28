"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Dumbbell, Gauge, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Gauge,
  },
  {
    href: "/workouts",
    label: "Workout",
    icon: Dumbbell,
  },
  {
    href: "/history",
    label: "History",
    icon: CalendarDays,
  },
  {
    href: "/progress",
    label: "Weekly",
    icon: BarChart3,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 md:hidden">
      <div className="flex w-full max-w-md items-center justify-between rounded-full border border-white/12 bg-[#111622]/94 px-2 py-2 shadow-[0_20px_60px_rgba(10,14,22,0.28)] backdrop-blur-xl">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "inline-flex flex-1 flex-col items-center justify-center rounded-full px-3 py-2 text-[11px] font-semibold transition",
                isActive ? "bg-[#ffd54f] text-[#171717]" : "text-white/70 hover:bg-white/8",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
