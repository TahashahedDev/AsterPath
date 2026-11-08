import type { CountrySlug } from "@/content/countries";
import { cn } from "@/lib/utils";

type FlagCode = CountrySlug | "india";

/** Simplified national flags drawn as SVG (no external assets). India's chakra is rendered as a simple wheel. */
const stripes: Record<Exclude<FlagCode, "india">, { direction: "vertical" | "horizontal"; colors: [string, string, string] }> = {
  italy: { direction: "vertical", colors: ["#009246", "#f4f5f0", "#ce2b37"] },
  france: { direction: "vertical", colors: ["#002395", "#f4f5f0", "#ed2939"] },
  germany: { direction: "horizontal", colors: ["#000000", "#dd0000", "#ffce00"] },
};

export function Flag({ code, className, label }: { code: FlagCode; className?: string; label?: string }) {
  return (
    <span className={cn("flag inline-block overflow-hidden rounded-[3px] ring-1 ring-ink/10", className)} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 30 20" className="block size-full" preserveAspectRatio="none">
        {code === "india" ? (
          <>
            <rect width="30" height="6.67" fill="#ff9933" />
            <rect y="6.67" width="30" height="6.67" fill="#f4f5f0" />
            <rect y="13.33" width="30" height="6.67" fill="#138808" />
            <circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" strokeWidth="0.5" />
          </>
        ) : stripes[code].direction === "vertical" ? (
          stripes[code].colors.map((color, i) => <rect key={color} x={i * 10} width="10" height="20" fill={color} />)
        ) : (
          stripes[code].colors.map((color, i) => <rect key={color} y={i * 6.67} width="30" height="6.67" fill={color} />)
        )}
      </svg>
    </span>
  );
}
