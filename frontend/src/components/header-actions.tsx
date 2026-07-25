"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UserMe } from "@/types";
import styles from "./site-header.module.css";

export function HeaderActions({ user }: { user: UserMe | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className={styles.actions}>
      {user ? (
        <>
          <Link className={styles.user} href="/dashboard">
            <span className={styles.avatar}>
              <UserRound size={18} />
            </span>
            <span className={styles.userName}>{user.display_name}</span>
          </Link>
          <button
            className={`button buttonGhost ${styles.logout}`}
            onClick={logout}
            aria-label="Sign out"
          >
            <LogOut size={17} />
            <span className={styles.logoutText}>Sign out</span>
          </button>
        </>
      ) : (
        <>
          <Link className={`button buttonGhost ${styles.signIn}`} href="/login">
            Sign in
          </Link>
          <Link className={`button buttonPrimary ${styles.join}`} href="/register">
            Join We Eat
          </Link>
        </>
      )}
    </div>
  );
}
