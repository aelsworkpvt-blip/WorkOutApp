import { redirect } from "next/navigation";
import { AuthEntry } from "@/components/auth-entry";
import { getCurrentViewer } from "@/lib/auth";
import { getHomePath } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{
    accountDeleted?: string;
  }>;
}) {
  const params = await searchParams;
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect(getHomePath(viewer));
  }

  const notice =
    params.accountDeleted === "1"
      ? "Your account and saved training data have been deleted."
      : null;

  return (
    <main className="px-4 py-4 sm:px-6 lg:px-8">
       <div className="mx-auto max-w-7xl">
        <AuthEntry notice={notice} />
      </div>
    </main>
  );
}
