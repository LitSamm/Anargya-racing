"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
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
    <a className="brand-lockup" href="/#hero" onClick={closeMenu} aria-label="Anargya, return to home">
      <Image className="brand-mark" src="/assets/anargya-mark.png" alt="" width={600} height={347} />
      <span><span className="brand-name">ANARGYA</span><span className="brand-caption">FORMULA STUDENT EV</span></span>
    </a>
    <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}>
      {menuOpen ? "Close" : "Menu"}
    </button>
    <nav className={`navigation${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label="Main navigation">
      <a href="/#why" onClick={closeMenu}>Why Anargya</a>
      <a href="/#anatomy" onClick={closeMenu}>Vehicle</a>
      <a href="/specifications" onClick={closeMenu}>Specifications</a>
      <a href="/sales" onClick={closeMenu}>Sales</a>
      <a href="/#live-telemetry" onClick={closeMenu}>Live telemetry</a>
      <a className="mobile-contact-link" href="/#contact" onClick={closeMenu}>Contact</a>
    </nav>
    <a className="header-cta" href="/#contact">Contact sales</a>
  </header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <GhostWord text="ANARGYA" className="footer-ghost" />
    <div className="site-footer-main">
      <Parallax y={-22}><Reveal><div className="site-footer-brand">
        <Image src="/assets/anargya-wordmark.png" alt="Anargya" width={600} height={76} />
        <p>The Formula Student EV built to train racing drivers, planned first for racing academies in Japan.</p>
        <p lang="ja">レーシングドライバーを育てるEV。まずは日本のアカデミーへ。</p>
      </div></Reveal></Parallax>
      <Parallax y={22}><Reveal delay={0.15}><nav className="site-footer-nav" aria-label="Footer navigation">
        <div><h2>Vehicle</h2><a href="/specifications">Specifications</a><a href="/#anatomy">Vehicle overview</a></div>
        <div><h2>Sales</h2><a href="/sales">Sales information</a><a href="/#contact">Contact sales</a></div>
        <div><h2>Program</h2><a href="/#live-telemetry">Live telemetry</a><a href="/sales#roadmap-title">Japan market plan</a></div>
      </nav></Reveal></Parallax>
    </div>
    <div className="site-footer-bottom"><span>ANARGYA RACING / FORMULA STUDENT EV</span><span>© 2026 Anargya Racing</span></div>
  </footer>;
}
