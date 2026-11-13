"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState, type FormEvent } from "react";
import { CarScene } from "@/components/car-scene";
import { CountUp, DrawLine, GhostWord, Parallax, ParallaxLayer, Reveal, SectionCurtain, SpotlightCard, SplitReveal, ease } from "@/components/motion-kit";
import { LiveTelemetrySection } from "@/components/live-telemetry-section";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";

/*
 * Copy rules: every claim below comes from the project plan. Performance
 * figures (power, mass, top speed) are not validated yet, so they are never
 * stated. The selling points are the things the plan can already support:
 * one integrated EV stack, a training-first purpose, local parts/service,
 * a stated target price, and condition monitoring.
 */
const chapters = [
  {
    id: "drive",
    number: "01",
    title: "One EV stack, built together.",
    ja: "パワートレインからソフトまで、ひとつのチームで開発。",
    description:
      "Powertrain, inverter and vehicle software are developed as one system, so the car is tuned as a whole instead of assembled from unrelated parts.",
    meta: ["Powertrain", "Inverter", "Vehicle software"],
  },
  {
    id: "dynamics",
    number: "02",
    title: "Made to teach drivers.",
    ja: "ドライバーを育てるための一台。",
    description:
      "Built around Formula Student vehicle dynamics for driver training and handling study. Performance figures will be published after validation, not before.",
    meta: ["Vehicle dynamics", "Handling", "Driver training"],
  },
  {
    id: "service",
    number: "03",
    title: "Parts and service, close by.",
    ja: "部品もサポートも、日本で身近に。",
    description:
      "Anargya's motorsport parts experience shapes a support plan for regular testing and academy use, so the car spends its time on track, not waiting.",
    meta: ["Spare parts", "Service planning", "Testing support"],
  },
  {
    id: "economics",
    number: "04",
    title: "Target: ¥6,000,000 per car.",
    ja: "目標価格は1台あたり600万円。",
    description:
      "A purpose-built training EV at a price an academy can plan for. This is a project target, not a quotation; final pricing needs a written proposal.",
    meta: ["Planning target", "Per vehicle", "Proposal required"],
  },
  {
    id: "telemetry",
    number: "05",
    title: "Know your car, always.",
    ja: "走行後も、車両の状態が見える。",
    description:
      "An optional live telemetry app, available as an add-on with the vehicle, shows wheel speed, battery, temperatures and GPS position, so instructors and engineers start every day informed.",
    meta: ["Live telemetry app", "Optional add-on", "Customers only"],
  },
];

const stats = [
  { value: 6000000, prefix: "¥", label: "Target price per car", ja: "目標価格(1台あたり)", format: "yen" },
  { value: 3, prefix: "", label: "EV systems developed together", ja: "一体で開発するEVシステム", format: "plain" },
  { value: 30, suffix: "%", prefix: "", label: "Deposit in the proposed pilot", ja: "パイロット案の手付金", format: "plain" },
  { value: 60, prefix: "", label: "Cars a year targeted by 2031", ja: "2031年の年間販売目標", format: "plain" },
] as const;

const advantages = [
  {
    en: "Made to teach, not just to race",
    ja: "走らせるだけでなく、教えるために",
    copy: "Built around driver instruction and vehicle-dynamics study, so every lesson can start from the car itself.",
  },
  {
    en: "A price you can budget for",
    ja: "予算を立てられる価格",
    copy: "A ¥6,000,000 target per car and a 30% deposit pilot model give your team real numbers to plan with.",
  },
  {
    en: "Parts and service nearby",
    ja: "部品もサービスも身近に",
    copy: "Spare parts and service planning built on Anargya's motorsport parts experience, starting with Japan.",
  },
  {
    en: "Data after every session",
    ja: "走行のたびに、データが残る",
    copy: "An optional live telemetry app shows the car's condition on your phone, so the next run starts informed.",
  },
];

const tickerItems = [
  "Formula Student EV",
  "フォーミュラ・スチューデント EV",
  "Driver training",
  "ドライバー育成",
  "Target ¥6,000,000",
  "目標価格 600万円",
  "Parts & service",
  "部品・サービス",
  "Live telemetry",
  "ライブテレメトリー",
];

