import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { useMemo, type ReactNode } from "react";
import { buildMap } from "./map";

const { fontFamily: display } = loadBodoni("normal", { weights: ["500"] });
const { fontFamily: displayItalic } = loadBodoni("italic", { weights: ["400"] });
const { fontFamily: sans } = loadManrope("normal", { weights: ["500", "700"] });

// Brand palette (light theme tokens from the website).
const C = {
  paper: "#f8f5ee",
  card: "#fffdf8",
  ink: "#101d2c",
  muted: "#59626e",
  primary: "#187a66",
  primarySoft: "#dcebe4",
  terracotta: "#c4643f",
  land: "#e9e3d6",
  border: "#d4ccbd",
  inverse: "#101d2c",
  onInverse: "#f8f5ee",
  accentOnInverse: "#4cc3a3",
};

const SCENES = { title: 105, map: 225, stages: 180, pricing: 135, promise: 120, cta: 105 };
export const INTRO_DURATION = Object.values(SCENES).reduce((a, b) => a + b, 0);

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Fades a scene in over its first frames and out over its last. */
function Scene({ duration, children, background = C.paper }: { duration: number; children: ReactNode; background?: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background, opacity }}>{children}</AbsoluteFill>;
}

function useUnit() {
  const { width, height } = useVideoConfig();
  return { u: Math.min(width, height) / 1080, vertical: height > width, width, height };
}

