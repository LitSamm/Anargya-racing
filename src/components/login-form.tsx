"use client";

import { useState, type FormEvent } from "react";
import { api, type Me } from "@/lib/api";

export function LoginForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const { user } = await api<{ user: Me }>("/api/auth/login", { body: { email: String(data.get("email")), password: String(data.get("password")) } });
      window.location.assign(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return <form className="app-card app-form app-login" onSubmit={submit}>
    <p className="page-eyebrow">Customers and team</p>
    <h1>Sign in</h1>
    <label>Email<input name="email" type="email" autoComplete="email" required /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
    {error && <p className="app-error" role="alert">{error}</p>}
    <button className="button-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    <p className="app-note">Accounts are created by Anargya for vehicle customers.</p>
  </form>;
}
