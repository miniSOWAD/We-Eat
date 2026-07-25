import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getSession } from "@/lib/server-api";

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getSession();
  if (!user) {
    return redirect("/login?next=/dashboard");
  }

  return (
    <main className="page">
      <DashboardShell user={user}>{children}</DashboardShell>
    </main>
  );
}
