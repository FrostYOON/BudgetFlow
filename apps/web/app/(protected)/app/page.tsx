import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";

export default async function AppIndexPage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  redirect("/app/dashboard");
}
