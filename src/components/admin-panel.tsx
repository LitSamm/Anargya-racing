"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { api, signOut, useList, useMe, when, yen } from "@/lib/api";

type Inquiry = { id: string; name: string; organization: string; email: string; kind: string; message: string; status: string; createdAt: string };
type Proposal = { id: string; number: string; quantity: number; unitPriceYen: number; status: string; notes: string | null; organization: { name: string } };
type Org = { id: string; name: string; kind: string; country: string; _count: { users: number; vehicles: number } };
type User = { id: string; email: string; name: string; role: string; organizationId: string | null };
type Vehicle = { id: string; serial: string; name: string; telemetryEnabled: boolean; organizationId: string | null };

function useAction() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const run = async (fn: () => Promise<string | void>) => { try { const note = await fn(); setMessage(note ?? "Saved."); setError(""); } catch (e) { setError((e as Error).message); setMessage(""); } };
  const notice: ReactNode = <>{error && <p className="app-error" role="alert">{error}</p>}{message && <p className="app-ok" role="status">{message}</p>}</>;
  return { run, notice };
}

function Inquiries() {
  const list = useList<{ inquiries: Inquiry[] }>("/api/inquiries");
  const { run, notice } = useAction();
  return <section className="app-section"><h2>Inquiries</h2>{notice}
    <div className="app-card"><table className="app-table"><thead><tr><th>Received</th><th>Who</th><th>Message</th><th>Status</th></tr></thead><tbody>
      {(list.data?.inquiries ?? []).map((i) => <tr key={i.id}><td>{when(i.createdAt)}</td><td><strong>{i.name}</strong><br />{i.organization}<br /><a href={`mailto:${i.email}`}>{i.email}</a></td><td><small>{i.kind}</small><br />{i.message}</td>
        <td><select value={i.status} onChange={(e) => run(async () => { await api(`/api/inquiries/${i.id}`, { method: "PATCH", body: { status: e.target.value } }); list.reload(); })}><option>NEW</option><option>CONTACTED</option><option>CLOSED</option></select></td></tr>)}</tbody></table>
      {list.data?.inquiries.length === 0 && <p className="app-note">No inquiries yet.</p>}</div></section>;
}

