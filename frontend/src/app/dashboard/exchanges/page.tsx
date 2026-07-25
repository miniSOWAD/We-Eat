import { redirect } from "next/navigation";
import { Repeat2, ShieldCheck } from "lucide-react";
import { ExchangesPanel } from "@/components/exchanges-panel";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Exchange } from "@/types";

export default async function Page() {
  const [token, user] = await Promise.all([getToken(), getSession()]);
  if (!user) return redirect("/login?next=/dashboard/exchanges");

  let items: Exchange[] = [];
  try { items = await backendFetch<Exchange[]>("/exchanges/mine", {}, token); } catch {}

  return (
    <div className="stack">
      <div className="pageIntro"><span className="badge badgeExchange">Food-for-food</span><h1 className="sectionTitle">Exchanges</h1><p className="sectionLead">Track written offers or offered listings, provider decisions and two-party completion.</p></div>
      <div className="softPanel" data-reveal><div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}><span><Repeat2 size={17} style={{ verticalAlign: "-4px", marginRight: 6 }} />Agree on the exact items and quantity.</span><span><ShieldCheck size={17} style={{ verticalAlign: "-4px", marginRight: 6 }} />Use the recorded workflow for accountability.</span></div></div>
      <div data-reveal><ExchangesPanel initial={items} userId={user.id} /></div>
    </div>
  );
}
