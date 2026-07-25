import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { AdminStats, UserMe } from "@/types";

type AdminUser = UserMe & { updated_at: string };

export default async function Page() {
  const [user, token] = await Promise.all([getSession(), getToken()]);

  if (!user) {
    return redirect("/login?next=/admin");
  }
  if (user.role !== "ADMIN") {
    return redirect("/dashboard");
  }

  let stats: AdminStats = {
    users: 0,
    active_listings: 0,
    open_reports: 0,
    completed_orders: 0,
    completed_exchanges: 0,
    rescued_items: 0,
  };
  let users: AdminUser[] = [];

  try {
    [stats, users] = await Promise.all([
      backendFetch<AdminStats>("/admin/stats", {}, token),
      backendFetch<AdminUser[]>("/admin/users", {}, token),
    ]);
  } catch {
    // Keep the control centre usable if one upstream request fails.
  }

  const cards = [
    { label: "Users", value: stats.users },
    { label: "Active listings", value: stats.active_listings },
    { label: "Open reports", value: stats.open_reports },
    { label: "Completed orders", value: stats.completed_orders },
    { label: "Completed exchanges", value: stats.completed_exchanges },
    { label: "Rescued portions", value: stats.rescued_items },
  ];

  return (
    <main className="page">
      <div className="container stack">
        <div>
          <span className="badge badgeDiscounted">Administration</span>
          <h1 className="sectionTitle" style={{ marginTop: 16 }}>
            Platform control centre
          </h1>
          <p className="sectionLead">
            Manage current roles and account status. Changes revoke the affected
            user&apos;s existing session.
          </p>
        </div>
        <div className="grid">
          {cards.map((card) => (
            <div className="card" key={card.label} style={{ padding: 22 }}>
              <strong style={{ fontSize: 34 }}>{card.value}</strong>
              <div className="muted">{card.label}</div>
            </div>
          ))}
        </div>
        <h2>User management</h2>
        <AdminPanel initial={users} />
      </div>
    </main>
  );
}
