"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

type Mode = "hidden" | "default" | "link" | "text";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const LINK_SELECTOR = "a[href], button, summary, label[for], [role='button'], .spec-part";
const TEXT_SELECTOR = "input, textarea, select, [contenteditable='true']";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * A dot that tracks the pointer exactly and a ring that follows on a spring.
 * It grows over links and buttons, steps aside over text fields, and is never
 * rendered on touch devices, where there is no pointer to replace.
 */
export function CustomCursor() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
  const reduced = Boolean(useReducedMotion());
  const [mode, setMode] = useState<Mode>("hidden");
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 420, damping: 36, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 420, damping: 36, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const classify = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      if (element?.closest(TEXT_SELECTOR)) { setMode("text"); setLabel(""); return; }
      const link = element?.closest(LINK_SELECTOR) ?? null;
      setMode(link ? "link" : "default");
      // Over a link only the link's own label applies; elsewhere the nearest area label does.
      setLabel((link ? link.getAttribute("data-cursor") : element?.closest("[data-cursor]")?.getAttribute("data-cursor")) ?? "");
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      if (!reduced) return;
      ringX.jump(event.clientX);
      ringY.jump(event.clientY);
    };
    const onOver = (event: PointerEvent) => { if (event.pointerType === "mouse") classify(event.target); };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setMode("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, reduced, ringX, ringY, x, y]);

  if (!enabled) return null;

  const visible = mode !== "hidden" && mode !== "text";
  const ringScale = pressed ? 0.75 : mode === "link" ? (label ? 2.2 : 1.8) : 1;
  const transition = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 28 };

  return <div className="cursor-layer" aria-hidden="true">
    <motion.div className="cursor-ring" style={{ x: ringX, y: ringY }}
      animate={{ scale: ringScale, opacity: visible ? 1 : 0 }} transition={transition}>
      <span className={`cursor-ring-fill${mode === "link" ? " is-active" : ""}`} />
    </motion.div>
    <motion.div className="cursor-dot" style={{ x, y }}
      animate={{ scale: mode === "link" ? 0.4 : 1, opacity: visible ? 1 : 0 }} transition={transition} />
    {label && visible && <motion.div className="cursor-label" style={{ x: ringX, y: ringY }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{label}</motion.div>}
  </div>;
}
