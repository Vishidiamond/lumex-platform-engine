import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Section eyebrow="Home" bound="wide">
      <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
        Project shell ready.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Navigation, footer, typography system, color tokens, and the reusable
        Section component are wired. Page content arrives on request.
      </p>
    </Section>
  );
}
