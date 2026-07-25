"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function MotionShell({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion) {
        gsap.set(root.querySelectorAll("[data-hero-item], [data-reveal]"), {
          clearProps: "all",
        });
        return;
      }

      gsap.fromTo(
        root,
        { opacity: 0.72 },
        { opacity: 1, duration: 0.32, ease: "power2.out" },
      );

      const heroItems = gsap.utils.toArray<HTMLElement>(
        "[data-hero-item]",
        root,
      );
      if (heroItems.length) {
        gsap.fromTo(
          heroItems,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.09,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          },
        );
      }

      const revealItems = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        root,
      );

      revealItems.forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 30, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.66,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
            scrollTrigger: {
              trigger: element,
              start: "top 91%",
              once: true,
            },
          },
        );
      });

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-stagger-grid] > .card, [data-stagger-grid] > a.card",
        root,
      );
      if (cards.length) {
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.58,
                stagger: 0.07,
                ease: "power3.out",
                clearProps: "transform,opacity,visibility",
              },
            ),
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className="motionShell">
      {children}
    </div>
  );
}
