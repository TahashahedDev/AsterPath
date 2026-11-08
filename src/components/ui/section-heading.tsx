import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Heading
        className={cn(
          "font-semibold tracking-[-0.025em] text-ink",
          Heading === "h1" ? "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" : "text-3xl leading-[1.1] sm:text-4xl",
        )}
      >
        {title}
      </Heading>
      {description && <p className="mt-5 text-lg leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
