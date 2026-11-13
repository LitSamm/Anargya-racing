"use client";

import { useInView } from "framer-motion";
import { useRef, useState, type FormEvent } from "react";
import { Reveal } from "@/components/motion-kit";
import { SpecCarView } from "@/components/spec-car-view";
import { api } from "@/lib/api";

const topics = [
  { value: "QUESTION", label: "A question" },
  { value: "FEEDBACK", label: "Feedback" },
  { value: "PRESENTATION", label: "Vehicle presentation" },
  { value: "EVALUATION", label: "Team evaluation" },
  { value: "FLEET", label: "Fleet proposal" },
  { value: "TELEMETRY", label: "Telemetry add-on" },
  { value: "OTHER", label: "Something else" },
];

export function ContactSection() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const carRef = useRef<HTMLDivElement>(null);
  // Only build the 3D scene once the section is near the viewport.
  const nearby = useInView(carRef, { once: true, margin: "300px 0px" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending"); setError("");
    try {
      await api("/api/inquiries", { body: {
        name: String(data.get("name")), organization: String(data.get("organization")), email: String(data.get("email")),
        kind: String(data.get("kind")), message: String(data.get("message")), website: String(data.get("website") ?? ""),
      } });
      form.reset(); setState("sent");
    } catch (e) { setError((e as Error).message); setState("idle"); }
  }

  return <section className="contact-section" id="contact" aria-labelledby="contact-title">
    <div className="contact-car" ref={carRef} aria-hidden="true">{nearby && <SpecCarView highlight="overview" />}</div>
    <Reveal className="contact-card">
      <p className="page-eyebrow"><i className="eyebrow-dot" />Contact</p>
      <h2 id="contact-title">We’re here to listen.</h2>
      <p className="contact-lede">Send us a question or your feedback and the Anargya team will read it.</p>
      {state === "sent" ? <div className="contact-sent" role="status"><strong>Message received.</strong><p>Thank you. We will reply by email.</p>
        <button className="button-secondary" type="button" onClick={() => setState("idle")}>Send another</button></div>
      : <form className="contact-form" onSubmit={submit}>
        <label>Name<input name="name" autoComplete="name" required maxLength={120} /></label>
        <label>Academy or team<input name="organization" autoComplete="organization" required maxLength={160} /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Topic<select name="kind" defaultValue="QUESTION">{topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
        <label>Message<textarea name="message" required maxLength={4000} rows={4} /></label>
        <input className="contact-trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {error && <p className="app-error" role="alert">{error}</p>}
        <button className="button-primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
      </form>}
    </Reveal>
  </section>;
}
