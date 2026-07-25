import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/server-api";
import { HeaderActions } from "@/components/header-actions";
import styles from "./site-header.module.css";

export async function SiteHeader() {
  const user = await getSession();
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.logo} href="/" aria-label="We Eat home">
          <Image src="/logo.svg" alt="We Eat" width={180} height={48} priority />
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/listings">Find food</Link>
          <Link href="/share">Share food</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/safety">Safety</Link>
        </nav>
        <HeaderActions user={user} />
      </div>
    </header>
  );
}
