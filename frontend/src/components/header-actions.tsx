"use client";

import Link from "next/link";
import { LogOut, Menu, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UserMe } from "@/types";
import styles from "./site-header.module.css";

export function HeaderActions({ user }: { user: UserMe | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <>
      <div className={styles.actions}>
        {user ? (
          <>
            <Link className={`${styles.user} ${styles.hideMobile}`} href="/dashboard">
              <span className={styles.avatar}><UserRound size={18} /></span>
              {user.display_name}
            </Link>
            <button className="button buttonGhost" onClick={logout} aria-label="Sign out"><LogOut size={17} /><span className={styles.hideMobile}>Sign out</span></button>
          </>
        ) : (
          <>
            <Link className={`button buttonGhost ${styles.hideMobile}`} href="/login">Sign in</Link>
            <Link className="button buttonPrimary" href="/register">Join We Eat</Link>
          </>
        )}
        <button className={`button buttonGhost ${styles.menuButton}`} onClick={() => setOpen(!open)} aria-label="Open menu"><Menu size={20}/></button>
      </div>
      {open && <div className={styles.mobile}>
        <Link href="/listings" onClick={() => setOpen(false)}>Find food</Link>
        <Link href="/share" onClick={() => setOpen(false)}>Share food</Link>
        <Link href="/how-it-works" onClick={() => setOpen(false)}>How it works</Link>
        <Link href="/safety" onClick={() => setOpen(false)}>Safety</Link>
        {user && <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>}
        {!user && <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>}
      </div>}
    </>
  );
}
