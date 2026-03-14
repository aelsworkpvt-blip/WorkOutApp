import { redirect } from "next/navigation";
import { getCurrentViewer } from "@/lib/auth";
import { getHomePath } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const viewer = await getCurrentViewer();

  redirect(getHomePath(viewer));
}
