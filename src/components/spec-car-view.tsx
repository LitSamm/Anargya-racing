"use client";

import { useMotionValue, useReducedMotion } from "framer-motion";
import { CarScene } from "@/components/car-scene";

export function SpecCarView({ highlight }: { highlight: string }) {
  const progress = useMotionValue(0);
  const reducedMotion = Boolean(useReducedMotion());
  return <div className="spec-vehicle-render">
    <CarScene progress={progress} rotating={!reducedMotion} reducedMotion={reducedMotion} highlight={highlight} framing="center" />
  </div>;
}
