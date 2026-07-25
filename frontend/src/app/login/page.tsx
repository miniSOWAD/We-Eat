import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import styles from "../auth.module.css";
export const metadata:Metadata={title:"Sign in"};
export default async function Page({searchParams}:{searchParams:Promise<{next?:string}>}){const {next}=await searchParams;const nextPath=next?.startsWith("/")?next:"/dashboard";return <main className={styles.page}><div className={`card ${styles.shell}`}><aside className={styles.visual}><span className="badge badgeFree">Welcome back</span><h2>Keep good food moving.</h2><p>Manage requests, exchanges and the food you have shared.</p></aside><section className={styles.form}><h1>Sign in</h1><p className="muted">Use your verified We Eat account.</p><LoginForm nextPath={nextPath}/></section></div></main>}
