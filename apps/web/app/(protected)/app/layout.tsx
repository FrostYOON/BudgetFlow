import { AppShellFrame } from "@/components/app-shell/app-shell-frame";
import { getAppSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <AppShellFrame session={session}>{children}</AppShellFrame>;
}
