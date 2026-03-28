import { getPreviewSession } from "@/src/features/auth/server/preview-session";
import { AppShellFrame } from "@/src/features/app-shell/components/app-shell-frame";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getPreviewSession();

  return <AppShellFrame session={session}>{children}</AppShellFrame>;
}
