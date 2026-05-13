import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background tone */
  tone?: "default" | "ice" | "navy";
  /** Removes default vertical padding */
  flush?: boolean;
  /** Eyebrow label rendered above children */
  eyebrow?: string;
  /** Container max width */
  bound?: "default" | "wide" | "narrow" | "full";
}

const toneClass: Record<NonNullable<SectionProps["tone"]>, string> = {
  default: "bg-background text-foreground",
  ice: "bg-ice text-foreground",
  navy: "bg-navy-deep text-primary-foreground",
};

const boundClass: Record<NonNullable<SectionProps["bound"]>, string> = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-4xl",
  full: "max-w-none",
};

/**
 * Reusable page section. Hard grid, generous whitespace, left-aligned by default.
 * Use `eyebrow` for the small mono label above headlines.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { tone = "default", flush = false, eyebrow, bound = "default", className, children, ...rest },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cn(
        toneClass[tone],
        !flush && "py-20 md:py-28",
        "border-b border-border/60",
        className,
      )}
      {...rest}
    >
      <div className={cn("mx-auto px-6 md:px-10", boundClass[bound])}>
        {eyebrow ? <p className="eyebrow mb-6">{eyebrow}</p> : null}
        {children}
      </div>
    </section>
  );
});
