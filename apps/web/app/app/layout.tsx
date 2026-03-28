import { AppShellFrame } from "@/components/app-shell/app-shell-frame";
import { getPreviewSession } from "@/lib/auth/preview-session";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getPreviewSession();

  return <AppShellFrame session={session}>{children}</AppShellFrame>;
}