function Proposals() {
  const list = useList<{ proposals: Proposal[] }>("/api/proposals");
  const { run, notice } = useAction();
  return <section className="app-section"><h2>Proposals</h2>{notice}
    <div className="app-card"><table className="app-table"><thead><tr><th>Number</th><th>Organization</th><th>Qty</th><th>Price per vehicle</th><th>Status</th></tr></thead><tbody>
      {(list.data?.proposals ?? []).map((p) => <tr key={p.id}><td>{p.number}</td><td>{p.organization.name}</td><td>{p.quantity}</td><td>{yen(p.unitPriceYen)}</td>
        <td><select value={p.status} onChange={(e) => run(async () => { await api(`/api/proposals/${p.id}`, { method: "PATCH", body: { status: e.target.value } }); list.reload(); })}>{["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>
      {list.data?.proposals.length === 0 && <p className="app-note">No proposals yet.</p>}</div></section>;
}

function Accounts() {
  const orgs = useList<{ organizations: Org[] }>("/api/organizations");
  const users = useList<{ users: User[] }>("/api/users");
  const { run, notice } = useAction();
  const addOrg = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = e.currentTarget; const d = new FormData(f);
    run(async () => { await api("/api/organizations", { body: { name: String(d.get("name")), kind: String(d.get("kind")) } }); f.reset(); orgs.reload(); }); };
  const addUser = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = e.currentTarget; const d = new FormData(f);
    run(async () => { await api("/api/users", { body: { name: String(d.get("name")), email: String(d.get("email")), password: String(d.get("password")), role: String(d.get("role")), organizationId: String(d.get("organizationId")) || undefined } }); f.reset(); users.reload(); orgs.reload(); }); };
  const orgName = (id: string | null) => orgs.data?.organizations.find((o) => o.id === id)?.name ?? "–";
  return <section className="app-section"><h2>Organizations and accounts</h2>{notice}
    <div className="app-split">
      <form className="app-card app-form" onSubmit={addOrg}><h3>New organization</h3>
        <label>Name<input name="name" required /></label>
        <label>Kind<select name="kind"><option>ACADEMY</option><option>TEAM</option><option>OTHER</option></select></label>
        <button className="button-primary" type="submit">Add organization</button></form>
      <form className="app-card app-form" onSubmit={addUser}><h3>New account</h3>
        <label>Name<input name="name" required /></label>
        <label>Email<input name="email" type="email" required /></label>
        <label>Password (10+ characters)<input name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
        <label>Role<select name="role"><option>CUSTOMER</option><option>ADMIN</option></select></label>
        <label>Organization<select name="organizationId"><option value="">None</option>{(orgs.data?.organizations ?? []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
        <button className="button-primary" type="submit">Create account</button></form>
    </div>
    <div className="app-card"><table className="app-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organization</th></tr></thead><tbody>
      {(users.data?.users ?? []).map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{orgName(u.organizationId)}</td></tr>)}</tbody></table></div></section>;
}

function Vehicles() {
  const vehicles = useList<{ vehicles: Vehicle[] }>("/api/vehicles");
  const orgs = useList<{ organizations: Org[] }>("/api/organizations");
  const { run, notice } = useAction();
  const [key, setKey] = useState("");
  const add = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = e.currentTarget; const d = new FormData(f);
    run(async () => { const res = await api<{ apiKey: string }>("/api/vehicles", { body: { serial: String(d.get("serial")), name: String(d.get("name")), organizationId: String(d.get("organizationId")) || undefined, telemetryEnabled: d.get("telemetryEnabled") === "on" } });
      setKey(res.apiKey); f.reset(); vehicles.reload(); return "Vehicle created. Copy its telemetry key now; it is not shown again."; }); };
  const rotate = (id: string) => run(async () => { const res = await api<{ apiKey: string }>(`/api/vehicles/${id}/api-key`, { body: {} }); setKey(res.apiKey); return "New key issued. The old key no longer works."; });
  return <section className="app-section"><h2>Vehicles</h2>{notice}
    {key && <p className="app-key" role="status">Telemetry key (shown once): <code>{key}</code></p>}
    <form className="app-card app-form app-inline" onSubmit={add}>
      <label>Serial<input name="serial" required /></label><label>Name<input name="name" required /></label>
      <label>Organization<select name="organizationId"><option value="">None</option>{(orgs.data?.organizations ?? []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
      <label className="app-check"><input name="telemetryEnabled" type="checkbox" /> Telemetry add-on</label>
      <button className="button-primary" type="submit">Add vehicle</button></form>
    <div className="app-card"><table className="app-table"><thead><tr><th>Serial</th><th>Name</th><th>Organization</th><th>Telemetry</th><th /></tr></thead><tbody>
      {(vehicles.data?.vehicles ?? []).map((v) => <tr key={v.id}><td>{v.serial}</td><td>{v.name}</td><td>{orgs.data?.organizations.find((o) => o.id === v.organizationId)?.name ?? "–"}</td><td>{v.telemetryEnabled ? "On" : "Off"}</td>
        <td><button className="button-secondary" type="button" onClick={() => rotate(v.id)}>New key</button></td></tr>)}</tbody></table></div></section>;
}

function ContentEditor({ name, value, onSaved }: { name: string; value: unknown; onSaved: () => void }) {
  const { run, notice } = useAction();
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  return <div className="app-card app-form"><h3><code>{name}</code></h3>
    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={Math.min(14, text.split("\n").length + 1)} spellCheck={false} />
    {notice}
    <div className="app-row"><button className="button-primary" type="button" onClick={() => run(async () => { await api(`/api/content/${encodeURIComponent(name)}`, { method: "PUT", body: { value: JSON.parse(text) } }); onSaved(); })}>Save</button>
      <button className="button-secondary" type="button" onClick={() => run(async () => { await api(`/api/content/${encodeURIComponent(name)}`, { method: "DELETE" }); onSaved(); })}>Delete</button></div></div>;
}

function Content() {
  const list = useList<{ content: Record<string, unknown> }>("/api/content");
  const { run, notice } = useAction();
  const add = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = e.currentTarget; const d = new FormData(f);
    run(async () => { await api(`/api/content/${encodeURIComponent(String(d.get("key")))}`, { method: "PUT", body: { value: JSON.parse(String(d.get("value"))) } }); f.reset(); list.reload(); }); };
  return <section className="app-section"><h2>Site content</h2>
    <p className="app-note">Values are JSON. <code>vehicle.priceYen</code> sets the per-vehicle price used by new proposals. The public pages do not read these values yet.</p>{notice}
    {Object.entries(list.data?.content ?? {}).map(([name, value]) => <ContentEditor key={`${name}:${JSON.stringify(value)}`} name={name} value={value} onSaved={list.reload} />)}
    <form className="app-card app-form app-inline" onSubmit={add}><label>New key<input name="key" required pattern="[A-Za-z0-9._\-]{1,80}" /></label><label className="grow">JSON value<input name="value" required placeholder='"text", 123 or {"a":1}' /></label><button className="button-primary" type="submit">Add</button></form></section>;
}

const tabs = { Inquiries, Proposals, Accounts, Vehicles, Content } as const;

export function AdminPanel() {
  const me = useMe("ADMIN");
  const [tab, setTab] = useState<keyof typeof tabs>("Inquiries");
  if (!me) return <p className="app-note app-center">Loading…</p>;
  const View = tabs[tab];
  return <>
    <header className="app-head"><div><p className="page-eyebrow">Admin</p><h1>{me.name}</h1></div><button className="button-secondary" type="button" onClick={signOut}>Sign out</button></header>
    <nav className="app-tabs" aria-label="Admin sections">{(Object.keys(tabs) as (keyof typeof tabs)[]).map((t) => <button key={t} type="button" className={t === tab ? "is-on" : ""} onClick={() => setTab(t)}>{t}</button>)}</nav>
    <View />
  </>;
}
