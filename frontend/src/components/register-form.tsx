"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [deliveryMessage, setDeliveryMessage] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendOtp() {
    const result = await api<{ message: string }>("/auth/request-registration-otp", {
      method: "POST",
      body: { email },
    });
    setDeliveryMessage(result.message);
    setCooldown(60);
  }

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await sendOtp(); setStep(2); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to send code"); }
    finally { setBusy(false); }
  }

  async function resend() {
    if (cooldown > 0) return;
    setBusy(true); setError("");
    try { await sendOtp(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to resend code"); }
    finally { setBusy(false); }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      email,
      username: form.get("username"),
      otp: form.get("otp"),
      password: form.get("password"),
      display_name: form.get("display_name"),
      city: form.get("city") || null,
      area: form.get("area") || null,
    };
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail ?? "Registration failed");
      router.push("/dashboard"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Registration failed"); setBusy(false); }
  }

  if (step === 1) return <form className="stack" onSubmit={requestOtp}>{error && <div className="error">{error}</div>}<div className="field"><label htmlFor="registerEmail">Email</label><input id="registerEmail" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/><span className="help">A six-digit verification code will be sent to this address. Check your spam folder if it does not appear within a minute.</span></div><button className="button buttonPrimary" disabled={busy}>{busy ? "Sending…" : "Send verification code"}</button></form>;

  return <form className="stack" onSubmit={register}>{error && <div className="error">{error}</div>}<div className="success"><MailCheck size={17} style={{verticalAlign:"-4px",marginRight:7}}/>{deliveryMessage || `Code sent to ${email}`}</div><div className="field"><label htmlFor="otp">Verification code</label><input id="otp" className="input" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required/></div><div className="formGrid"><div className="field"><label htmlFor="display_name">Full name</label><input id="display_name" className="input" name="display_name" minLength={2} autoComplete="name" required/></div><div className="field"><label htmlFor="username">Username</label><input id="username" className="input" name="username" minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" autoComplete="username" placeholder="mahru_food" required/><span className="help">3–30 letters, numbers or underscores. Stored in lowercase.</span></div></div><div className="formGrid"><div className="field"><label htmlFor="city">City</label><input id="city" className="input" name="city"/></div><div className="field"><label htmlFor="area">Area</label><input id="area" className="input" name="area"/></div></div><div className="field"><label htmlFor="newPassword">Password</label><input id="newPassword" className="input" name="password" type="password" minLength={8} autoComplete="new-password" required/><span className="help">At least 8 characters with uppercase, lowercase and a number.</span></div><button className="button buttonPrimary" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button><div className="inlineActions"><button className="button buttonGhost" type="button" onClick={resend} disabled={busy || cooldown > 0}><RefreshCw size={16}/>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}</button><button className="button buttonGhost" type="button" onClick={() => setStep(1)}>Use another email</button></div></form>;
}
