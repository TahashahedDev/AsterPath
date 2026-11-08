"use client";

import { useEffect, useRef } from "react";
import { geoDistance, geoEquirectangular, geoInterpolate, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import landTopology from "world-atlas/land-110m.json";
import { countries, originCity } from "@/content/countries";

type LonLat = [number, number];

type Route = {
  label: string;
  to: LonLat;
  labelOffset: [number, number];
  labelAlign: CanvasTextAlign;
  delay: number;
};

const ORIGIN: LonLat = originCity.coordinates;

// Label offsets keep the three European markers legible at small sizes.
const labelPlacement: Record<string, Pick<Route, "labelOffset" | "labelAlign">> = {
  france: { labelOffset: [-10, 4], labelAlign: "right" },
  germany: { labelOffset: [10, -6], labelAlign: "left" },
  italy: { labelOffset: [10, 12], labelAlign: "left" },
};

const ROUTES: Route[] = countries.map((country, index) => ({
  label: country.name,
  to: country.capital.coordinates,
  delay: index * 0.9,
  ...(labelPlacement[country.slug] ?? { labelOffset: [10, 0], labelAlign: "left" }),
}));

type Palette = {
  ink: string; // "r, g, b" so alpha can be applied per draw call
  primary: string;
  gold: string;
  marker: string;
  sphere: [string, string, string];
};

function hexToRgb(hex: string): string {
  const value = hex.trim().replace("#", "");
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  const n = Number.parseInt(full, 16);
  return Number.isNaN(n) ? "16, 29, 44" : `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/** Reads the active theme's tokens, so the canvas always matches the CSS. */
function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    ink: hexToRgb(token("--color-ink")),
    primary: hexToRgb(token("--color-primary")),
    gold: hexToRgb(token("--color-gold")),
    marker: token("--color-card") || "#ffffff",
    sphere: [token("--color-globe-hi"), token("--color-globe-mid"), token("--color-globe-lo")],
  };
}

const CENTER_LON = 40;
const CENTER_LAT = 38;
const ARC_SAMPLES = 64;
const CYCLE_SECONDS = 5.4;

/** Rasterise land once to an equirectangular bitmap, then sample an evenly spaced dot grid. */
function buildLandDots(): LonLat[] {
  const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>;
  const land = feature(topology, topology.objects.land) as FeatureCollection;
  const width = 720;
  const height = 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const projection = geoEquirectangular().scale(width / (2 * Math.PI)).translate([width / 2, height / 2]);
  ctx.beginPath();
  geoPath(projection, ctx)(land);
  ctx.fill();
  const pixels = ctx.getImageData(0, 0, width, height).data;

  const dots: LonLat[] = [];
  const step = 1.55;
  for (let lat = -58; lat <= 82; lat += step) {
    const perRow = Math.max(1, Math.round((360 / step) * Math.cos((lat * Math.PI) / 180)));
    for (let i = 0; i < perRow; i++) {
      const lon = -180 + (i + 0.5) * (360 / perRow);
      const x = Math.min(width - 1, Math.floor(((lon + 180) / 360) * width));
      const y = Math.min(height - 1, Math.floor(((90 - lat) / 180) * height));
      if ((pixels[(y * width + x) * 4 + 3] ?? 0) > 127) dots.push([lon, lat]);
    }
  }
  return dots;
}

/** Great-circle points lifted above the surface so routes read as flight paths. */
function arcPoints(from: LonLat, to: LonLat): { point: LonLat; lift: number }[] {
  const interpolate = geoInterpolate(from, to);
  return Array.from({ length: ARC_SAMPLES + 1 }, (_, i) => {
    const s = i / ARC_SAMPLES;
    return { point: interpolate(s), lift: 1 + 0.16 * Math.sin(Math.PI * s) };
  });
}

function projectLifted(projection: GeoProjection, point: LonLat, lift: number, cx: number, cy: number): [number, number] | null {
  const projected = projection(point);
  if (!projected) return null;
  return [cx + (projected[0] - cx) * lift, cy + (projected[1] - cy) * lift];
}

export default function HeroGlobe({ animate }: { animate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dots = buildLandDots();
    const arcs = ROUTES.map((route) => ({ ...route, points: arcPoints(ORIGIN, route.to) }));
    const projection = geoOrthographic().clipAngle(90).precision(0.5);
    const fontFamily = getComputedStyle(document.body).fontFamily;
    let colors = readPalette();

    let width = 0;
    let height = 0;
    let radius = 0;
    let frame = 0;
    let visible = true;
    const start = performance.now();
    const pointer = { x: 0, y: 0, ex: 0, ey: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      radius = Math.min(width, height) / 2 - 18;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection.translate([width / 2, height / 2]).scale(radius);
    };

    const draw = (now: number) => {
      const t = animate ? (now - start) / 1000 : 0;
      pointer.ex += (pointer.x - pointer.ex) * 0.04;
      pointer.ey += (pointer.y - pointer.ey) * 0.04;
      const lon = CENTER_LON + (animate ? Math.sin(t * 0.12) * 9 : 0) + pointer.ex * 8;
      const lat = CENTER_LAT + pointer.ey * 5;
      projection.rotate([-lon, -lat]);
      const center: LonLat = [lon, lat];
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Atmosphere halo
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.12);
      halo.addColorStop(0, `rgba(${colors.primary}, 0.10)`);
      halo.addColorStop(1, `rgba(${colors.primary}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
      ctx.fill();

      // Sphere body, lit from the upper left
      const body = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.1, cx, cy, radius);
      body.addColorStop(0, colors.sphere[0]);
      body.addColorStop(0.65, colors.sphere[1]);
      body.addColorStop(1, colors.sphere[2]);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${colors.ink}, 0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Land dots, bucketed by depth so we only change fill style three times
      const buckets: [number, number][][] = [[], [], []];
      for (const dot of dots) {
        const distance = geoDistance(dot, center);
        if (distance > Math.PI / 2 - 0.02) continue;
        const p = projection(dot);
        if (!p) continue;
        const depth = Math.cos(distance);
        buckets[depth > 0.75 ? 0 : depth > 0.4 ? 1 : 2]!.push([p[0], p[1]]);
      }
      const dotSize = Math.max(1.1, radius / 190);
      const dotAlphas = document.documentElement.dataset.theme === "dark" ? [0.5, 0.32, 0.16] : [0.42, 0.28, 0.14];
      dotAlphas.forEach((alpha, index) => {
        ctx.fillStyle = `rgba(${colors.ink}, ${alpha})`;
        ctx.beginPath();
        for (const [x, y] of buckets[index]!) {
          ctx.moveTo(x + dotSize, y);
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        }
        ctx.fill();
      });

      // Routes: a faint full path, then a travelling bright segment
      for (const arc of arcs) {
        const screen = arc.points.map(({ point, lift }) => projectLifted(projection, point, lift, cx, cy));
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = `rgba(${colors.primary}, 0.35)`;
        ctx.beginPath();
        screen.forEach((p, i) => p && (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
        ctx.stroke();

        if (animate) {
          const phase = ((t - arc.delay) / CYCLE_SECONDS) % 1;
          const progress = phase < 0 ? phase + 1 : phase;
          const head = Math.floor(progress * ARC_SAMPLES * 1.25);
          const tail = Math.max(0, head - 18);
          for (let i = tail; i < Math.min(head, ARC_SAMPLES); i++) {
            const a = screen[i];
            const b = screen[i + 1];
            if (!a || !b) continue;
            const strength = (i - tail) / Math.max(1, head - tail);
            ctx.strokeStyle = `rgba(${colors.primary}, ${0.15 + strength * 0.85})`;
            ctx.lineWidth = 1.2 + strength * 1.4;
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
          const headPoint = screen[Math.min(head, ARC_SAMPLES)];
          if (headPoint && head <= ARC_SAMPLES) {
            ctx.fillStyle = `rgba(${colors.primary}, 0.95)`;
            ctx.beginPath();
            ctx.arc(headPoint[0], headPoint[1], 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Markers
      const drawMarker = (point: LonLat, color: string, pulseOffset: number) => {
        const p = projection(point);
        if (!p) return null;
        if (animate) {
          const pulse = ((t + pulseOffset) % 2.4) / 2.4;
          ctx.strokeStyle = `rgba(${color}, ${0.5 * (1 - pulse)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4 + pulse * 12, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = colors.marker;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgb(${color})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 3.2, 0, Math.PI * 2);
        ctx.fill();
        return p;
      };

      const labelSize = Math.max(11, Math.min(13, radius / 18));
      ctx.font = `500 ${labelSize}px ${fontFamily}`;
      ctx.textBaseline = "middle";

      const origin = drawMarker(ORIGIN, colors.primary, 0);
      if (origin) {
        ctx.fillStyle = `rgba(${colors.ink}, 0.85)`;
        ctx.textAlign = "left";
        ctx.fillText("India", origin[0] + 10, origin[1] + 2);
      }
      arcs.forEach((arc, index) => {
        const p = drawMarker(arc.to, colors.gold, index * 0.6 + 0.8);
        if (!p) return;
        ctx.fillStyle = `rgba(${colors.ink}, 0.85)`;
        ctx.textAlign = arc.labelAlign;
        ctx.fillText(arc.label, p[0] + arc.labelOffset[0], p[1] + arc.labelOffset[1]);
      });
    };

    const loop = (now: number) => {
      draw(now);
      if (animate && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      if (animate && visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    resize();
    draw(performance.now());
    restart();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      restart();
    });
    intersection.observe(canvas);

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (animate) window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", restart);

    // Repaint with the new tokens when the theme changes (also covers the static, reduced-motion mode).
    const themeObserver = new MutationObserver(() => {
      colors = readPalette();
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", restart);
      themeObserver.disconnect();
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="size-full motion-safe:animate-[fade_1.4s_ease-out_both]"
      role="img"
      aria-label="A globe showing routes from India to Italy, Germany and France"
    />
  );
}
