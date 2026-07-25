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
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <MotionShell>
          {children}
          <SiteFooter />
        </MotionShell>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
