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

      gsap.defaults({ overwrite: "auto" });

      const routeTimeline = gsap.timeline();
      routeTimeline.fromTo(
        root,
        { autoAlpha: 0, y: 10, filter: "blur(7px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.62,
          ease: "power3.out",
          clearProps: "transform,filter,opacity,visibility",
        },
      );

      const heroItems = gsap.utils.toArray<HTMLElement>(
        "[data-hero-item]",
        root,
      );
      if (heroItems.length) {
        gsap.fromTo(
          heroItems,
          {
            autoAlpha: 0,
            y: 42,
            scale: 0.975,
            rotateX: 4,
            transformOrigin: "50% 100%",
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.92,
            stagger: 0.1,
            ease: "power4.out",
            clearProps: "transform,opacity,visibility",
          },
        );
      }

      const revealItems = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        root,
      );

      ScrollTrigger.batch(revealItems, {
        start: "top 90%",
        once: true,
        interval: 0.08,
        batchMax: 4,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            {
              autoAlpha: 0,
              y: 54,
              scale: 0.975,
              filter: "blur(8px)",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.9,
              stagger: 0.1,
              ease: "power4.out",
              clearProps: "transform,filter,opacity,visibility",
            },
          ),
      });

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-stagger-grid] > .card, [data-stagger-grid] > a, [data-stagger-grid] > article",
        root,
      );
      if (cards.length) {
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          interval: 0.08,
          batchMax: 6,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 38, scale: 0.96, rotateX: 3 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.82,
                stagger: 0.085,
                ease: "back.out(1.25)",
                clearProps: "transform,opacity,visibility",
              },
            ),
        });
      }

      const hoverTargets = gsap.utils.toArray<HTMLElement>(
        ".button, .quickLink, [data-gsap-hover]",
        root,
      );
      const cleanups: Array<() => void> = [];

      hoverTargets.forEach((element) => {
        const onEnter = () =>
          gsap.to(element, {
            y: -4,
            scale: 1.012,
            duration: 0.28,
            ease: "power2.out",
          });
        const onLeave = () =>
          gsap.to(element, {
            y: 0,
            scale: 1,
            duration: 0.38,
            ease: "elastic.out(1, 0.55)",
            clearProps: "transform",
          });
        const onDown = () =>
          gsap.to(element, { scale: 0.975, duration: 0.12, ease: "power2.out" });
        const onUp = () =>
          gsap.to(element, { scale: 1.012, duration: 0.2, ease: "power2.out" });

        element.addEventListener("pointerenter", onEnter);
        element.addEventListener("pointerleave", onLeave);
        element.addEventListener("pointerdown", onDown);
        element.addEventListener("pointerup", onUp);

        cleanups.push(() => {
          element.removeEventListener("pointerenter", onEnter);
          element.removeEventListener("pointerleave", onLeave);
          element.removeEventListener("pointerdown", onDown);
          element.removeEventListener("pointerup", onUp);
        });
      });

      const parallaxItems = gsap.utils.toArray<HTMLElement>(
        "[data-parallax]",
        root,
      );
      parallaxItems.forEach((element) => {
        gsap.to(element, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        });
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className="motionShell">
      {children}
    </div>
  );
}
