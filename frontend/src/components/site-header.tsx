import Link from "next/link";
import { Utensils } from "lucide-react";
import { getSession } from "@/lib/server-api";
import { HeaderActions } from "@/components/header-actions";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./site-header.module.css";

export async function SiteHeader() {
  const user = await getSession();
  return <><header className={styles.header}><div className={`container ${styles.inner}`}><div className={styles.brandCluster}><Link className={styles.logo} href="/" aria-label="We Eat home"><span className={styles.logoMark}><Utensils size={20}/></span><strong>We Eat</strong></Link><ThemeToggle /></div><nav className={styles.nav} aria-label="Main navigation"><Link href="/listings">Find food</Link><Link href="/share">Share food</Link><Link href="/how-it-works">How it works</Link><Link href="/safety">Safety</Link></nav><HeaderActions user={user}/></div></header><MobileBottomNav user={user}/></>;
}
