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
      {eyebrow && <p className={cn("eyebrow mb-5", align === "center" && "justify-center")}>{eyebrow}</p>}
      <Heading
        className={cn(
          "display text-ink",
          Heading === "h1" ? "text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl" : "text-[2.25rem] leading-[1.06] sm:text-5xl",
        )}
      >
        {title}
      </Heading>
      {description && <p className="mt-6 text-lg leading-relaxed text-muted">{description}</p>}
    </div>
  );
}
