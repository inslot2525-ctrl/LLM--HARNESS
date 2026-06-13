"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./Logo";

const LEFT = [
  { href: "/#analyze", label: "Analyze" },
  { href: "/#attack", label: "Attack" },
  { href: "/#score", label: "Score" },
];

export default function Navbar({ logoVisible = true }: { logoVisible?: boolean }) {
  const pathname = usePathname();

  const link = (href: string, label: string) => {
    const active = href === pathname;
    return (
      <Link
        key={href}
        href={href}
        className="nav-link"
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: 14.5,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: active ? "var(--ink)" : "var(--ink-2)",
          textDecoration: "none",
          transition: "color 0.2s ease",
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        padding: "14px 16px 0",
        pointerEvents: "none",
      }}
    >
      {/* floating liquid-glass island */}
      <div
        style={{
          pointerEvents: "auto",
          position: "relative",
          width: "100%",
          maxWidth: 920,
          height: 58,
          padding: "0 14px 0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(12,13,20,0.42)",
          backdropFilter: "url(#liquid-glass-displace) blur(18px) saturate(1.7)",
          WebkitBackdropFilter: "blur(18px) saturate(1.7)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,0.20), inset 0 0 0 1px rgba(255,255,255,0.04), 0 18px 50px -20px rgba(0,0,0,0.7)",
        }}
      >
        {/* left — section links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {LEFT.map((l) => link(l.href, l.label))}
        </nav>

        {/* centre — docked logo mark */}
        <Link
          href="/"
          aria-label="LLMHarness home"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            color: "var(--ink)",
            opacity: logoVisible ? 1 : 0,
            transition: "opacity 280ms ease",
            display: "inline-flex",
          }}
        >
          <LogoMark size={26} />
        </Link>

        {/* right — CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/harness" className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 14 }}>
            Launch
          </Link>
        </div>
      </div>
    </header>
  );
}
