import { redirect } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { OrdersPanel } from "@/components/orders-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Order } from "@/types";

export default async function Page() {
  const [token, user] = await Promise.all([getToken(), getSession()]);
  if (!user) return redirect("/login?next=/dashboard/orders");

  let items: Order[] = [];
  try { items = await backendFetch<Order[]>("/orders/mine", {}, token); } catch {}

  return (
    <div className="stack">
      <div className="pageIntro"><span className="badge badgeDiscounted">Order workflow</span><h1 className="sectionTitle">Food requests</h1><p className="sectionLead">A provider accepts one request, prepares the handover and then both parties confirm completion.</p></div>
      <div className="softPanel" data-reveal><div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}><span><Clock3 size={17} style={{ verticalAlign: "-4px", marginRight: 6 }} />Reply promptly to active requests.</span><span><CheckCircle2 size={17} style={{ verticalAlign: "-4px", marginRight: 6 }} />Confirm only after the handover occurs.</span></div></div>
      <div data-reveal><OrdersPanel initial={items} userId={user.id} /></div>
    </div>
  );
}
