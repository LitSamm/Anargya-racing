import type { Metadata } from "next";
import { DrawLine, GhostWord, Parallax, ParallaxLayer, Reveal, SectionCurtain, SpotlightCard, SplitReveal } from "@/components/motion-kit";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";
import { SpecificationShowcase } from "@/components/specification-showcase";

export const metadata: Metadata = {
  title: "Vehicle | Anargya Racing",
  description: "Explore the Anargya Formula Student EV concept, available vehicle information and interactive 3D component guide.",
};

const systems = [
  { title: "Electric powertrain", copy: "An electric powertrain is part of the vehicle development scope. Output figures are pending validation." },
  { title: "Inverter & software", copy: "The project includes inverter and vehicle software development. Detailed specifications will follow validation." },
  { title: "Driver training & research", copy: "The concept is intended for driver instruction and vehicle performance research." },
  { title: "Parts & telemetry", copy: "The plan includes motorsport spare-parts support and an optional live telemetry app, available as an add-on with the vehicle." },
];

export default function SpecificationsPage() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><SiteNavigation /><main id="main-content" className="detail-page specifications-page">
    <section className="specification-hero">
      <ParallaxLayer className="orb orb--blue orb-a" y={160} />
      <ParallaxLayer className="orb orb--pink orb-b" y={-110} />
      <Parallax y={-30}><div className="specification-heading"><Reveal><p className="page-eyebrow">Vehicle / Overview</p></Reveal>
        <SplitReveal as="h1" lines={["Every system,", <em key="t">built to teach.</em>]} />
        <Reveal delay={0.4}><p className="page-lede" lang="ja" style={{ color: "#9ebcff", marginTop: "1rem" }}>すべてのシステムを、ドライバー育成のために。</p>
        <p className="page-lede">Pick a system and the camera flies straight to it. Chassis, suspension, cockpit, wheels and aero are all explorable in the 3D model; the powertrain, inverter and software are developed alongside them.</p></Reveal>
      </div></Parallax>
      <Parallax y={40}><Reveal delay={0.5} className="specification-fact"><span>Intended for</span><strong>Racing<br />academies</strong><span>Initial market / Japan</span></Reveal></Parallax>
    </section>
    <section className="specification-explorer" aria-labelledby="explorer-title">
      <Reveal><div className="explorer-heading"><div><p className="page-eyebrow">Interactive 3D / Component guide</p><h2 id="explorer-title">Pick a system. Fly right to it.</h2></div><p>Select a system and the camera zooms to it while its parts light up. The powertrain, inverter and software are part of the development scope; they are not shown as separate components here.</p></div></Reveal>
      <Reveal delay={0.1}><SpecificationShowcase /></Reveal>
      <p className="specification-note">Motor output, torque, battery capacity, vehicle mass, dimensions and top speed are not yet available as validated specifications.</p>
    </section>
    <SectionCurtain className="specification-systems premium-dark" labelledBy="scope-title">
      <GhostWord text="SCOPE" />
      <div className="scope-head">
        <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Development scope / 開発範囲</p></Reveal>
        <SplitReveal as="h2" id="scope-title" className="scope-title" lines={["Beyond the", <em key="body">bodywork.</em>]} />
        <Reveal delay={0.3}><p className="scope-lede">The parts you can see are only half the car. These four areas are developed alongside them, and detailed figures follow validation.</p></Reveal>
      </div>
      <DrawLine />
      <div className="scope-grid">{systems.map((item,index)=><Parallax key={item.title} fill y={index % 2 ? -26 : 26}>
        <SpotlightCard delay={index*0.1} className="scope-card">
          <span className="advantage-index">{String(index+1).padStart(2,"0")}</span><h3>{item.title}</h3><p>{item.copy}</p><span className="advantage-arrow" aria-hidden="true">↗</span>
        </SpotlightCard>
      </Parallax>)}</div>
    </SectionCurtain>
  </main><SiteFooter /></>;
}
