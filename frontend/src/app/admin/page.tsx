import { redirect } from "next/navigation";
import { Activity, ClipboardCheck, ShieldCheck, Soup, UserCog, UsersRound } from "lucide-react";
import { AdminPanel } from "@/components/admin-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { AdminStats, UserMe } from "@/types";

type AdminUser = UserMe & { updated_at: string };

export default async function Page() {
  const [user, token] = await Promise.all([getSession(), getToken()]);
  if (!user) return redirect("/login?next=/admin");
  if (user.role !== "ADMIN") return redirect("/dashboard");

  let stats: AdminStats = { users: 0, active_listings: 0, open_reports: 0, completed_orders: 0, completed_exchanges: 0, rescued_items: 0 };
  let users: AdminUser[] = [];
  try {
    [stats, users] = await Promise.all([
      backendFetch<AdminStats>("/admin/stats", {}, token),
      backendFetch<AdminUser[]>("/admin/users", {}, token),
    ]);
  } catch {}

  const cards = [
    { label: "Users", value: stats.users, icon: UsersRound },
    { label: "Active listings", value: stats.active_listings, icon: Soup },
    { label: "Open reports", value: stats.open_reports, icon: ShieldCheck },
    { label: "Completed orders", value: stats.completed_orders, icon: ClipboardCheck },
    { label: "Completed exchanges", value: stats.completed_exchanges, icon: Activity },
    { label: "Rescued portions", value: stats.rescued_items, icon: UserCog },
  ];

  return (
    <main className="page">
      <div className="container stack">
        <div className="pageIntro" data-hero-item><span className="badge badgeDiscounted">Administration</span><h1 className="sectionTitle">Platform control centre</h1><p className="sectionLead">Review platform activity and manage current roles or account status. Access changes revoke the affected user’s existing session.</p></div>
        <div className="grid" data-stagger-grid>
          {cards.map(({ label, value, icon: Icon }) => <div className="card" key={label} style={{ padding: 22 }}><span className="iconBox"><Icon size={19} /></span><strong className="metricValue" style={{ marginTop: 15 }}>{value}</strong><div className="muted">{label}</div></div>)}
        </div>
        <div className="softPanel" data-reveal><strong>High-impact controls.</strong><p className="muted" style={{ marginBottom: 0 }}>Role and suspension changes affect what users can access. Verify the account and reason before changing either field.</p></div>
        <div data-reveal><h2>User management</h2><AdminPanel initial={users} /></div>
      </div>
    </main>
  );
}
