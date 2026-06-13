import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import { LiquidGlassFilter } from "@/components/LiquidGlass";

/* The whole site runs on Recursive (variable). One family for everything:
   linear sans for display + body, and its MONO axis (set in CSS) for the
   technical labels and code. globals.css aliases the other --font-* vars to
   this one. */
const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-sans",
  axes: ["MONO", "CASL", "slnt"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LLMHarness · Adversarial testing for language models",
  description:
    "A red-team harness for LLMs. Analyze a prompt's intent, generate targeted attacks, and score how your model breaks with a multi-signal composite.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={recursive.variable}>
        <LiquidGlassFilter />
        {children}
      </body>
    </html>
  );
}