function Rise({ delay = 0, children, distance = 40 }: { delay?: number; children: ReactNode; distance?: number }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * distance}px)` }}>{children}</div>;
}

function Star({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <path d="M9.5 9.5 16 14.6 22.5 9.5 17.4 16 22.5 22.5 16 17.4 9.5 22.5 14.6 16Z" fill="#c7a66a" />
      <path d="M16 1 18.2 13.8 27 16 18.2 18.2 16 31 13.8 18.2 5 16 13.8 13.8Z" fill={C.primary} />
      <path d="M16 1 18.2 13.8 16 16ZM27 16 18.2 18.2 16 16ZM16 31 13.8 18.2 16 16ZM5 16 13.8 13.8 16 16Z" fill="#11604f" />
    </svg>
  );
}

function Glow() {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(60% 50% at 10% 0%, rgba(24,122,102,0.14), transparent 70%), radial-gradient(50% 45% at 100% 10%, rgba(196,100,63,0.13), transparent 70%)",
      }}
    />
  );
}

function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useUnit();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <Scene duration={SCENES.title}>
      <Glow />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 * u }}>
        <div style={{ transform: `scale(${s}) rotate(${(1 - s) * -90}deg)` }}>
          <Star size={150 * u} />
        </div>
        <Rise delay={14}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 46 * u, color: C.ink, marginTop: 30 * u, letterSpacing: "-0.02em" }}>
            Aster<span style={{ color: C.primary }}>Path</span>
          </div>
        </Rise>
        <Rise delay={28}>
          <div style={{ fontFamily: display, fontSize: 120 * u, color: C.ink, lineHeight: 1.02, marginTop: 40 * u }}>Study in Italy,</div>
        </Rise>
        <Rise delay={38}>
          <div style={{ fontFamily: displayItalic, fontStyle: "italic", fontSize: 120 * u, color: C.primary, lineHeight: 1.1 }}>done properly.</div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
}

function MapScene() {
  const frame = useCurrentFrame();
  const { width, height, u, vertical } = useUnit();
  const map = useMemo(() => buildMap(width, height), [width, height]);
  const zoom = interpolate(frame, [125, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const k = 1 + (map.camera.scale - 1) * zoom;
  const tx = map.camera.x * zoom;
  const ty = map.camera.y * zoom;
  const overview = 1 - zoom;
  const detail = interpolate(frame, [175, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Scene duration={SCENES.map}>
      <AbsoluteFill>
        <svg width={width} height={height}>
          <g transform={`translate(${tx} ${ty}) scale(${k})`}>
            {map.countries.map((d, i) => (
              <path key={i} d={d} fill={C.land} stroke={C.border} strokeWidth={0.8 / k} />
            ))}
            <path d={map.india} fill={C.primarySoft} stroke={C.primary} strokeWidth={1.5 / k} />
            <path d={map.italy} fill="rgba(196,100,63,0.25)" stroke={C.terracotta} strokeWidth={1.5 / k} />
            <g opacity={detail}>
              {map.regions.map((d, i) => (
                <path key={i} d={d} fill="none" stroke={C.card} strokeWidth={1.4 / k} />
              ))}
            </g>
            <g opacity={overview}>
              {map.routes.map((r, i) => {
                const draw = interpolate(frame, [15 + i * 8, 95 + i * 8], [r.length, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
                return <path key={i} d={r.d} fill="none" stroke={C.primary} strokeWidth={3} strokeLinecap="round" strokeDasharray={r.length} strokeDashoffset={draw} />;
              })}
              {map.missions.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={7} fill={C.primary} stroke={C.card} strokeWidth={3} />
              ))}
            </g>
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          padding: `${(vertical ? 140 : 90) * u}px ${90 * u}px`,
          justifyContent: vertical ? "flex-start" : "flex-end",
          background: vertical ? `linear-gradient(to bottom, ${C.paper} 18%, rgba(248,245,238,0) 34%)` : undefined,
        }}
      >
        <div style={{ background: vertical ? "transparent" : "rgba(248,245,238,0.85)", borderRadius: 28 * u, padding: vertical ? 0 : `${36 * u}px ${44 * u}px`, alignSelf: vertical ? "flex-start" : "flex-end" }}>
          <Rise delay={8}>
            <div style={{ fontFamily: display, fontSize: 76 * u, color: C.ink, lineHeight: 1.05 }}>Four Italian missions in India.</div>
          </Rise>
          <Rise delay={130}>
            <div style={{ fontFamily: displayItalic, fontStyle: "italic", fontSize: 76 * u, color: C.terracotta, lineHeight: 1.15 }}>One destination.</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

const STAGES = ["Passport & documents", "English test", "Applications & enrolment", "Visa & documentation", "Arrival in Italy"];

function StagesScene() {
  const { u, vertical } = useUnit();
  return (
    <Scene duration={SCENES.stages}>
      <Glow />
      <AbsoluteFill style={{ padding: 100 * u, justifyContent: "center" }}>
        <Rise>
          <div style={{ fontFamily: display, fontSize: 92 * u, color: C.ink, lineHeight: 1.05 }}>
            Five stages. <span style={{ fontFamily: displayItalic, fontStyle: "italic", color: C.primary }}>Nothing left to chance.</span>
          </div>
        </Rise>
        <div style={{ display: "grid", gridTemplateColumns: vertical ? "1fr" : "repeat(5, 1fr)", gap: 24 * u, marginTop: 70 * u }}>
          {STAGES.map((title, i) => (
            <Rise key={title} delay={20 + i * 12}>
              <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 28 * u, padding: 34 * u, height: "100%" }}>
                <div style={{ fontFamily: display, fontSize: 72 * u, color: C.terracotta, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 34 * u, color: C.ink, marginTop: 24 * u, lineHeight: 1.25 }}>{title}</div>
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

const PRICES = [
  { name: "Admissions", price: "₹39,900" },
  { name: "Complete Journey", price: "₹99,000" },
  { name: "Complete + Arrival", price: "₹1,39,000" },
];

function PricingScene() {
  const { u, vertical } = useUnit();
  return (
    <Scene duration={SCENES.pricing}>
      <Glow />
      <AbsoluteFill style={{ padding: 100 * u, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Rise>
          <div style={{ fontFamily: display, fontSize: 100 * u, color: C.ink, lineHeight: 1.05 }}>Published prices.</div>
        </Rise>
        <Rise delay={10}>
          <div style={{ fontFamily: displayItalic, fontStyle: "italic", fontSize: 100 * u, color: C.primary, lineHeight: 1.15 }}>Paid in instalments.</div>
        </Rise>
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 28 * u, marginTop: 70 * u }}>
          {PRICES.map((p, i) => (
            <Rise key={p.name} delay={30 + i * 10}>
              <div style={{ background: i === 1 ? C.inverse : C.card, color: i === 1 ? C.onInverse : C.ink, border: `2px solid ${C.border}`, borderRadius: 28 * u, padding: `${32 * u}px ${48 * u}px`, minWidth: 380 * u }}>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30 * u, opacity: 0.8 }}>{p.name}</div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 66 * u, marginTop: 8 * u }}>
                  <span style={{ fontSize: 28 * u, fontWeight: 500, opacity: 0.7 }}>from </span>
                  {p.price}
                </div>
              </div>
            </Rise>
          ))}
        </div>
        <Rise delay={70}>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 30 * u, color: C.muted, marginTop: 50 * u }}>University application fees included · every exclusion listed</div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
}

function PromiseScene() {
  const { u } = useUnit();
  return (
    <Scene duration={SCENES.promise} background={C.inverse}>
      <AbsoluteFill style={{ background: "radial-gradient(55% 50% at 0% 100%, rgba(24,122,102,0.4), transparent 70%)" }} />
      <AbsoluteFill style={{ padding: 110 * u, justifyContent: "center" }}>
        <Rise>
          <div style={{ fontFamily: display, fontSize: 110 * u, color: C.onInverse, lineHeight: 1.05 }}>
            We don&rsquo;t disappear <span style={{ fontFamily: displayItalic, fontStyle: "italic", color: C.accentOnInverse }}>halfway.</span>
          </div>
        </Rise>
        {["One named advisor, start to finish", "Replies within one working day", "Everything agreed in writing"].map((line, i) => (
          <Rise key={line} delay={24 + i * 12}>
            <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 44 * u, color: C.onInverse, opacity: 0.85, marginTop: (i ? 18 : 60) * u }}>
              <span style={{ color: C.accentOnInverse }}>◆ </span>
              {line}
            </div>
          </Rise>
        ))}
      </AbsoluteFill>
    </Scene>
  );
}

function CtaScene() {
  const { u } = useUnit();
  return (
    <Scene duration={SCENES.cta}>
      <Glow />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 90 * u }}>
        <Rise>
          <Star size={110 * u} />
        </Rise>
        <Rise delay={8}>
          <div style={{ fontFamily: display, fontSize: 96 * u, color: C.ink, lineHeight: 1.08, marginTop: 40 * u }}>Book a free consultation.</div>
        </Rise>
        <Rise delay={18}>
          <div style={{ display: "inline-block", fontFamily: sans, fontWeight: 700, fontSize: 40 * u, color: "#fff", background: C.primary, borderRadius: 999, padding: `${22 * u}px ${48 * u}px`, marginTop: 50 * u }}>
            WhatsApp +39 333 110 4575
          </div>
        </Rise>
        <Rise delay={26}>
          <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 28 * u, color: C.muted, marginTop: 40 * u }}>
            AsterPath provides guidance and preparation support. Admission and visa decisions are made by universities and the Italian authorities.
          </div>
        </Rise>
      </AbsoluteFill>
    </Scene>
  );
}

export function Intro() {
  const order: [keyof typeof SCENES, () => ReactNode][] = [
    ["title", TitleScene],
    ["map", MapScene],
    ["stages", StagesScene],
    ["pricing", PricingScene],
    ["promise", PromiseScene],
    ["cta", CtaScene],
  ];
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {order.map(([key, Component]) => {
        const start = from;
        from += SCENES[key];
        return (
          <Sequence key={key} from={start} durationInFrames={SCENES[key]}>
            <Component />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
