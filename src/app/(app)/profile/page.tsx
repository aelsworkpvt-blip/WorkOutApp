import { redirect } from "next/navigation";
import { Flame, LogOut, Scale, Target, UserRound } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { SectionHead } from "@/components/section-head";
import { getDashboardSnapshot } from "@/lib/data";
import { requireAppViewer } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewer = await requireAppViewer();
  const dashboard = await getDashboardSnapshot({ allowDemoFallback: false });

  if (!dashboard) {
    redirect("/");
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="panel-dark p-6 sm:p-8">
          <SectionHead
            eyebrow="Profile"
            title="Account, goals, and app actions live here."
            description="On mobile, logout now belongs on this profile page instead of floating at the top of every screen."
            dark
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-2 text-sm text-white/55">
                <UserRound className="h-4 w-4 text-[#ffd54f]" />
                Account
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">
                {viewer.name ?? dashboard.profile.name}
              </p>
              <p className="mt-2 text-sm text-white/62">
                {viewer.email ?? "No email connected"}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-2 text-sm text-white/55">
                <Target className="h-4 w-4 text-[#79d2c0]" />
                Training setup
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">
                {dashboard.profile.splitPreference === "PPL" ? "Push Pull Legs" : "Bro Split"}
              </p>
              <p className="mt-2 text-sm text-white/62">
                Goal: {dashboard.profile.goalType.replaceAll("_", " ").toLowerCase()}
              </p>
            </div>
          </div>

          <form action={logoutAction} className="mt-6">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#ffd54f] px-5 py-4 text-sm font-semibold text-[#171717] transition hover:bg-[#ffe07a] sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>

        <div className="panel-light p-6 sm:p-8">
          <SectionHead
            eyebrow="Quick stats"
            title="The profile page still gives useful context."
            description="This keeps the mobile profile screen from feeling empty while still making logout easy to find."
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/72 p-5">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                <Scale className="h-4 w-4 text-[#ff9f68]" />
                Current weight
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#171717]">
                {dashboard.profile.currentWeightKg}kg
              </p>
            </div>

            <div className="rounded-[24px] bg-white/72 p-5">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                <Flame className="h-4 w-4 text-[#ffd54f]" />
                Daily calories
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#171717]">
                {dashboard.nutrition.calories}
              </p>
            </div>

            <div className="rounded-[24px] bg-white/72 p-5">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
                <Target className="h-4 w-4 text-[#79d2c0]" />
                Weekly target
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#171717]">
                {dashboard.completion.workoutTarget}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-white/72 p-5">
            <p className="text-sm text-[var(--muted-light)]">Profile note</p>
            <p className="mt-3 text-lg font-semibold text-[#171717]">
              This page is now the mobile account area.
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-light)]">
              Dashboard stays focused on overview, workouts stay focused on training,
              weekly stays focused on progress, and profile handles account actions like logout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
