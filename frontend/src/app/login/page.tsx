import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/dashboard";

  return (
    <main className={styles.page}>
      <div className={`card ${styles.shell}`} data-hero-item>
        <aside className={styles.visual}>
          <span className="badge badgeFree">Welcome back</span>
          <div><h2>Keep good food moving.</h2><p>Manage requests, exchanges and every listing you have shared from one secure account.</p></div>
          <div className={styles.benefits}><div><UserCheck size={17} /> Verified account access</div><div><LockKeyhole size={17} /> HTTP-only session</div><div><ShieldCheck size={17} /> Database-backed permissions</div></div>
        </aside>
        <section className={styles.form}>
          <h1>Sign in</h1>
          <p className="muted">Use your verified We Eat account to continue.</p>
          <div className={styles.mobileTrust}><LockKeyhole size={19} /> Your authenticated session is stored in a secure HTTP-only cookie.</div>
          <LoginForm nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
