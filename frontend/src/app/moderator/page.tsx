import { redirect } from "next/navigation";
import { ClipboardCheck, History, ShieldCheck } from "lucide-react";
import { ModerationPanel } from "@/components/moderation-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Report } from "@/types";

export default async function Page() {
  const [user, token] = await Promise.all([getSession(), getToken()]);
  if (!user) return redirect("/login?next=/moderator");
  if (!["MODERATOR", "ADMIN"].includes(user.role)) return redirect("/dashboard");

  let reports: Report[] = [];
  try { reports = await backendFetch<Report[]>("/reports/moderation", {}, token); } catch {}

  return (
    <main className="page">
      <div className="container stack">
        <div className="pageIntro" data-hero-item><span className="badge badgeExchange">Moderator workspace</span><h1 className="sectionTitle">Reports and investigations</h1><p className="sectionLead">Review community reports consistently, record a resolution note and avoid taking action without enough evidence.</p></div>
        <div className="softPanel" data-reveal><div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}><span><ShieldCheck size={18} style={{ verticalAlign: "-4px", marginRight: 7 }} />Investigate the reported target.</span><span><ClipboardCheck size={18} style={{ verticalAlign: "-4px", marginRight: 7 }} />Record a clear outcome.</span><span><History size={18} style={{ verticalAlign: "-4px", marginRight: 7 }} />Every status change enters the audit log.</span></div></div>
        <div data-reveal><ModerationPanel initial={reports} /></div>
      </div>
    </main>
  );
}
