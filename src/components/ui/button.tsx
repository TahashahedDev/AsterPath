import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary:
    "btn-sheen bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))] text-on-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_10px_24px_-12px_var(--color-primary)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_0_0_4px_color-mix(in_oklab,var(--color-gold)_22%,transparent),0_16px_34px_-12px_var(--color-primary)] hover:-translate-y-0.5",
  secondary: "btn-fill bg-card text-ink ring-1 ring-border-strong hover:text-primary-deep hover:ring-primary/40",
  ghost: "text-ink hover:bg-ink/5",
  dark: "bg-ink text-paper hover:bg-ink-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
};

export function buttonStyles({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type StyleProps = { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />;
}

/** For off-site links such as WhatsApp — always opens safely in a new tab. */
export function ExternalButtonLink({ variant, size, className, children, ...props }: ComponentProps<"a"> & StyleProps) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant, size, className })} {...props}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
