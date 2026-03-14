import { AppShell } from "@/components/app-shell";
import { requireAppViewer } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await requireAppViewer();

  return <AppShell viewer={viewer}>{children}</AppShell>;
}
