import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { z } from "zod";
import { Starfield } from "@/components/site/Starfield";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lumex" },
      {
        name: "description",
        content:
          "Trade, partner, and press routes into Lumex. Offices in Dubai, India, and the United States.",
      },
      { property: "og:title", content: "Contact — Lumex" },
      {
        property: "og:description",
        content:
          "Three contact lanes — trade, brand, press — plus offices in Dubai, India, and the United States.",
      },
      { property: "og:url", content: "https://lumexconstellation.com/contact" },
    ],
  }),
  component: ContactPage,
});

const MONO = { fontFamily: "var(--font-mono)" } as const;

const INQUIRY_TYPES = [
  "Trade & broker",
  "Brand & retail partnership",
  "Press & investor relations",
] as const;

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name must be under 100 characters."),
  company: z.string().trim().min(1, "Company is required.").max(150, "Company must be under 150 characters."),
  email: z.string().trim().email("Enter a valid email.").max(255, "Email must be under 255 characters."),
  inquiry: z.enum(INQUIRY_TYPES, { message: "Select an inquiry type." }),
  message: z.string().trim().min(1, "Message is required.").max(1000, "Message must be under 1000 characters."),
});

function ContactPage() {
  return (
    <div className="relative min-h-screen bg-[#070b18] text-[#e6ecf7]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <Starfield />
      </div>

      <div className="relative z-10">
        {/* 1. Hero */}
        <header className="px-6 pb-16 pt-32 md:px-10 md:pt-44">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase text-white/55" style={{ ...MONO, letterSpacing: "0.32em" }}>
              Contact · Lumex
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Talk to Lumex.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-white/70">
              Not a single inbox — three routes for three audiences. Trade, brand, and press each have their own desk below.
            </p>
          </div>
        </header>

        {/* 2. Three contact lanes */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs uppercase text-white/45" style={{ ...MONO, letterSpacing: "0.28em" }}>
              Routes
            </p>
            <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
              <Lane
                label="01 · Trade & broker"
                body="Inventory, listings, and clearing on the Lumex platform."
                email="trade@lumexgroup.com"
                cta={{ label: "Enter Lumex.online", href: "https://lumex.online", external: true }}
              />
              <Lane
                label="02 · Brand & retail"
                body="Wholesale, licensing, and partnership with the House."
                email="partners@lumexgroup.com"
                cta={{ label: "Open the partnership form", href: "#contact-form" }}
              />
              <Lane
                label="03 · Press & IR"
                body="Media, analyst, and investor inquiries."
                email="press@lumexgroup.com"
              />
            </div>
          </div>
        </section>

        {/* 3. Offices */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs uppercase text-white/45" style={{ ...MONO, letterSpacing: "0.28em" }}>
              Offices
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <Office
                tag="Headquarters"
                city="Dubai"
                address={["Lumex FZ-LLC", "[Building, Street]", "Dubai, United Arab Emirates"]}
                phone="+971 0 000 0000"
                email="dubai@lumexgroup.com"
              />
              <Office
                tag="Operations"
                city="India"
                address={["Lumex India Pvt. Ltd.", "[Building, Street]", "Mumbai, India"]}
                phone="+91 00 0000 0000"
                email="india@lumexgroup.com"
              />
              <Office
                tag="Presence"
                city="United States"
                address={["Lumex USA Inc.", "[Street]", "New York, NY"]}
                phone="+1 000 000 0000"
                email="us@lumexgroup.com"
              />
            </div>
          </div>
        </section>

        {/* 4. Form */}
        <ContactForm />

        {/* 5. Closer */}
        <section className="relative px-6 py-32 text-center md:px-10">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto flex max-w-md -translate-y-1/2 items-center justify-center px-12 opacity-40">
            <span className="block h-1.5 w-1.5 rounded-full bg-white/80" />
            <span className="block h-px flex-1 bg-gradient-to-r from-white/10 via-white/40 to-white/10" />
            <span className="block h-1.5 w-1.5 rounded-full bg-white/80" />
          </div>
          <p
            className="relative mx-auto max-w-3xl text-xl uppercase text-white md:text-2xl"
            style={{ ...MONO, letterSpacing: "0.32em" }}
          >
            Lumex — The Future.
          </p>
          <div className="relative mt-14 flex justify-center">
            <Link to="/" className="ghost-cta-contact">
              Return to the journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <style>{`
            .ghost-cta-contact {
              display: inline-flex; align-items: center; gap: 0.5rem;
              border: 1px solid rgba(255,255,255,0.25);
              padding: 0.7rem 1.1rem; font-size: 0.875rem;
              color: rgba(255,255,255,0.9); border-radius: 2px;
              transition: background-color .2s, border-color .2s;
            }
            .ghost-cta-contact:hover {
              background-color: rgba(255,255,255,0.06);
              border-color: rgba(255,255,255,0.55);
            }
          `}</style>
        </section>
      </div>
    </div>
  );
}

function Lane({
  label,
  body,
  email,
  cta,
}: {
  label: string;
  body: string;
  email: string;
  cta?: { label: string; href: string; external?: boolean };
}) {
  return (
    <div className="flex flex-col gap-6 bg-[#070b18] p-8">
      <p className="text-[11px] uppercase text-white/55" style={{ ...MONO, letterSpacing: "0.28em" }}>
        {label}
      </p>
      <p className="text-base text-white/80 md:text-lg">{body}</p>
      <div className="mt-auto flex flex-col gap-4">
        <a
          href={`mailto:${email}`}
          className="text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
        >
          {email}
        </a>
        {cta ? (
          <a
            href={cta.href}
            target={cta.external ? "_blank" : undefined}
            rel={cta.external ? "noopener noreferrer" : undefined}
            className="inline-flex w-fit items-center gap-2 border border-white/25 px-4 py-2 text-xs uppercase text-white/90 transition-colors hover:border-white/55 hover:bg-white/[0.06]"
            style={{ ...MONO, letterSpacing: "0.24em" }}
          >
            {cta.label}
            {cta.external ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Office({
  tag,
  city,
  address,
  phone,
  email,
}: {
  tag: string;
  city: string;
  address: string[];
  phone: string;
  email: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <p className="text-[11px] uppercase text-white/50" style={{ ...MONO, letterSpacing: "0.28em" }}>
        {tag}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{city}</p>
      <address className="mt-5 not-italic text-sm leading-relaxed text-white/70">
        {address.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </address>
      <div className="mt-5 space-y-1 text-sm">
        <div className="text-white/70">{phone}</div>
        <a
          href={`mailto:${email}`}
          className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
        >
          {email}
        </a>
      </div>
    </div>
  );
}

function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      name: fd.get("name"),
      company: fd.get("company"),
      email: fd.get("email"),
      inquiry: fd.get("inquiry"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "");
        if (k && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("submitting");
    // No backend wired; simulate dispatch.
    window.setTimeout(() => setStatus("sent"), 400);
  };

  return (
    <section
      id="contact-form"
      className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase text-white/45" style={{ ...MONO, letterSpacing: "0.28em" }}>
          Direct message
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-4xl">
          Send a message.
        </h2>

        {status === "sent" ? (
          <div className="mt-12 border border-white/15 bg-white/[0.03] p-8 text-white/85">
            <p className="text-base md:text-lg">Message received. Lumex will respond from the appropriate desk.</p>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field name="name" label="Name" error={errors.name} />
            <Field name="company" label="Company" error={errors.company} />
            <Field name="email" label="Email" type="email" error={errors.email} className="md:col-span-2" />

            <div className="md:col-span-2">
              <FieldLabel htmlFor="inquiry">Inquiry type</FieldLabel>
              <select
                id="inquiry"
                name="inquiry"
                defaultValue=""
                className="mt-2 w-full appearance-none border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-white outline-none transition-colors focus:border-white/55"
              >
                <option value="" disabled>Select…</option>
                {INQUIRY_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#070b18] text-white">
                    {t}
                  </option>
                ))}
              </select>
              {errors.inquiry ? <FieldError>{errors.inquiry}</FieldError> : null}
            </div>

            <div className="md:col-span-2">
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <textarea
                id="message"
                name="message"
                rows={5}
                maxLength={1000}
                className="mt-2 w-full resize-y border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-white outline-none transition-colors focus:border-white/55"
              />
              {errors.message ? <FieldError>{errors.message}</FieldError> : null}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center gap-2 border border-white/30 bg-white px-6 py-3 text-sm uppercase text-[#070b18] transition-colors hover:bg-white/90 disabled:opacity-60"
                style={{ ...MONO, letterSpacing: "0.28em" }}
              >
                {status === "submitting" ? "Sending…" : "Send"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        className="mt-2 w-full border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-white outline-none transition-colors focus:border-white/55"
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] uppercase text-white/55"
      style={{ ...MONO, letterSpacing: "0.24em" }}
    >
      {children}
    </label>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-red-300/90">{children}</p>;
}
