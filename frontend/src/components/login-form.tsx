"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter(); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);try{const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:form.get("identifier"),password:form.get("password")})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.detail??"Sign in failed");router.push(nextPath);router.refresh()}catch(caught){setError(caught instanceof Error?caught.message:"Sign in failed");setBusy(false)}}
  return <form className="stack" onSubmit={submit}>{error&&<div className="error">{error}</div>}<div className="field"><label htmlFor="identifier">Username or email</label><input className="input" id="identifier" name="identifier" type="text" autoComplete="username" placeholder="username or you@example.com" required/></div><div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required/></div><button className="button buttonPrimary" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><Link href="/forgot-password">Forgot password?</Link><Link href="/register">Create account</Link></div></form>;
}
