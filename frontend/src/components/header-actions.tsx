"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { UserMe } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { ReputationPoints } from "@/components/reputation-points";
import styles from "./site-header.module.css";

export function HeaderActions({ user }: { user: UserMe | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepOpen = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
  const delayedClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 200); };
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }

  if (!user) return <div className={styles.actions}><Link className={`button buttonGhost ${styles.signIn}`} href="/login">Sign in</Link><Link className={`button buttonPrimary ${styles.join}`} href="/register">Join We Eat</Link></div>;

  return (
    <div className={styles.actions}>
      <div className={styles.profileMenu} onMouseEnter={keepOpen} onMouseLeave={delayedClose}>
        <div className={styles.profileIdentity}>
          <ReputationPoints user={user} />
          <button type="button" className={styles.profileTrigger} onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} aria-label="Open account menu">
            <UserAvatar user={user} />
          </button>
        </div>
        {open && <div className={styles.dropdown} role="menu" onMouseEnter={keepOpen} onMouseLeave={delayedClose}>
          <div className={styles.dropdownIdentity}><strong>{user.display_name}</strong><span>@{user.username} · {user.role}</span></div>
          <Link href="/dashboard" role="menuitem" onClick={() => setOpen(false)}><LayoutDashboard size={17}/>Dashboard</Link>
          <Link href="/dashboard/settings" role="menuitem" onClick={() => setOpen(false)}><Settings size={17}/>Settings</Link>
          <button type="button" role="menuitem" onClick={logout}><LogOut size={17}/>Logout</button>
        </div>}
      </div>
    </div>
  );
}
