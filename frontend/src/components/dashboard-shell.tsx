import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bookmark,
  ClipboardList,
  LayoutDashboard,
  Repeat2,
  ShieldCheck,
  Soup,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { UserMe } from "@/types";
import styles from "./dashboard-shell.module.css";

export function DashboardShell({ user, children }: { user: UserMe; children: ReactNode }) {
  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/listings", label: "My listings", icon: Soup },
    { href: "/dashboard/orders", label: "Food requests", icon: ClipboardList },
    { href: "/dashboard/exchanges", label: "Exchanges", icon: Repeat2 },
    { href: "/dashboard/favorites", label: "Saved food", icon: Bookmark },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <div className={`container ${styles.shell}`}>
      <aside className={`card ${styles.sidebar}`} data-hero-item>
        <div className={styles.user}>
          <span className={styles.userAvatar}>{user.display_name.slice(0, 1).toUpperCase()}</span>
          <div><strong>{user.display_name}</strong><span>{user.role}</span></div>
        </div>
        <nav className={styles.nav} aria-label="Dashboard navigation">
          {links.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={18} /><span>{label}</span></Link>)}
          {(user.role === "MODERATOR" || user.role === "ADMIN") && <Link href="/moderator"><ShieldCheck size={18} /><span>Moderation</span></Link>}
          {user.role === "ADMIN" && <Link href="/admin"><UsersRound size={18} /><span>Admin</span></Link>}
        </nav>
        <div className={styles.sidebarNote}>Exact pickup data remains outside public listing responses.</div>
      </aside>
      <section className={styles.content} data-hero-item>{children}</section>
    </div>
  );
}
