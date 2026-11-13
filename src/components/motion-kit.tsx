"use client";

import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

export const ease = [0.16, 1, 0.3, 1] as const;
const viewport = { once: true, margin: "-10% 0px" } as const;

/** Fade and rise into place when scrolled into view. */
export function Reveal({ children, delay = 0, y = 36, className }: {
  children: ReactNode; delay?: number; y?: number; className?: string;
}) {
  const reduced = Boolean(useReducedMotion());
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={viewport}
    transition={{ duration: 0.9, delay, ease }}>{children}</motion.div>;
}

/** A heading whose lines slide up out of a mask, one after another. */
export function SplitReveal({ lines, as: Tag = "h2", className, id, delay = 0 }: {
  lines: ReactNode[]; as?: "h1" | "h2" | "h3"; className?: string; id?: string; delay?: number;
}) {
  const reduced = Boolean(useReducedMotion());
  if (reduced) {
    return <Tag className={className} id={id}>{lines.map((line, index) => <span className="split-line" key={index}><span className="split-inner">{line}</span></span>)}</Tag>;
  }
  // The mask (outer span) is what gets observed. Observing the text itself would never
  // fire, because it starts translated outside its own overflow:hidden parent.
  return <Tag className={className} id={id}>
    {lines.map((line, index) => <motion.span className="split-line" key={index}
      initial="hidden" whileInView="shown" viewport={viewport}>
      <motion.span className="split-inner"
        variants={{ hidden: { y: "115%" }, shown: { y: 0, transition: { duration: 1.1, delay: delay + index * 0.12, ease } } }}>{line}</motion.span>
    </motion.span>)}
  </Tag>;
}

/** A hairline that draws itself across when it enters the viewport. */
export function DrawLine({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const reduced = Boolean(useReducedMotion());
  return <motion.span aria-hidden="true" className={`draw-line ${className}`}
    initial={reduced ? false : { scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={viewport}
    transition={{ duration: 1.5, delay, ease }} />;
}

/** A card that reveals on scroll and lights up under the pointer. */
export function SpotlightCard({ children, className = "", delay = 0 }: {
  children: ReactNode; className?: string; delay?: number;
}) {
  const reduced = Boolean(useReducedMotion());
  function track(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  }
  return <motion.div className="spot-wrap"
    initial={reduced ? false : { opacity: 0, y: 48, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={viewport}
    transition={{ duration: 1, delay, ease }}>
    <div className={`spot-card ${className}`} onPointerMove={track}>{children}</div>
  </motion.div>;
}

/** Oversized outlined word that drifts sideways and vertically as the section scrolls past. */
export function GhostWord({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-22%"]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  return <div ref={ref} aria-hidden="true" className={`ghost-word ${className}`}>
    <motion.span style={reduced ? undefined : { x, y }}>{text}</motion.span>
  </div>;
}

/**
 * Moves its content vertically against the scroll. `y` is the travel in px:
 * positive moves faster than the page (floats up), negative lags behind it.
 */
export function Parallax({ children, y = 60, className = "", fill = false }: {
  children: ReactNode; y?: number; className?: string; fill?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shift = useTransform(scrollYProgress, [0, 1], [y, -y]);
  return <motion.div ref={ref} className={`${fill ? "parallax-fill " : ""}${className}`} style={reduced ? undefined : { y: shift }}>{children}</motion.div>;
}

/** A decorative glow that drifts at its own pace behind the content. */
export function ParallaxLayer({ className = "", y = 140 }: { className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shift = useTransform(scrollYProgress, [0, 1], [y, -y]);
  return <motion.div ref={ref} aria-hidden="true" className={className} style={reduced ? undefined : { y: shift }} />;
}

/** A horizontal bar that grows to `ratio` (0 to 1) of its track. */
export function GrowBar({ ratio, delay = 0 }: { ratio: number; delay?: number }) {
  const reduced = Boolean(useReducedMotion());
  if (reduced) return <span className="grow-bar" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(ratio, 0.03)})` }} /></span>;
  // Observe the track, not the bar: a zero-width bar inside an overflow:hidden track is unreliable to observe.
  return <motion.span className="grow-bar" aria-hidden="true" initial="hidden" whileInView="shown" viewport={viewport}>
    <motion.i variants={{ hidden: { scaleX: 0 }, shown: { scaleX: Math.max(ratio, 0.03), transition: { duration: 1.5, delay, ease } } }} />
  </motion.span>;
}

/** Counts up from zero the first time it is seen. Server output already shows the final value. */
export function CountUp({ value, prefix = "", suffix = "", format = "plain" }: {
  value: number; prefix?: string; suffix?: string; format?: "yen" | "plain";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = Boolean(useReducedMotion());
  const render = (n: number) => {
    const rounded = Math.round(n);
    return `${prefix}${format === "yen" ? rounded.toLocaleString("en-US") : rounded}${suffix}`;
  };

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node || reduced) return;
    const controls = animate(0, value, { duration: 2, ease, onUpdate: (n) => { node.textContent = render(n); } });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, prefix, suffix, format]);

  return <span ref={ref}>{render(value)}</span>;
}

/**
 * A light section that arrives like a card: it starts slightly inset with rounded
 * corners and settles into full width as it reaches the top of the screen.
 */
export function SectionCurtain({ children, className = "", id, labelledBy }: {
  children: ReactNode; className?: string; id?: string; labelledBy?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 20%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [56, 0]);
  return <motion.section ref={ref} id={id} className={className} aria-labelledby={labelledBy}
    style={reduced ? undefined : { scale, borderRadius: radius, transformOrigin: "50% 0%" }}>{children}</motion.section>;
}
