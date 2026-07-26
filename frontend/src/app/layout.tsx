import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionShell } from "@/components/motion-shell";

export const metadata: Metadata = {
  title: { default: "We Eat — Share food, reduce waste", template: "%s | We Eat" },
  description: "Share, discount, exchange and rescue surplus food in your community.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/logo.svg?v=132", type: "image/svg+xml" }],
    shortcut: [{ url: "/logo.svg?v=132", type: "image/svg+xml" }],
    apple: [{ url: "/logo.svg?v=132", type: "image/svg+xml" }],
  },
};

const themeBoot = `(function(){try{var saved=localStorage.getItem('we-eat-theme');var system=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=saved||system;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body>
        <SiteHeader />
        <MotionShell>{children}<SiteFooter /></MotionShell>
        <Toaster richColors position="top-center" theme="system" />
      </body>
    </html>
  );
}
