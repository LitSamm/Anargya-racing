"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, signOut, useList, useMe, when, yen } from "@/lib/api";

type Vehicle = { id: string; serial: string; name: string; telemetryEnabled: boolean };
type Session = { id: string; driverName: string | null; startedAt: string; endedAt: string | null; _count: { readings: number } };
type Reading = { id: number; recordedAt: string; speedKmh: number | null; voltageV: number | null; currentA: number | null; batteryPct: number | null; motorTempC: number | null };
type Proposal = { id: string; number: string; quantity: number; unitPriceYen: number; status: string; createdAt: string };

const fmt = (value: number | null | undefined, digits = 1) => (value === null || value === undefined ? "–" : value.toFixed(digits));

function Trace({ values }: { values: number[] }) {
  if (values.length < 2) return <p className="app-note">Not enough readings to draw a trace yet.</p>;
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const points = values.map((v, i) => `${((i / (values.length - 1)) * 600).toFixed(1)},${(70 - ((v - min) / span) * 62 - 4).toFixed(1)}`).join(" ");
  return <svg className="app-trace" viewBox="0 0 600 70" preserveAspectRatio="none" role="img" aria-label={`Speed trace, ${min.toFixed(0)} to ${max.toFixed(0)} km/h`}><polyline points={points} fill="none" stroke="#3f7bf0" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>;
}

function SessionView({ sessionId }: { sessionId: string }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [ended, setEnded] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true; let timer: ReturnType<typeof setTimeout>; let last = "";
    const tick = async () => {
      try {
        const res = await api<{ session: { endedAt: string | null }; readings: Reading[] }>(`/api/telemetry/sessions/${sessionId}?limit=2000${last ? `&after=${encodeURIComponent(last)}` : ""}`);
        if (!alive) return;
        if (res.readings.length) { last = res.readings[res.readings.length - 1].recordedAt; setReadings((prev) => [...prev, ...res.readings].slice(-2000)); }
        setEnded(Boolean(res.session.endedAt)); setError("");
        if (!res.session.endedAt) timer = setTimeout(tick, 3000);
      } catch (e) { if (alive) setError((e as Error).message); }
    };
    tick();
    return () => { alive = false; clearTimeout(timer); };
  }, [sessionId]);
  const latest = readings[readings.length - 1];
  return <div className="app-card">
    <h3>Session {ended ? "(ended)" : <span className="app-live">● live</span>}</h3>
    {error && <p className="app-error" role="alert">{error}</p>}
    <div className="app-stats">
      <div><small>Speed</small><strong>{fmt(latest?.speedKmh)} <span>km/h</span></strong></div>
      <div><small>Battery</small><strong>{fmt(latest?.batteryPct, 0)} <span>%</span></strong></div>
      <div><small>Voltage</small><strong>{fmt(latest?.voltageV)} <span>V</span></strong></div>
      <div><small>Current</small><strong>{fmt(latest?.currentA)} <span>A</span></strong></div>
      <div><small>Motor temp</small><strong>{fmt(latest?.motorTempC)} <span>°C</span></strong></div>
    </div>
    <Trace values={readings.map((r) => r.speedKmh).filter((v): v is number => v !== null)} />
    <p className="app-note">{readings.length} readings loaded.</p>
  </div>;
}

function Vehicles() {
  const vehicles = useList<{ vehicles: Vehicle[] }>("/api/vehicles");
  const [vehicleId, setVehicleId] = useState("");
  const sessions = useList<{ sessions: Session[] }>(`/api/telemetry/sessions${vehicleId ? `?vehicleId=${vehicleId}` : ""}`);
  const [sessionId, setSessionId] = useState("");
  const list = vehicles.data?.vehicles ?? [];
  return <section className="app-section"><h2>Vehicles and telemetry</h2>
    {vehicles.error && <p className="app-error">{vehicles.error}</p>}
    {vehicles.data && list.length === 0 && <p className="app-note">No vehicle is linked to your organization yet.</p>}
    <div className="app-chips">{list.map((v) => <button key={v.id} type="button" className={`app-chip${v.id === vehicleId ? " is-on" : ""}`} onClick={() => { setVehicleId(v.id === vehicleId ? "" : v.id); setSessionId(""); }}>{v.name} <small>{v.serial}{v.telemetryEnabled ? "" : " · no telemetry"}</small></button>)}</div>
    <div className="app-split">
      <div className="app-card"><h3>Sessions</h3>
        {(sessions.data?.sessions ?? []).length === 0 && <p className="app-note">No sessions recorded yet.</p>}
        <ul className="app-list">{(sessions.data?.sessions ?? []).map((s) => <li key={s.id}><button type="button" className={s.id === sessionId ? "is-on" : ""} onClick={() => setSessionId(s.id)}>
          <strong>{when(s.startedAt)}</strong><small>{s.driverName ?? "Driver not named"} · {s._count.readings} readings{s.endedAt ? "" : " · live"}</small></button></li>)}</ul>
      </div>
      {sessionId ? <SessionView key={sessionId} sessionId={sessionId} /> : <div className="app-card"><p className="app-note">Pick a session to see its readings.</p></div>}
    </div>
  </section>;
}

function Proposals() {
  const proposals = useList<{ proposals: Proposal[] }>("/api/proposals");
  const [error, setError] = useState("");
  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const data = new FormData(form);
    try { await api("/api/proposals", { body: { quantity: Number(data.get("quantity")), notes: String(data.get("notes") || "") || undefined } }); form.reset(); proposals.reload(); setError(""); }
    catch (e) { setError((e as Error).message); }
  }
  const cancel = useCallback(async (id: string) => { try { await api(`/api/proposals/${id}`, { method: "PATCH", body: { status: "CANCELLED" } }); proposals.reload(); } catch (e) { setError((e as Error).message); } }, [proposals]);
  return <section className="app-section"><h2>Proposals</h2>
    <form className="app-card app-form app-inline" onSubmit={request}>
      <label>Vehicles<input name="quantity" type="number" min={1} max={500} defaultValue={1} required /></label>
      <label className="grow">Notes<input name="notes" maxLength={4000} placeholder="Delivery timing, telemetry add-on…" /></label>
      <button className="button-primary" type="submit">Request proposal</button>
    </form>
    {error && <p className="app-error" role="alert">{error}</p>}
    <div className="app-card"><table className="app-table"><thead><tr><th>Number</th><th>Qty</th><th>Price per vehicle</th><th>Status</th><th>Requested</th><th /></tr></thead>
      <tbody>{(proposals.data?.proposals ?? []).map((p) => <tr key={p.id}><td>{p.number}</td><td>{p.quantity}</td><td>{yen(p.unitPriceYen)}</td><td>{p.status}</td><td>{when(p.createdAt)}</td>
        <td>{(p.status === "DRAFT" || p.status === "SENT") && <button className="button-secondary" type="button" onClick={() => cancel(p.id)}>Cancel</button>}</td></tr>)}</tbody></table>
      {proposals.data && proposals.data.proposals.length === 0 && <p className="app-note">No proposals yet.</p>}</div>
  </section>;
}

export function CustomerDashboard() {
  const me = useMe("CUSTOMER");
  if (!me) return <p className="app-note app-center">Loading…</p>;
  return <>
    <header className="app-head"><div><p className="page-eyebrow">Dashboard</p><h1>{me.name}</h1></div><button className="button-secondary" type="button" onClick={signOut}>Sign out</button></header>
    <Vehicles /><Proposals />
  </>;
}
