"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({nextPath="/dashboard"}:{nextPath?:string}){
  const router=useRouter();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const form=new FormData(e.currentTarget);const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.get("email"),password:form.get("password")})});const data=await response.json();if(!response.ok){setError(data.detail??"Sign in failed");setBusy(false);return}router.push(nextPath);router.refresh()}
  return <form className="stack" onSubmit={submit}>
    {error&&<div className="error">{error}</div>}
    <div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="email" required/></div>
    <div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required/></div>
    <button className="button buttonPrimary" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><Link href="/forgot-password">Forgot password?</Link><Link href="/register">Create account</Link></div>
  </form>
}
