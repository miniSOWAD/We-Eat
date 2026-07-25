import Link from "next/link";
import { Bookmark, ClipboardList, Plus, Repeat2, Soup } from "lucide-react";
import { backendFetch, getToken } from "@/lib/server-api";
import type { Exchange, Favorite, Listing, Order } from "@/types";
import styles from "./dashboard.module.css";

async function safe<T>(path: string, token?: string): Promise<T[]> {
  try { return await backendFetch<T[]>(path, {}, token); } catch { return []; }
}

export default async function Page() {
  const token = await getToken();
  const [listings, orders, exchanges, favorites] = await Promise.all([
    safe<Listing>("/listings/mine", token),
    safe<Order>("/orders/mine", token),
    safe<Exchange>("/exchanges/mine", token),
    safe<Favorite>("/favorites", token),
  ]);

  const cards = [
    { label: "My listings", value: listings.length, icon: Soup },
    { label: "Active requests", value: orders.filter((order) => ["REQUESTED", "ACCEPTED", "READY"].includes(order.status)).length, icon: ClipboardList },
    { label: "Active exchanges", value: exchanges.filter((exchange) => ["PENDING", "ACCEPTED"].includes(exchange.status)).length, icon: Repeat2 },
    { label: "Saved food", value: favorites.length, icon: Bookmark },
  ];

  return (
    <div className="stack">
      <div className="pageIntro">
        <span className="badge badgeDiscounted">Dashboard</span>
        <h1 className="sectionTitle">Your We Eat activity</h1>
        <p className="sectionLead">Manage listings, requests, exchanges and saved food from one place.</p>
      </div>

      <div className={styles.metricGrid} data-stagger-grid>
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className={`card ${styles.metric}`}>
            <div className={styles.metricTop}><span className={styles.metricIcon}><Icon size={19} /></span><span className="badge badgeMuted">Live</span></div>
            <strong>{value}</strong><p>{label}</p>
          </div>
        ))}
      </div>

      <div className={`card ${styles.attention}`} data-reveal>
        <div><h2>What needs attention</h2><p>Review new requests promptly. Once both parties confirm completion, the review flow becomes available.</p></div>
        <Link className="button buttonPrimary" href="/dashboard/orders">Review requests</Link>
      </div>

      <div className={styles.quickLinks} data-reveal>
        <Link className={styles.quickLink} href="/share"><Plus size={20} /><strong>Share food</strong><span>Publish a free, discounted or exchange listing.</span></Link>
        <Link className={styles.quickLink} href="/dashboard/listings"><Soup size={20} /><strong>Manage listings</strong><span>Update the status of food you have published.</span></Link>
        <Link className={styles.quickLink} href="/dashboard/profile"><Bookmark size={20} /><strong>Update profile</strong><span>Keep your public community information current.</span></Link>
      </div>
    </div>
  );
}
