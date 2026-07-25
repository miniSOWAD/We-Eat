"use client";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export function ForgotPasswordForm(){
 const [email,setEmail]=useState("");const [step,setStep]=useState(1);const [message,setMessage]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function request(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await api<{message:string}>("/auth/request-password-reset",{method:"POST",body:{email}});setMessage(r.message);setStep(2)}catch(e){setError(e instanceof Error?e.message:"Unable to continue")}finally{setBusy(false)}}
 async function reset(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);try{const r=await api<{message:string}>("/auth/reset-password",{method:"POST",body:{email,otp:f.get("otp"),new_password:f.get("password")}});setMessage(r.message);setStep(3)}catch(e){setError(e instanceof Error?e.message:"Unable to reset password")}finally{setBusy(false)}}
 if(step===3)return <div className="success">{message} <a href="/login"><strong>Sign in now.</strong></a></div>;
 return step===1?<form className="stack" onSubmit={request}>{error&&<div className="error">{error}</div>}<div className="field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><button className="button buttonPrimary" disabled={busy}>Send reset code</button></form>:<form className="stack" onSubmit={reset}>{message&&<div className="success">{message}</div>}{error&&<div className="error">{error}</div>}<div className="field"><label>Verification code</label><input className="input" name="otp" pattern="[0-9]{6}" maxLength={6} required/></div><div className="field"><label>New password</label><input className="input" name="password" type="password" minLength={8} required/></div><button className="button buttonPrimary" disabled={busy}>Reset password</button></form>
}
