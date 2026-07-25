import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import styles from "../auth.module.css";
export const metadata:Metadata={title:"Reset password"};
export default function Page(){return <main className={styles.page}><div className={`card ${styles.shell}`}><aside className={styles.visual}><span className="badge badgeExchange">Account recovery</span><h2>Return securely.</h2><p>A successful reset revokes existing sessions.</p></aside><section className={styles.form}><h1>Reset password</h1><p className="muted">We will send a short-lived code if the account exists.</p><ForgotPasswordForm/></section></div></main>}
