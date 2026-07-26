import type { ReactNode } from "react";
import type { UserMe } from "@/types";
import { UserTrustIdentity } from "@/components/user-trust-identity";
import { DashboardNav } from "@/components/dashboard-nav";
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
      <aside className={`card ${styles.sidebar}`} data-hero-item>
        <div className={styles.userCard}>
          <UserTrustIdentity
            user={user}
            subtitle={`@${user.username} · ${user.role}`}
            className={styles.userIdentity}
          />
        </div>
        <DashboardNav role={user.role} />
        <div className={styles.sidebarNote}>
          {user.role === "USER"
            ? "Share responsibly and keep your listings accurate and up to date."
            : "Keep community decisions fair, consistent and respectful."}
        </div>
      </aside>
      <section className={styles.content} data-hero-item>
        {children}
      </section>
    </div>
  );
}
