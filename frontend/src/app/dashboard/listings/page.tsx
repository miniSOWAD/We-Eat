import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { MyListings } from "@/components/my-listings";
import { backendFetch, getToken } from "@/lib/server-api";
import type { Listing } from "@/types";

export default async function Page() {
  const token = await getToken();
  let items: Listing[] = [];
  try { items = await backendFetch<Listing[]>("/listings/mine", {}, token); } catch {}

  return (
    <div className="stack">
      <div className="pageIntro"><span className="badge badgeFree">Provider tools</span><h1 className="sectionTitle">My listings</h1><p className="sectionLead">Manage every listing, including food that has been completed or removed from public discovery.</p></div>
      <div className="softPanel" data-reveal><div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}><div><strong><ShieldCheck size={18} style={{ verticalAlign: "-4px", marginRight: 7 }} />Keep availability current</strong><p className="muted" style={{ marginBottom: 0 }}>Remove a listing promptly when the food is no longer available or suitable to share.</p></div><Link className="button buttonPrimary" href="/share"><Plus size={17} /> New listing</Link></div></div>
      <div data-reveal><MyListings initial={items} /></div>
    </div>
  );
}
