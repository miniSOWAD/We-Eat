import Link from "next/link";
import { getSession } from "@/lib/server-api";
import { HeaderActions } from "@/components/header-actions";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ActiveHandoffDock } from "@/components/active-handoff-dock";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./site-header.module.css";

export async function SiteHeader() {
  const user = await getSession();

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <div className={styles.brandCluster}>
            <Link className={styles.logo} href="/" aria-label="We Eat home">
              <img
                className={styles.brandImage}
                src="/logo.svg?v=131"
                alt="We Eat"
                width={180}
                height={48}
              />
            </Link>
            <ThemeToggle />
          </div>

          <nav className={styles.nav} aria-label="Main navigation">
            <Link href="/listings">Find food</Link>
            <Link href="/share">Share food</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/safety">Safety</Link>
          </nav>

          <HeaderActions user={user} />
        </div>
      </header>

      <MobileBottomNav user={user} />
      <ActiveHandoffDock user={user} />
    </>
  );
}
