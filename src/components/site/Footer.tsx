import { Link } from "@tanstack/react-router";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/press", label: "Press" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Divisions",
    links: [
      { to: "/diamonds", label: "Loose Diamonds" },
      { to: "/jewelry", label: "Jewelry" },
      { to: "/house", label: "Brands" },
      { to: "/technology", label: "AI & Technology" },
    ],
  },
  {
    title: "Platform",
    links: [
      { to: "/platform", label: "Lumex.online" },
      { to: "/technology", label: "NSphere" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold tracking-tight">Lumex</p>
            <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
              Owned IP. Owned rails. Owned brands.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow !text-primary-foreground/60">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Lumex Group. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.18em]">Lumex — The Future.</p>
        </div>
      </div>
    </footer>
  );
}