function FeaturePanel({ chapter, step, progress, active, reducedMotion }: {
  chapter: (typeof chapters)[number]; step: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  active: boolean; reducedMotion: boolean;
}) {
  const start = step / 6;
  const end = (step + 1) / 6;
  const enterX = step % 2 === 0 ? -48 : 48;
  const exitX = step % 2 === 0 ? -24 : 24;
  const opacity = useTransform(progress, [Math.max(0, start - .02), start + .015, end - .025, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [Math.max(0, start - .02), start + .04, end - .04, end], [18, 0, 0, -12]);
  const x = useTransform(progress, [Math.max(0, start - .02), start + .05, end - .04, end], [enterX, 0, 0, exitX]);
  return <motion.article className="feature-panel" data-side={step % 2 === 0 ? "left" : "right"} inert={!active} aria-labelledby={`feature-${chapter.id}`} aria-hidden={!active}
    style={reducedMotion ? { opacity: active ? 1 : 0, x: 0 } : { opacity, y, x }}>
    <div className="feature-copy"><p className="feature-index">Anargya EV / {chapter.number}</p>
      <h2 className="feature-title" id={`feature-${chapter.id}`}>{chapter.title}</h2>
      <p className="feature-ja" lang="ja">{chapter.ja}</p>
      <p className="feature-description">{chapter.description}</p>
      <p className="feature-meta">{chapter.meta.map((item) => <span key={item}>{item}</span>)}</p>
    </div>
  </motion.article>;
}

function ContactPanel({ progress, active, reducedMotion }: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"]; active: boolean; reducedMotion: boolean;
}) {
  const opacity = useTransform(progress, [.80, .84, 1], [0, 1, 1]);
  const y = useTransform(progress, [.80, .85, 1], [18, 0, 0]);
  const x = useTransform(progress, [.80, .85, 1], [48, 0, 0]);
  const [request, setRequest] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setRequest(["Subject: Anargya vehicle inquiry", `Name: ${String(data.get("name")).trim()}`, `Academy or team: ${String(data.get("organization")).trim()}`, `Email: ${String(data.get("email")).trim()}`, `Inquiry: ${String(data.get("interest")).trim()}`].join("\n"));
    setCopyStatus("");
  }
  async function copyRequest() {
    if (!navigator.clipboard) { setCopyStatus("Clipboard unavailable. Select and copy the message above."); return; }
    try { await navigator.clipboard.writeText(request); setCopyStatus("Message copied."); }
    catch { setCopyStatus("Could not copy. Select and copy the message above."); }
  }
  return <motion.article className="feature-panel contact-panel" inert={!active} aria-labelledby="contact-heading" aria-hidden={!active}
    style={reducedMotion ? { opacity: active ? 1 : 0, x: 0 } : { opacity, y, x }}>
    <div className="contact-panel-content"><div className="contact-panel-copy">
      <p className="feature-index">For racing academies and independent teams</p><h2 className="feature-title" id="contact-heading">Bring it to your academy.</h2>
      <p className="feature-ja" lang="ja">アカデミーへの導入をご相談ください。</p>
      <p className="feature-description">Prepare an inquiry about a vehicle presentation, team evaluation or fleet proposal. This form creates a message on your device; it does not send your information.</p>
    </div><form className="journey-form" onSubmit={prepareRequest}>
      <label htmlFor="contact-name">Name / お名前<input id="contact-name" name="name" autoComplete="name" placeholder="Your name" required /></label>
      <label htmlFor="contact-organization">Academy or team / アカデミー・チーム名<input id="contact-organization" name="organization" autoComplete="organization" placeholder="Organization name" required /></label>
      <label htmlFor="contact-email">Work email / メールアドレス<input id="contact-email" name="email" type="email" autoComplete="email" placeholder="name@academy.jp" required /></label>
      <label htmlFor="contact-interest">How can we help? / ご相談内容<textarea id="contact-interest" name="interest" placeholder="Vehicle details, team evaluation or fleet proposal" required /></label>
      <button className="button-primary" type="submit">Create message</button>
      {request && <div className="journey-draft" aria-live="polite"><p>Your message is ready to copy.</p><textarea aria-label="Anargya vehicle inquiry message" readOnly value={request} /><button className="button-secondary" type="button" onClick={copyRequest}>Copy message</button><span role="status">{copyStatus}</span></div>}
    </form></div>
  </motion.article>;
}

function VehicleSequence() {
  const sequenceRef = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [activeChapter, setActiveChapter] = useState(0);
  const { scrollYProgress } = useScroll({ target: sequenceRef, offset: ["start start", "end end"] });
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(5, Math.floor(value * 6));
    setActiveChapter((current) => current === next ? current : next);
  });
  return <section className="vehicle-sequence" id="vehicle" ref={sequenceRef} aria-label="Anargya electric training vehicle overview">
    <div className="sequence-sticky" data-cursor="Scroll"><div className="scene-backdrop" aria-hidden="true" />
      <CarScene progress={scrollYProgress} rotating={!reducedMotion} reducedMotion={reducedMotion} />
      <div className="sequence-vignette" aria-hidden="true" />
      {chapters.map((chapter, index) => <FeaturePanel key={chapter.id} chapter={chapter} step={index} progress={scrollYProgress} active={activeChapter === index} reducedMotion={reducedMotion} />)}
      <ContactPanel progress={scrollYProgress} active={activeChapter === 5} reducedMotion={reducedMotion} />
      <p className="sequence-progress" aria-live="polite">Vehicle overview / Chapter {String(activeChapter + 1).padStart(2, "0")} of 06</p>
      <div className="sequence-bar" aria-hidden="true"><motion.span style={{ scaleX: reducedMotion ? 1 : barScale }} /></div>
    </div>
    <span className="sequence-anchor sequence-anchor--anatomy" id="anatomy" aria-hidden="true" />
    <span className="sequence-anchor sequence-anchor--economics" id="economics" aria-hidden="true" />
    <span className="sequence-anchor sequence-anchor--telemetry" id="telemetry" aria-hidden="true" />
    <span className="sequence-anchor sequence-anchor--contact" id="contact" aria-hidden="true" />
  </section>;
}

