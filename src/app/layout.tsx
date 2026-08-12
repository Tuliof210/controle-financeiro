import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell/index.tsx";
import { jetBrainsMono, pressStart2P } from "@/styles/fonts.ts";
import "@/styles/globals.scss";

const THEME_INIT = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "Monevo",
    template: "%s · Monevo",
  },
  description: "Controle financeiro pessoal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`${pressStart2P.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: pre-paint theme init to avoid FOUC */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
