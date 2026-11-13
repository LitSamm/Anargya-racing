"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import { CarScene } from "@/components/car-scene";
import { DrawLine, GhostWord, Parallax, Reveal, SectionCurtain, SpotlightCard, SplitReveal } from "@/components/motion-kit";
import { ContactSection } from "@/components/contact-section";
import { LiveTelemetrySection } from "@/components/live-telemetry-section";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";

/*
 * Copy rules: every claim below comes from the project plan. Performance
 * figures (power, mass, top speed) are not validated yet, so they are never
 * stated. The selling points are the things the plan can already support:
 * one integrated EV stack, a training-first purpose, local parts/service,
 * a stated price, and condition monitoring.
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
    title: "¥6,627,281 per car.",
    ja: "1台あたり662万7,281円。",
    description:
      "A purpose-built training EV at a price an academy can plan for. Specification and availability are confirmed in a written proposal.",
    meta: ["Price", "Per vehicle", "Proposal for details"],
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

const advantages = [
  {
    en: "Made to teach, not just to race",
    ja: "走らせるだけでなく、教えるために",
    copy: "Built around driver instruction and vehicle-dynamics study, so every lesson can start from the car itself.",
  },
  {
    en: "A price you can budget for",
    ja: "予算を立てられる価格",
    copy: "A ¥6,627,281 price per car and a 30% deposit pilot model give your team real numbers to plan with.",
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
  "Price ¥6,627,281",
  "価格 662万7,281円",
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
  const start = step / 5;
  const end = (step + 1) / 5;
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

function VehicleSequence() {
  const sequenceRef = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [activeChapter, setActiveChapter] = useState(0);
  const { scrollYProgress } = useScroll({ target: sequenceRef, offset: ["start start", "end end"] });
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(4, Math.floor(value * 5));
    setActiveChapter((current) => current === next ? current : next);
  });
  return <section className="vehicle-sequence" id="vehicle" ref={sequenceRef} aria-label="Anargya electric training vehicle overview">
    <div className="sequence-sticky" data-cursor="Scroll"><div className="scene-backdrop" aria-hidden="true" />
      <CarScene progress={scrollYProgress} rotating={!reducedMotion} reducedMotion={reducedMotion} />
      <div className="sequence-vignette" aria-hidden="true" />
      {chapters.map((chapter, index) => <FeaturePanel key={chapter.id} chapter={chapter} step={index} progress={scrollYProgress} active={activeChapter === index} reducedMotion={reducedMotion} />)}
      <p className="sequence-progress" aria-live="polite">Vehicle overview / Chapter {String(activeChapter + 1).padStart(2, "0")} of 05</p>
      <div className="sequence-bar" aria-hidden="true"><motion.span style={{ scaleX: reducedMotion ? 1 : barScale }} /></div>
    </div>
    <span className="sequence-anchor sequence-anchor--anatomy" id="anatomy" aria-hidden="true" />
    <span className="sequence-anchor sequence-anchor--economics" id="economics" aria-hidden="true" />
    <span className="sequence-anchor sequence-anchor--telemetry" id="telemetry" aria-hidden="true" />
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
      <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Why Anargya</p></Reveal>
      <SplitReveal as="h2" id="why-title" className="why-title" lines={["One car.", <em key="team">One team behind it.</em>]} />
      <Parallax y={-24}><Reveal delay={0.35} className="why-copy">
        <p className="why-ja" lang="ja">1台のクルマ、明確な価格、そして支えるチーム。</p>
        <p className="why-lede">A training car usually means separate answers for the car, the parts and the support. Anargya is building all three as one package for racing academies in Japan.</p>
      </Reveal></Parallax>
    </div>
    <DrawLine />
    <div className="advantage-grid">{advantages.map((item, index) => <Parallax key={item.en} fill y={index % 2 ? -26 : 26}>
      <SpotlightCard delay={index * 0.1} className="advantage">
        <span className="advantage-index">{String(index + 1).padStart(2, "0")}</span>
        <h3>{item.en}</h3><p className="advantage-ja" lang="ja">{item.ja}</p><p>{item.copy}</p>
        <span className="advantage-arrow" aria-hidden="true">↗</span>
      </SpotlightCard>
    </Parallax>)}</div>
    <p className="why-note">Volumes and dates are targets from the project plan, not production commitments. Performance figures will be published after validation.</p>
  </SectionCurtain>;
}

function FeaturedSection() {
  return <section className="featured-section" aria-labelledby="featured-title">
    <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Featured / 注目</p>
      <h2 id="featured-title">Explore what drives innovation.</h2>
      <p>Our featured vehicle brings the chassis, suspension and integrated electric stack together in one car built to train racing drivers.</p></Reveal>
    <Reveal delay={0.15} className="featured-card">
      <span className="page-eyebrow">Featured product</span>
      <strong>Anargya Formula Student EV</strong>
      <span lang="ja">レーシングドライバーを育てるEV</span>
      <p>¥6,627,281 per car.</p>
      <div className="hero-actions"><a className="button-primary" href="/specifications">View vehicle <span aria-hidden="true">→</span></a><a className="button-secondary" href="/sales">Sales information</a></div>
    </Reveal>
  </section>;
}

const profileFacts = [
  { label: "Based in", value: "Nagoya, Japan" },
  { label: "Focus", value: "Electric vehicle technology" },
  { label: "We design", value: "Cost-efficient Formula Student concept EVs" },
  { label: "For", value: "Racing academies worldwide" },
];

function CompanyProfile() {
  return <SectionCurtain className="profile-section premium-dark" id="profile" labelledBy="profile-title">
    <GhostWord text="NAGOYA" />
    <div className="profile-head">
      <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Company profile</p></Reveal>
      <SplitReveal as="h2" id="profile-title" className="profile-title" lines={["Anargya", <em key="p">at a glance.</em>]} />
    </div>
    <DrawLine />
    <div className="profile-body">
      <Parallax y={-20}><Reveal className="profile-lead"><p>Anargya is an automotive startup based in Nagoya, Japan, focused on electric vehicle (EV) technology.</p></Reveal></Parallax>
      <Parallax y={20}><Reveal delay={0.15} className="profile-side"><p>We design cost-efficient Formula Student concept EVs, built by trusted manufacturing partners and supported by digital services, for racing academies worldwide.</p>
        <p className="profile-pills"><span>Trusted manufacturing partners</span><span>Digital services</span></p></Reveal></Parallax>
    </div>
    <div className="profile-facts">{profileFacts.map((fact, index) => <SpotlightCard key={fact.label} delay={index * 0.1} className="profile-fact">
      <span className="advantage-index">{String(index + 1).padStart(2, "0")}</span>
      <small>{fact.label}</small><strong>{fact.value}</strong>
    </SpotlightCard>)}</div>
  </SectionCurtain>;
}

export function LandingPage() {
  const reducedMotion = Boolean(useReducedMotion());
  const rise = (delay: number) => reducedMotion ? {} : {
    initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.4, delay, ease: "easeOut" as const },
  };
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(heroProgress, [0, 1], [0, -140]);
  const copyOpacity = useTransform(heroProgress, [0, 0.8], [1, 0.15]);
  return <><a className="skip-link" href="#main-content">Skip to main content</a><SiteNavigation />
    <main id="main-content">
      <section className="hero-banner" id="hero" ref={heroRef} aria-label="Anargya introductory banner">
        <video className="hero-video" src="/assets/hero.mp4" autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="hero-video-scrim" aria-hidden="true" />
        <motion.div className="hero-banner-copy" style={reducedMotion ? undefined : { y: copyY, opacity: copyOpacity }}>
          <motion.p className="hero-kicker" {...rise(0.05)}>Anargya</motion.p>
          <h1><motion.span {...rise(0.15)}>The EV that trains</motion.span><motion.span {...rise(0.35)}><em>racing drivers.</em></motion.span></h1>
        </motion.div>
        <motion.div className="hero-actions" {...rise(0.68)}>
          <a className="button-secondary" href="#why">Why Anargya <span aria-hidden="true">↓</span></a>
        </motion.div>
      </section>
      <Ticker />
      <FeaturedSection />
      <CompanyProfile />
      <WhySection />
      <VehicleSequence />
      <LiveTelemetrySection />
      <ContactSection />
    </main>
    <SiteFooter />
  </>;
}
