import type { Metadata } from "next";
import { CountUp, DrawLine, GhostWord, GrowBar, Parallax, ParallaxLayer, Reveal, SectionCurtain, SplitReveal } from "@/components/motion-kit";
import { SiteFooter, SiteNavigation } from "@/components/site-navigation";

export const metadata: Metadata = {
  title: "Sales Information | Anargya Racing",
  description: "Sales information and Japan market plan for the Anargya Formula Student EV concept.",
};

const roadmap = [
  { year: "2027", stage: "Prototype and manufacturing partner", volume: "Prototype", cars: 0 },
  { year: "2028", stage: "Japan market expansion", volume: "5 vehicles", cars: 5 },
  { year: "2029", stage: "Asia-Pacific expansion", volume: "15 vehicles", cars: 15 },
  { year: "2030", stage: "Selected international markets", volume: "40 vehicles", cars: 40 },
  { year: "2031", stage: "Planned annual sales", volume: "60 vehicles", cars: 60 },
];

export default function SalesPage() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><SiteNavigation /><main id="main-content" className="detail-page sales-page">
    <section className="sales-hero">
      <ParallaxLayer className="orb orb--blue orb-a" y={160} />
      <ParallaxLayer className="orb orb--pink orb-b" y={-110} />
      <Parallax y={-30}><div className="sales-heading"><Reveal><p className="page-eyebrow">Vehicle sales / Japan</p></Reveal>
        <SplitReveal as="h1" lines={["Your academy’s", "own Formula", <em key="ev">Student EV.</em>]} />
        <Reveal delay={0.4}><p className="page-lede" lang="ja" style={{ color: "#9ebcff", marginTop: "1rem" }}>アカデミー専用のフォーミュラ・スチューデントEVを、計画できる価格で。</p>
        <p className="page-lede">An integrated electric stack for driver training, testing and performance research, with a stated price target, spare parts and service planned for Japan, and an optional live telemetry add-on.</p>
        <a className="button-primary" href="/#contact">Contact sales</a></Reveal>
      </div></Parallax>
      <Parallax y={40}><Reveal delay={0.5} className="sales-price-block"><p className="page-eyebrow">Project target price / per vehicle</p><strong><CountUp value={6000000} prefix="¥" format="yen" /></strong>
        <p>Project planning target, not a quotation. Final price, vehicle specification and availability require a written proposal.</p>
      </Reveal></Parallax>
    </section>
    <SectionCurtain className="sales-roadmap premium-dark" id="roadmap" labelledBy="roadmap-title">
      <GhostWord text="2031" />
      <Parallax y={-28}><div className="roadmap-heading">
        <Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Proposed market plan / 市場計画</p></Reveal>
        <SplitReveal as="h2" id="roadmap-title" lines={["Five years,", <em key="g">one climb.</em>]} />
        <Reveal delay={0.3}><p>The schedule and vehicle volumes below are targets in the project plan. They are not confirmed production commitments; expansion depends on partner and market validation.</p></Reveal>
      </div></Parallax>
      <div className="roadmap-list">{roadmap.map((item, index) => <div className="roadmap-row" key={item.year}>
        <DrawLine delay={index * 0.08} />
        <div className="roadmap-cells">
          <span className="roadmap-year">{item.year}</span>
          <span className="roadmap-stage">{item.stage}</span>
          <GrowBar ratio={item.cars / 60} delay={0.2 + index * 0.1} />
          <span className="roadmap-volume">{item.volume}</span>
        </div>
      </div>)}<DrawLine delay={0.5} /></div>
    </SectionCurtain>
    <SectionCurtain className="sales-details premium-dark" labelledBy="sales-details-title">
      <Parallax y={-24}><div><Reveal><p className="page-eyebrow"><i className="eyebrow-dot" />Pilot evaluation / Japan</p></Reveal>
        <SplitReveal as="h2" id="sales-details-title" lines={["Evaluate it", <em key="t">with your team.</em>]} /></div></Parallax>
      <Parallax y={24}><Reveal delay={0.25} className="sales-detail-copy"><p>The project plan proposes evaluating the vehicle with Japanese academies before expanding production. Its targets include feedback from at least five respondents across three academies and a 90% vehicle-quality approval rate. These are proposed targets, not achieved results.</p>
        <p>The proposed pilot model assumes a 30% deposit. Payment, cancellation and delivery terms would be confirmed in an individual sales agreement.</p>
        <a className="button-secondary" href="/specifications">View vehicle information</a>
        <a className="text-link" href="/#contact">Prepare an inquiry <span aria-hidden="true">↗</span></a>
      </Reveal></Parallax>
    </SectionCurtain>
  </main><SiteFooter /></>;
}
