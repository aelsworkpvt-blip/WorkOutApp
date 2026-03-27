import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { LegalLinks } from "@/components/legal-links";
import type { ViewerState } from "@/lib/data";

export function SetupShell({
  viewer,
  children,
}: {
  viewer: ViewerState;
  children: React.ReactNode;
}) {
  return (
    <main className="px-4 py-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="panel-light flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <Link
              href="/split"
              className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-light)]/78"
            >
              FitX
            </Link>
            <p className="mt-2 text-lg font-[family:var(--font-sora)] text-[#171717]">
              Muscle-building setup starts here
            </p>
            <LegalLinks className="mt-4" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white/68 px-4 py-2 text-sm font-semibold text-[#171717]">
              {viewer.email ?? viewer.name ?? "Athlete"}
            </div>
            <form action={logoutAction}>
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
    </main>
  );
}
