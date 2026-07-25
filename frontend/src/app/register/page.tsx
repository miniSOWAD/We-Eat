import type { Metadata } from "next";
import { LockKeyhole, MailCheck, ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/components/register-form";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Join We Eat" };

export default function Page() {
  return (
    <main className={styles.page}>
      <div className={`card ${styles.shell}`} data-hero-item>
        <aside className={styles.visual}>
          <span className="badge badgeDiscounted">Create an account</span>
          <div><h2>Share locally. Waste less.</h2><p>Your public profile shows only community-safe information. Exact pickup addresses remain private.</p></div>
          <div className={styles.benefits}><div><MailCheck size={17} /> Email OTP verification</div><div><LockKeyhole size={17} /> Private collection details</div><div><ShieldCheck size={17} /> Role-based protection</div></div>
        </aside>
        <section className={styles.form}>
          <h1>Join We Eat</h1>
          <p className="muted">Verify your email, create your profile and start sharing responsibly.</p>
          <div className={styles.mobileTrust}><MailCheck size={19} /> We verify your email before creating the account.</div>
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
