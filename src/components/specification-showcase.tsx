"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { SpecCarView } from "@/components/spec-car-view";

/* `id` must match a key in partViews (car-scene.tsx); that is what the camera flies to. */
const partGroups = [
  { id: "overview", title: "Full vehicle", ja: "車両全体", parts: "Overview of the whole car", note: "Start here, then pick a system. The camera flies to it and the parts light up." },
  { id: "chassis", title: "Chassis", ja: "シャシー", parts: "Monocoque · rear chassis · undertray · roll hoops", note: "The structure everything else mounts to, and the first thing a driver feels." },
  { id: "suspension", title: "Suspension", ja: "サスペンション", parts: "Wishbones · dampers · springs · anti-roll bars", note: "Double-wishbone corners with adjustable parts: the setup students tune to learn vehicle dynamics." },
  { id: "controls", title: "Driver controls", ja: "コックピット", parts: "Steering wheel · column · dashboard · display", note: "Wheel, column, dashboard and display: the driver's interface with the car." },
  { id: "wheels", title: "Wheels & brakes", ja: "ホイール・ブレーキ", parts: "Tyres · rims · brake discs · hubs", note: "Shown on the front-right corner; all four corners are highlighted." },
  { id: "frontAero", title: "Front wing & nose", ja: "フロントウイング", parts: "Nosecone · front wing elements · endplates", note: "The first surfaces to meet the air, and the first to teach aero balance." },
  { id: "rearAero", title: "Rear wing & sidepods", ja: "リアウイング・サイドポッド", parts: "Rear wing flaps · endplates · sidepods", note: "Rear wing in focus, sidepods highlighted along the flank." },
  { id: "ev", title: "EV systems", ja: "EVシステム", parts: "Powertrain · inverter · vehicle software", note: "Part of the development scope; not modelled as separate parts here. Figures follow validation." },
] as const;

export function SpecificationShowcase() {
  const [index, setIndex] = useState(0);
  const reducedMotion = Boolean(useReducedMotion());
  const selected = partGroups[index];
  const step = (delta: number) => setIndex((current) => (current + delta + partGroups.length) % partGroups.length);

  return <section className="spec-explorer" aria-label="Interactive vehicle component guide">
    <nav className="spec-parts" aria-label="Vehicle systems">
      {partGroups.map((group, i) => <button key={group.id} type="button" className={`spec-part${i === index ? " is-selected" : ""}`} aria-pressed={i === index} onClick={() => setIndex(i)}>
        <span className="spec-part-index">{String(i).padStart(2, "0")}</span>
        <span className="spec-part-name"><strong>{group.title}</strong><small lang="ja">{group.ja}</small></span>
        <span className="spec-part-arrow" aria-hidden="true">→</span>
      </button>)}
    </nav>

    <figure className="spec-stage">
      <SpecCarView highlight={selected.id} />
      <div className="spec-hud" aria-hidden="true"><i /><i /><i /><i /></div>
      <AnimatePresence mode="wait">
        <motion.figcaption key={selected.id} className="spec-card" aria-live="polite"
          initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          <span className="spec-card-count">{String(index).padStart(2, "0")} / {String(partGroups.length - 1).padStart(2, "0")}</span>
          <strong className="spec-card-title">{selected.title}</strong>
          <span className="spec-card-ja" lang="ja">{selected.ja}</span>
          <span className="spec-card-parts">{selected.parts}</span>
          <span className="spec-card-note">{selected.note}</span>
        </motion.figcaption>
      </AnimatePresence>
      <div className="spec-controls">
        <button type="button" onClick={() => step(-1)} aria-label="Previous system">←</button>
        <button type="button" onClick={() => step(1)} aria-label="Next system">→</button>
        {index !== 0 && <button type="button" className="spec-reset" onClick={() => setIndex(0)}>Full vehicle</button>}
      </div>
    </figure>
  </section>;
}
