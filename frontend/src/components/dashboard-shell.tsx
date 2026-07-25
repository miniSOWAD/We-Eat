import Link from "next/link";
import type { ReactNode } from "react";
import type { UserMe } from "@/types";
import styles from "./dashboard-shell.module.css";

export function DashboardShell({
  user,
  children,
}: {
  user: UserMe;
  children: ReactNode;
}) {
  return (
    <div className={`container ${styles.shell}`}>
      <aside className={`card ${styles.sidebar}`}>
        <div className={styles.user}>
          <strong>{user.display_name}</strong>
          <div className="muted" style={{ fontSize: 13 }}>
            {user.role}
          </div>
        </div>
        <Link href="/dashboard">Overview</Link>
        <Link href="/dashboard/listings">My listings</Link>
        <Link href="/dashboard/orders">Food requests</Link>
        <Link href="/dashboard/exchanges">Exchanges</Link>
        <Link href="/dashboard/favorites">Saved food</Link>
        <Link href="/dashboard/profile">Profile</Link>
        {(user.role === "MODERATOR" || user.role === "ADMIN") && (
          <Link href="/moderator">Moderation</Link>
        )}
        {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
      </aside>
      <section className={styles.content}>{children}</section>
    </div>
  );
}
