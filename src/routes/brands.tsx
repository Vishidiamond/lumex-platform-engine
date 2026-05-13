import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  return (
    <Section eyebrow="Brands" bound="wide">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Brands
      </h1>
      <p className="mt-4 text-muted-foreground">Page content pending.</p>
    </Section>
  );
}
