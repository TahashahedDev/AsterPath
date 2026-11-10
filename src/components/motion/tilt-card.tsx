"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/**
 * A card that drifts slightly toward the pointer, with a soft light following it.
 * 2D only: a 3D rotation makes Chrome rasterise the map and it turns blurry.
 * Used once, on the hero map, so the page has one tactile moment.
 */
export function TiltCard({ children, className, shift = 10 }: { children: React.ReactNode; className?: string; shift?: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const x = useSpring(useTransform(px, [0, 1], [-shift, shift]), spring);
  const y = useSpring(useTransform(py, [0, 1], [-shift, shift]), spring);
  const lightX = useTransform(px, (v) => `${v * 100}%`);
  const lightY = useTransform(py, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(26rem circle at ${lightX} ${lightY}, rgb(255 255 255 / 0.4), transparent 60%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={reset} className={className}>
      <motion.div style={reduce ? undefined : { x, y }} className="relative">
        {children}
        {!reduce && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.75rem] mix-blend-soft-light" style={{ background: light }} />}
      </motion.div>
    </div>
  );
}
