"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DrawLine, GhostWord, Parallax, Reveal, SectionCurtain, SplitReveal } from "@/components/motion-kit";

/*
 * A visual preview of the optional Anargya live telemetry app. It is not the app:
 * there is no link into it, and every value is simulated. The real app is only
 * available to customers who buy the vehicle together with the telemetry add-on.
 */

type Reading = { speed: number; voltage: number; current: number; motor: number; history: number[] };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// A deterministic starting trace, so server and client render the same markup.
const initial: Reading = {
  speed: 61.7,
  voltage: 396.4,
  current: 82.6,
  motor: 74.2,
  history: Array.from({ length: 32 }, (_, i) => 55 + Math.sin(i / 4.5) * 3.2 + i * 0.2),
};

function useSimulatedReadings(active: boolean) {
  const reduced = Boolean(useReducedMotion());
  const [reading, setReading] = useState<Reading>(initial);
  useEffect(() => {
    if (!active || reduced) return;
    const timer = setInterval(() => {
      setReading((previous) => {
        const speed = clamp(previous.speed + (Math.random() - 0.48) * 2.6, 46, 76);
        return {
          speed,
          voltage: clamp(previous.voltage + (Math.random() - 0.55) * 0.22, 392.5, 399),
          current: clamp(previous.current + (Math.random() - 0.5) * 3.4, 40, 98),
          motor: clamp(previous.motor + (Math.random() - 0.45) * 0.5, 60, 92),
          history: [...previous.history.slice(1), speed],
        };
      });
    }, 1100);
    return () => clearInterval(timer);
  }, [active, reduced]);
  return reading;
}

function Trace({ values, width, height }: { values: number[]; width: number; height: number }) {
  const min = 40;
  const max = 80;
  const x = (index: number) => (index / (values.length - 1)) * width;
  const y = (value: number) => height - ((clamp(value, min, max) - min) / (max - min)) * (height - 8) - 4;
  const line = values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  return <svg className="live-trace" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`trace-fill-${width}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#3f7bf0" stopOpacity="0.35" /><stop offset="1" stopColor="#3f7bf0" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`trace-line-${width}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#3f7bf0" /><stop offset="1" stopColor="#f20c62" />
      </linearGradient>
    </defs>
    {[0.25, 0.5, 0.75].map((fraction) => <line key={fraction} x1="0" x2={width} y1={height * fraction} y2={height * fraction} className="live-grid-line" />)}
    <polygon points={area} fill={`url(#trace-fill-${width})`} />
    <polyline points={line} fill="none" stroke={`url(#trace-line-${width})`} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="3.6" fill="#f20c62" />
  </svg>;
}

function DesktopFrame({ reading }: { reading: Reading }) {
  return <div className="live-device live-desktop" aria-hidden="true">
    <div className="live-chrome"><i /><i /><i /><span>Anargya Live Telemetry</span><em>Demo data</em></div>
    <div className="live-dash">
      <div className="live-tiles">
        <div className="live-tile live-tile--lead"><small>Wheel speed</small><strong>{reading.speed.toFixed(1)}<span>km/h</span></strong><em>Four-wheel average</em></div>
        <div className="live-tile"><small>BMS voltage</small><strong>{reading.voltage.toFixed(1)}<span>V</span></strong><em>Battery pack</em></div>
        <div className="live-tile"><small>BMS current</small><strong>{reading.current.toFixed(1)}<span>A</span></strong><em>Battery pack</em></div>
        <div className="live-tile"><small>Motor temp</small><strong>{reading.motor.toFixed(1)}<span>°C</span></strong><em>Motor</em></div>
      </div>
      <div className="live-panel">
        <div className="live-panel-head"><div><small>Telemetry history</small><b>Wheel speed</b></div><span><i />Simulated</span></div>
        <Trace values={reading.history} width={420} height={110} />
        <div className="live-axis"><span>60 sec ago</span><span>30 sec ago</span><span>Now</span></div>
      </div>
      <div className="live-chips">
        {["Brake front 6.4 bar", "Throttle 64.8 %", "Steering +4.8°", "Susp. FL 38.2 mm", "GPS fix"].map((chip) => <span key={chip}>{chip}</span>)}
      </div>
    </div>
  </div>;
}