function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return <div className="ticker" aria-hidden="true"><div className="ticker-track">
    {items.map((item, index) => <span key={index} lang={/[ぁ-ヿ一-鿿]/.test(item) ? "ja" : "en"}>{item}<i /></span>)}
  </div></div>;
}

function WhySection() {
  return <SectionCurtain className="why-section premium-dark" id="why" labelledBy="why-title">
    <GhostWord text="ANARGYA" />
    <div className="why-head">
      <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Why Anargya / Anargya の強み</p></Reveal>
      <SplitReveal as="h2" id="why-title" className="why-title" lines={["One car.", "One price.", <em key="team">One team behind it.</em>]} />
      <Parallax y={-24}><Reveal delay={0.35} className="why-copy">
        <p className="why-ja" lang="ja">1台のクルマ、明確な価格、そして支えるチーム。</p>
        <p className="why-lede">A training car usually means separate answers for the car, the parts and the support. Anargya is building all three as one package for racing academies in Japan.</p>
      </Reveal></Parallax>
    </div>
    <DrawLine />
    <div className="stat-row">{stats.map((stat, index) => <Reveal key={stat.label} delay={index * 0.1} className="stat">
      <strong><CountUp value={stat.value} prefix={stat.prefix} suffix={"suffix" in stat ? stat.suffix : ""} format={stat.format} /></strong>
      <span>{stat.label}</span><small lang="ja">{stat.ja}</small>
    </Reveal>)}</div>
    <DrawLine delay={0.2} />
    <div className="advantage-grid">{advantages.map((item, index) => <Parallax key={item.en} fill y={index % 2 ? -26 : 26}>
      <SpotlightCard delay={index * 0.1} className="advantage">
        <span className="advantage-index">{String(index + 1).padStart(2, "0")}</span>
        <h3>{item.en}</h3><p className="advantage-ja" lang="ja">{item.ja}</p><p>{item.copy}</p>
        <span className="advantage-arrow" aria-hidden="true">↗</span>
      </SpotlightCard>
    </Parallax>)}</div>
    <p className="why-note">Prices, volumes and dates are targets from the project plan, not quotations or production commitments. Performance figures will be published after validation.</p>
  </SectionCurtain>;
}

export function LandingPage() {
  const reducedMotion = Boolean(useReducedMotion());
  const rise = (delay: number) => reducedMotion ? {} : {
    initial: { opacity: 0, y: 44 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease },
  };
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(heroProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(heroProgress, [0, 0.8], [1, 0.15]);
  const streakY = useTransform(heroProgress, [0, 1], [0, 220]);
  const noteY = useTransform(heroProgress, [0, 1], [0, -60]);
  return <><a className="skip-link" href="#main-content">Skip to main content</a><SiteNavigation />
    <main id="main-content">
      <section className="hero-banner" id="hero" ref={heroRef} aria-label="Anargya introductory banner">
        <ParallaxLayer className="orb orb--blue orb-a" y={180} />
        <ParallaxLayer className="orb orb--pink orb-b" y={-120} />
        <motion.div className="hero-streaks" aria-hidden="true" style={reducedMotion ? undefined : { y: streakY }}><span /><span /><span /><span /><span /></motion.div>
        <motion.div className="hero-banner-copy" style={reducedMotion ? undefined : { y: copyY, opacity: copyOpacity }}>
          <motion.p className="hero-kicker" {...rise(0.05)}>Anargya Racing / <span lang="ja">日本のレーシングアカデミーへ</span></motion.p>
          <h1><motion.span {...rise(0.15)}>The EV</motion.span><motion.span {...rise(0.27)}>that trains</motion.span><motion.span {...rise(0.39)}><em>racing drivers.</em></motion.span></h1>
          <motion.p className="hero-ja" lang="ja" {...rise(0.5)}>レーシングドライバーを育てる、フォーミュラ・スチューデントEV。</motion.p>
          <motion.p className="hero-lede" {...rise(0.58)}>One integrated electric stack, a ¥6,000,000 target price, and parts and service planned for Japan.</motion.p>
          <motion.div className="hero-actions" {...rise(0.68)}>
            <a className="button-primary" href="/#contact">Contact sales <span aria-hidden="true">→</span></a>
            <a className="button-secondary" href="#why">Why Anargya <span aria-hidden="true">↓</span></a>
          </motion.div>
        </motion.div>
        <motion.span className="hero-banner-note" style={reducedMotion ? undefined : { y: noteY }}>Driver training / Vehicle research</motion.span>
        <span className="hero-scroll" aria-hidden="true"><i /></span>
      </section>
      <Ticker />
      <WhySection />
      <VehicleSequence />
      <LiveTelemetrySection />
    </main>
    <SiteFooter />
  </>;
}
