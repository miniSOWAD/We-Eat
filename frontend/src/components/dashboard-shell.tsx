import type { ReactNode } from "react";
import type { UserMe } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { DashboardNav } from "@/components/dashboard-nav";
import styles from "./dashboard-shell.module.css";

export function DashboardShell({ user, children }: { user: UserMe; children: ReactNode }) {
  return <div className={`container ${styles.shell}`}><aside className={`card ${styles.sidebar}`} data-hero-item><div className={styles.user}><UserAvatar user={user}/><div><strong>{user.display_name}</strong><span>@{user.username} · {user.role}</span></div></div><DashboardNav role={user.role}/><div className={styles.sidebarNote}>{user.role==="USER"?"Your private pickup details never appear in public listing responses.":"Administrative actions are recorded in the audit log and revoke affected sessions."}</div></aside><section className={styles.content} data-hero-item>{children}</section></div>;
}
