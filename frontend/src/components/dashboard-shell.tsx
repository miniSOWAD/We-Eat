import type { ReactNode } from "react";
import type { UserMe } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { ReputationPoints } from "@/components/reputation-points";
import { DashboardNav } from "@/components/dashboard-nav";
import styles from "./dashboard-shell.module.css";

export function DashboardShell({ user, children }: { user: UserMe; children: ReactNode }) {
  return <div className={`container ${styles.shell}`}><aside className={`card ${styles.sidebar}`} data-hero-item><div className={styles.user}><div style={{display:"flex",alignItems:"center",gap:7}}><ReputationPoints user={user} compact/><UserAvatar user={user}/></div><div><strong>{user.display_name}</strong><span>@{user.username} · {user.role}</span></div></div><DashboardNav role={user.role}/><div className={styles.sidebarNote}>{user.role==="USER"?"Share responsibly and keep your listings accurate and up to date.":"Keep community decisions fair, consistent and respectful."}</div></aside><section className={styles.content} data-hero-item>{children}</section></div>;
}
