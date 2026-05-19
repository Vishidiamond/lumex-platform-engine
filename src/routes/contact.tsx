import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lumex" },
      {
        name: "description",
        content: "Trade, partner, and press routes into Lumex. Offices in Dubai, India, and the U.S.",
      },
    ],
  }),
  component: ContactPage,
});

const INQUIRY_TYPES = ["Trade & broker", "Brand & retail partnership", "Press & investor relations"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  company: z.string().trim().min(1, "Company is required.").max(150),
  email: z.string().trim().email("Enter a valid email.").max(255),
  inquiry: z.enum(INQUIRY_TYPES, { message: "Select an inquiry type." }),
  message: z.string().trim().min(1, "Message is required.").max(1000),
});

function ContactPage() {
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
    window.setTimeout(() => setStatus("sent"), 400);
  };

  return (
    <div className="text-[#e6ecf7]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        Contact · Lumex
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Talk to Lumex.
      </h1>
      <p className="mt-6 text-base text-white/75">
        Three routes for three audiences.
      </p>

      <section className="mt-10 space-y-6 border-t border-white/15 pt-8">
        <Lane label="01 · Trade & broker" body="Inventory, listings, and clearing on Lumex.online." email="trade@lumexgroup.com" />
        <Lane label="02 · Brand & retail" body="Wholesale, licensing, and partnership with the House." email="partners@lumexgroup.com" />
        <Lane label="03 · Press & IR" body="Media, analyst, and investor inquiries." email="press@lumexgroup.com" />
      </section>

      <section className="mt-10 border-t border-white/15 pt-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 font-mono mb-4">
          Send a message
        </p>
        {status === "sent" ? (
          <div className="border border-white/15 bg-white/[0.03] p-5 text-white/85 text-sm">
            Message received. Lumex will respond from the appropriate desk.
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="space-y-4">
            <Field name="name" label="Name" error={errors.name} />
            <Field name="company" label="Company" error={errors.company} />
            <Field name="email" label="Email" type="email" error={errors.email} />
            <div>
              <Label htmlFor="inquiry">Inquiry type</Label>
              <select
                id="inquiry"
                name="inquiry"
                defaultValue=""
                className="mt-2 w-full appearance-none border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/55"
              >
                <option value="" disabled>Select…</option>
                {INQUIRY_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#070b18] text-white">{t}</option>
                ))}
              </select>
              {errors.inquiry ? <Err>{errors.inquiry}</Err> : null}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={1000}
                className="mt-2 w-full resize-y border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/55"
              />
              {errors.message ? <Err>{errors.message}</Err> : null}
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center gap-2 bg-white text-[#070b18] px-5 py-3 text-xs font-mono uppercase tracking-[0.24em] hover:bg-white/90 disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function Lane({ label, body, email }: { label: string; body: string; email: string }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">{label}</p>
      <p className="mt-2 text-sm text-white/80">{body}</p>
      <a
        href={`mailto:${email}`}
        className="mt-2 inline-block text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
      >
        {email}
      </a>
    </div>
  );
}

function Field({ name, label, type = "text", error }: { name: string; label: string; type?: string; error?: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        className="mt-2 w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-white/55"
      />
      {error ? <Err>{error}</Err> : null}
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono">
      {children}
    </label>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-red-300/90">{children}</p>;
}
