import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

// Three faces, all self-hosted: next/font inlines Google's files at build time
// and serves the local one from the app's own origin, so nothing asks the
// network at runtime. Measured, not assumed — Google serves Hanken Grotesk and
// IBM Plex Mono; Clash Display is exclusive to Fontshare (its Google CSS
// endpoint answers 400), so it is the one face carried as a committed .woff2.
export const clashDisplay = localFont({
  src: "./fonts/clash-display-600.woff2",
  weight: "600",
  display: "swap",
  variable: "--font-display",
});

// The body face. Its arrival is the point of the swap: the app used to set mono
// on <html> and read every number and every paragraph in JetBrains Mono.
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Kept for what mono is actually for: eyebrows, IDs, YYYY-MM dates, hex.
export const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});
