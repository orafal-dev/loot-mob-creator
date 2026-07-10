import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loot Mob Creator",
  description: "Loot creator for OTS based on Canary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden antialiased">
      <body className="h-full overflow-hidden bg-zinc-950 font-sans text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
