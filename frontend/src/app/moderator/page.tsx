import { redirect } from "next/navigation";
import { ModerationPanel } from "@/components/moderation-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Report } from "@/types";

export default async function Page() {
  const [user, token] = await Promise.all([getSession(), getToken()]);

  if (!user) {
    return redirect("/login?next=/moderator");
  }
  if (!["MODERATOR", "ADMIN"].includes(user.role)) {
    return redirect("/dashboard");
  }

  let reports: Report[] = [];
  try {
    reports = await backendFetch<Report[]>("/reports/moderation", {}, token);
  } catch {
    // Render an empty state; the client panel can retry after navigation.
  }

  return (
    <main className="page">
      <div className="container stack">
        <div>
          <span className="badge badgeExchange">Moderator workspace</span>
          <h1 className="sectionTitle" style={{ marginTop: 16 }}>
            Reports and investigations
          </h1>
          <p className="sectionLead">
            Every status change is written to the audit log.
          </p>
        </div>
        <ModerationPanel initial={reports} />
      </div>
    </main>
  );
}
