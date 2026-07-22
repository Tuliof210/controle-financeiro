import { AppShell } from "@/components/AppShell";
import { jetBrainsMono, pressStart2P } from "@/styles/fonts";
import "@/styles/globals.scss";

const THEME_INIT = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
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
