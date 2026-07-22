import { AppShell } from "@/components/AppShell";
import { jetBrainsMono, pressStart2P } from "@/styles/fonts";
import "@/styles/globals.scss";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
