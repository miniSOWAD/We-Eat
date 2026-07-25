import type { Metadata } from "next";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <main className={styles.page}>
      <div className={`card ${styles.shell}`} data-hero-item>
        <aside className={styles.visual}>
          <span className="badge badgeExchange">Account recovery</span>
          <div><h2>Return securely.</h2><p>Use a short-lived verification code and replace the compromised or forgotten password.</p></div>
          <div className={styles.benefits}><div><KeyRound size={17} /> Short-lived reset code</div><div><LockKeyhole size={17} /> Existing sessions revoked</div><div><ShieldCheck size={17} /> Server-side verification</div></div>
        </aside>
        <section className={styles.form}>
          <h1>Reset password</h1>
          <p className="muted">We will send a short-lived code if the account exists.</p>
          <div className={styles.mobileTrust}><LockKeyhole size={19} /> A successful password reset invalidates existing sessions.</div>
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
