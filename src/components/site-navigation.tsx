"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GhostWord, Parallax, Reveal } from "@/components/motion-kit";

export function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const reducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return <header className="site-header">
    {!reducedMotion && <motion.span className="page-progress" aria-hidden="true" style={{ scaleX: progress }} />}
    <Link className="brand-lockup" href="/#hero" onClick={closeMenu} aria-label="Anargya, return to home">
      <Image className="brand-mark" src="/assets/anargya-logo.png" alt="" width={798} height={464} priority />
      <span><span className="brand-name">ANARGYA</span></span>
    </Link>
    <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
      {menuOpen ? "Close" : "Menu"}
    </button>
    <nav className={`navigation${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label="Main navigation">
      <Link href="/#why" onClick={closeMenu}>Why Anargya</Link>
      <Link href="/#anatomy" onClick={closeMenu}>Vehicle</Link>
      <Link href="/specifications" onClick={closeMenu}>Specifications</Link>
      <Link href="/sales" onClick={closeMenu}>Sales</Link>
      <Link href="/#live-telemetry" onClick={closeMenu}>Live telemetry</Link>
    </nav>
    <Link className="header-cta" href="/#contact">Contact</Link>
  </header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <GhostWord text="ANARGYA" className="footer-ghost" />
    <div className="site-footer-main">
      <Parallax y={-22}><Reveal><div className="site-footer-brand">
        <div className="footer-lockup" role="img" aria-label="Anargya">
          <Image className="footer-logo" src="/assets/anargya-logo.png" alt="" width={798} height={464} />
          <Image className="footer-wordtext" src="/assets/anargya-wordtext.png" alt="" width={410} height={69} />
        </div>
        <p>The Formula Student EV built to train racing drivers, planned first for racing academies in Japan.</p>
        <p lang="ja">レーシングドライバーを育てるEV。まずは日本のアカデミーへ。</p>
        <address className="footer-address">Esaki-40 Haruhi, Kiyosu,<br />Aichi 452-0962, Japan</address>
      </div></Reveal></Parallax>
      <Parallax y={22}><Reveal delay={0.15}><nav className="site-footer-nav" aria-label="Footer navigation">
        <div><h2>Vehicle</h2><Link href="/specifications">Specifications</Link><Link href="/#anatomy">Vehicle overview</Link></div>
        <div><h2>Sales</h2><Link href="/sales">Sales information</Link><Link href="/#contact">Contact</Link></div>
        <div><h2>Program</h2><Link href="/#live-telemetry">Live telemetry</Link><Link href="/sales#roadmap-title">Japan market plan</Link></div>
      </nav></Reveal></Parallax>
    </div>
    <div className="site-footer-bottom"><span>ANARGYA / FORMULA STUDENT EV</span><span>© 2026 Anargya</span></div>
  </footer>;
}
