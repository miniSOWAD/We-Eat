import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";
import styles from "../auth.module.css";
export const metadata:Metadata={title:"Join We Eat"};
export default function Page(){return <main className={styles.page}><div className={`card ${styles.shell}`}><aside className={styles.visual}><span className="badge badgeDiscounted">Create an account</span><h2>Share locally. Waste less.</h2><p>Your public profile shows only community-safe information. Exact pickup addresses remain private.</p></aside><section className={styles.form}><h1>Join We Eat</h1><p className="muted">Verify your email before creating an account.</p><RegisterForm/></section></div></main>}
