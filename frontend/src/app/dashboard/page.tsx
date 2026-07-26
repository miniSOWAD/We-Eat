import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  Cloud,
  FileWarning,
  History,
  MailCheck,
  MailWarning,
  ShieldCheck,
  Soup,
  UserCog,
  UsersRound,
} from "lucide-react";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type {
  AdminStats,
  Exchange,
  Favorite,
  IntegrationStatus,
  Listing,
  Order,
} from "@/types";
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
    let integrations: IntegrationStatus | null = null;
    try {
      stats = await backendFetch<AdminStats>("/admin/stats", {}, token);
    } catch {}

    const isAdmin = user.role === "ADMIN";
    if (isAdmin) {
      try {
        integrations = await backendFetch<IntegrationStatus>(
          "/admin/integrations/status",
          {},
          token,
        );
      } catch {}
    }

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
            Review accounts, reports, listings and recorded actions from one persistent dashboard.
          </p>
        </div>

        <div className={styles.metricGrid}>
          {cards.map(({ label, value, icon: Icon }) => (
            <div className={`card ${styles.metric}`} key={label}>
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

        {isAdmin && integrations && (
          <div className={styles.integrationGrid}>
            <div className={`card ${styles.integrationCard}`}>
              <span className={styles.integrationIcon}>
                {integrations.email.configured ? <MailCheck size={20} /> : <MailWarning size={20} />}
              </span>
              <div>
                <div className={styles.integrationTitleRow}>
                  <strong>Email OTP</strong>
                  <span
                    className="statusPill"
                    data-status={integrations.email.configured ? "ACTIVE" : "SUSPENDED"}
                  >
                    {integrations.email.configured ? "READY" : "SETUP NEEDED"}
                  </span>
                </div>
                <p>
                  {integrations.email.configured
                    ? `${integrations.email.mode.toUpperCase()} via ${integrations.email.smtp_host || "provider"}`
                    : integrations.email.missing_settings.join(", ") || "Email provider is incomplete"}
                </p>
              </div>
            </div>
            <div className={`card ${styles.integrationCard}`}>
              <span className={styles.integrationIcon}>
                <Cloud size={20} />
              </span>
              <div>
                <div className={styles.integrationTitleRow}>
                  <strong>Cloudinary</strong>
                  <span
                    className="statusPill"
                    data-status={integrations.cloudinary.configured ? "ACTIVE" : "SUSPENDED"}
                  >
                    {integrations.cloudinary.configured ? "READY" : "SETUP NEEDED"}
                  </span>
                </div>
                <p>
                  {integrations.cloudinary.configured
                    ? `${integrations.cloudinary.cloud_name} · ${integrations.cloudinary.configuration_source}`
                    : "Set CLOUDINARY_URL or the three Cloudinary credential variables"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`card ${styles.attention}`}>
          <div>
            <h2>
              {stats.open_reports
                ? `${stats.open_reports} reports need attention`
                : "The report queue is clear"}
            </h2>
            <p>Investigate consistently and record a clear resolution note for every action.</p>
          </div>
          <Link
            className="button buttonPrimary"
            href={isAdmin ? "/dashboard/admin/reports" : "/dashboard/moderator/reports"}
          >
            Review reports
          </Link>
        </div>

        <div className={styles.quickLinks}>
          <Link
            className={styles.quickLink}
            href={isAdmin ? "/dashboard/admin/users" : "/dashboard/moderator/users"}
          >
            <UsersRound size={20} />
            <strong>Manage users</strong>
            <span>Search accounts and control suspension status.</span>
          </Link>
          {isAdmin && (
            <Link className={styles.quickLink} href="/dashboard/admin/moderators">
              <UserCog size={20} />
              <strong>Manage moderators</strong>
              <span>Promote or revoke moderator access.</span>
            </Link>
          )}
          <Link
            className={styles.quickLink}
            href={isAdmin ? "/dashboard/admin/audit-logs" : "/dashboard/moderator/audit-logs"}
          >
            <History size={20} />
            <strong>Audit history</strong>
            <span>Review recorded moderation activity.</span>
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
      <div className={styles.metricGrid}>
        {cards.map(({ label, value, icon: Icon }) => (
          <div className={`card ${styles.metric}`} key={label}>
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
      <div className={`card ${styles.attention}`}>
        <div>
          <h2>Keep your listings accurate</h2>
          <p>Remove unavailable food promptly and confirm a deal only after handover.</p>
        </div>
        <Link className="button buttonPrimary" href="/share">
          Share food
        </Link>
      </div>
      <div className={styles.quickLinks}>
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
