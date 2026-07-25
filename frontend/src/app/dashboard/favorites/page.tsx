import { Bookmark, Database } from "lucide-react";
import { FavoritesPanel } from "@/components/favorites-panel";
import { backendFetch, getToken } from "@/lib/server-api";
import type { Favorite } from "@/types";

export default async function Page() {
  const token = await getToken();
  let items: Favorite[] = [];
  try { items = await backendFetch<Favorite[]>("/favorites", {}, token); } catch {}

  return (
    <div className="stack">
      <div className="pageIntro"><span className="badge badgeFree">Saved discovery</span><h1 className="sectionTitle">Saved food</h1><p className="sectionLead">Keep interesting listings in your account while you decide whether to send a request.</p></div>
      <div className="softPanel" data-reveal><Bookmark size={18} style={{ verticalAlign: "-4px", marginRight: 7 }} /><strong>Account-backed favorites.</strong><span className="muted"> <Database size={15} style={{ verticalAlign: "-3px" }} /> They are stored in the database, not only in this browser.</span></div>
      <div data-reveal><FavoritesPanel initial={items} /></div>
    </div>
  );
}