function PhoneFrame({ reading }: { reading: Reading }) {
  return <div className="live-device live-phone" aria-hidden="true">
    <div className="live-notch" />
    <div className="live-phone-brand"><b>ANARGYA</b><small>LIVE TELEMETRY</small></div>
    <div className="live-phone-tiles">
      <div className="live-tile live-tile--lead"><small>Wheel speed</small><strong>{reading.speed.toFixed(1)}<span>km/h</span></strong></div>
      <div className="live-tile"><small>BMS voltage</small><strong>{reading.voltage.toFixed(1)}<span>V</span></strong></div>
      <div className="live-tile"><small>BMS current</small><strong>{reading.current.toFixed(1)}<span>A</span></strong></div>
      <div className="live-tile"><small>Motor temp</small><strong>{reading.motor.toFixed(1)}<span>°C</span></strong></div>
    </div>
    <div className="live-panel live-panel--phone"><div className="live-panel-head"><div><b>Wheel speed</b></div><span><i />Demo</span></div><Trace values={reading.history} width={240} height={70} /></div>
    <div className="live-phone-nav"><span className="is-on">Overview</span><span>Telemetry</span><span>Sensors</span><span>GPS</span></div>
  </div>;
}

const features = [
  { en: "Installs like an app", ja: "アプリとして追加", copy: "A progressive web app for phone, tablet and laptop. Add it to the home screen." },
  { en: "The channels that matter", ja: "必要なデータを一目で", copy: "Wheel speed, battery voltage and current, temperatures, suspension travel, steering, brake pressure and GPS position." },
  { en: "For customers only", ja: "ご購入のお客様向け", copy: "Access comes with the vehicle plus the telemetry add-on. It is not a public app." },
];

export function LiveTelemetrySection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInView(stageRef, { margin: "0px 0px -10% 0px" });
  const reading = useSimulatedReadings(visible);

  return <SectionCurtain className="live-section premium-dark" id="live-telemetry" labelledBy="live-title">
    <GhostWord text="LIVE" />
    <div className="live-grid">
      <div className="live-copy">
        <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Optional add-on / オプション</p></Reveal>
        <SplitReveal as="h2" id="live-title" className="live-title" lines={["Live telemetry,", <em key="p">in your pocket.</em>]} />
        <Reveal delay={0.3}>
          <p className="why-ja" lang="ja">走行中の車両データを、手のひらに。</p>
          <p className="live-lede">The Anargya telemetry app shows how the car is doing, on the device you already carry. It is an optional add-on that comes with a vehicle purchase.</p>
        </Reveal>
        <ul className="live-features">{features.map((feature, index) => <li key={feature.en}>
          <Reveal delay={0.1 * index}><span className="live-feature-index">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{feature.en}</h3><p className="live-feature-ja" lang="ja">{feature.ja}</p><p>{feature.copy}</p></div></Reveal>
        </li>)}</ul>
        <Reveal delay={0.2}><div className="live-actions">
          <a className="button-primary" href="/#contact">Ask about the telemetry add-on <span aria-hidden="true">→</span></a>
        </div></Reveal>
      </div>

      <div className="live-stage" ref={stageRef} role="img" aria-label="Preview of the Anargya live telemetry app on a laptop and a phone, showing simulated readings">
        <div className="live-glow" aria-hidden="true" />
        <Parallax y={-22}><Reveal delay={0.1}><DesktopFrame reading={reading} /></Reveal></Parallax>
        <Parallax y={34} className="live-phone-wrap"><Reveal delay={0.3} y={60}><PhoneFrame reading={reading} /></Reveal></Parallax>
        <p className="live-caption">Preview only. All values are simulated.</p>
      </div>
    </div>
    <DrawLine />
    <p className="why-note">The telemetry app is not available from this website. Access is provided to customers who purchase the vehicle together with the telemetry add-on. Readings shown here are simulated for illustration.</p>
  </SectionCurtain>;
}
