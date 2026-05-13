import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <Section eyebrow="Contact" bound="wide">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Contact
      </h1>
      <p className="mt-4 text-muted-foreground">Page content pending.</p>
    </Section>
  );
}
