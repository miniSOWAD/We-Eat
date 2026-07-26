import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  FileWarning,
  History,
  ShieldCheck,
  Soup,
  UserCog,
  UsersRound,
} from "lucide-react";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { AdminStats, Exchange, Favorite, Listing, Order } from "@/types";
import styles from "./dashboard.module.css";

async function safeList<T>(path: string, token?: string): Promise<T[]> {
  try {
    return await backendFetch<T[]>(path, {}, token);
  } catch {
    return [];
  }
}

export default async function Page() {
  const [user, token] = await Promise.all([getSession(), getToken()]);
  if (!user) return null;

  if (user.role !== "USER") {
    let stats: AdminStats = {
      users: 0,
      moderators: 0,
      suspended_users: 0,
      active_listings: 0,
      open_reports: 0,
      completed_orders: 0,
      completed_exchanges: 0,
      rescued_items: 0,
    };

    try {
      stats = await backendFetch<AdminStats>("/admin/stats", {}, token);
    } catch {}

    const isAdmin = user.role === "ADMIN";
    const cards = [
      { label: "Basic users", value: stats.users, icon: UsersRound },
      { label: "Moderators", value: stats.moderators, icon: UserCog },
      { label: "Suspended", value: stats.suspended_users, icon: ShieldCheck },
      { label: "Open reports", value: stats.open_reports, icon: FileWarning },
    ];

    return (
      <div className="stack">
        <div className="pageIntro">
          <span className="badge badgeDiscounted">
            {isAdmin ? "Admin dashboard" : "Moderator dashboard"}
          </span>
          <h1 className="sectionTitle">Community operations</h1>
          <p className="sectionLead">
            Manage members, review reports and keep community activity moving smoothly.
          </p>
        </div>

        <div className={styles.metricGrid} data-stagger-grid>
          {cards.map(({ label, value, icon: Icon }) => (
            <div className={`card ${styles.metric}`} key={label} data-gsap-hover>
              <div className={styles.metricTop}>
                <span className={styles.metricIcon}>
                  <Icon size={18} />
                </span>
                <span className="badge badgeMuted">Live</span>
              </div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          ))}
        </div>

        <div className={`card ${styles.attention}`} data-reveal>
          <div>
            <h2>
              {stats.open_reports
                ? `${stats.open_reports} reports need attention`
                : "The report queue is clear"}
            </h2>
            <p>Review each concern carefully and leave a clear, fair outcome.</p>
          </div>
          <Link
            className="button buttonPrimary"
            href={isAdmin ? "/dashboard/admin/reports" : "/dashboard/moderator/reports"}
          >
            Review reports
          </Link>
        </div>

        <div className={styles.quickLinks} data-stagger-grid>
          <Link
            className={styles.quickLink}
            href={isAdmin ? "/dashboard/admin/users" : "/dashboard/moderator/users"}
          >
            <UsersRound size={20} />
            <strong>Manage users</strong>
            <span>Search members and manage account access.</span>
          </Link>
          {isAdmin && (
            <Link className={styles.quickLink} href="/dashboard/admin/moderators">
              <UserCog size={20} />
              <strong>Manage moderators</strong>
              <span>Promote trusted members or update moderator access.</span>
            </Link>
          )}
          <Link
            className={styles.quickLink}
            href={isAdmin ? "/dashboard/admin/audit-logs" : "/dashboard/moderator/audit-logs"}
          >
            <History size={20} />
            <strong>Activity history</strong>
            <span>Review recent moderation decisions and account changes.</span>
          </Link>
        </div>
      </div>
    );
  }

  const [listings, orders, exchanges, favorites] = await Promise.all([
    safeList<Listing>("/listings/mine", token),
    safeList<Order>("/orders/mine", token),
    safeList<Exchange>("/exchanges/mine", token),
    safeList<Favorite>("/favorites", token),
  ]);
  const completed =
    orders.filter((item) => item.status === "COMPLETED").length +
    exchanges.filter((item) => item.status === "COMPLETED").length;
  const cards = [
    { label: "My listed food", value: listings.length, icon: Soup },
    { label: "Completed deals", value: completed, icon: CheckCircle2 },
    { label: "Saved foods", value: favorites.length, icon: Bookmark },
  ];

  return (
    <div className="stack">
      <div className="pageIntro">
        <span className="badge badgeDiscounted">User dashboard</span>
        <h1 className="sectionTitle">Your We Eat activity</h1>
        <p className="sectionLead">
          Manage the food you listed, completed deals, saved items and account settings.
        </p>
      </div>
      <div className={styles.metricGrid} data-stagger-grid>
        {cards.map(({ label, value, icon: Icon }) => (
          <div className={`card ${styles.metric}`} key={label} data-gsap-hover>
            <div className={styles.metricTop}>
              <span className={styles.metricIcon}>
                <Icon size={18} />
              </span>
              <span className="badge badgeMuted">Account</span>
            </div>
            <strong>{value}</strong>
            <p>{label}</p>
          </div>
        ))}
      </div>
      <div className={`card ${styles.attention}`} data-reveal>
        <div>
          <h2>Keep your listings accurate</h2>
          <p>Remove unavailable food promptly and confirm a deal only after handover.</p>
        </div>
        <Link className="button buttonPrimary" href="/share">
          Share food
        </Link>
      </div>
      <div className={styles.quickLinks} data-stagger-grid>
        <Link className={styles.quickLink} href="/dashboard/listings">
          <Soup size={20} />
          <strong>My listed food</strong>
          <span>Update the status of food you published.</span>
        </Link>
        <Link className={styles.quickLink} href="/dashboard/deals">
          <CheckCircle2 size={20} />
          <strong>Completed deals</strong>
          <span>See completed orders and exchanges.</span>
        </Link>
        <Link className={styles.quickLink} href="/dashboard/reports/new">
          <FileWarning size={20} />
          <strong>Submit a report</strong>
          <span>Report a listing, user or comment for review.</span>
        </Link>
      </div>
    </div>
  );
}
