"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

let entrancePlayedForThisPageLoad = false;

export function MotionShell({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const entranceTargets = gsap.utils.toArray<HTMLElement>(
        "[data-hero-item], [data-reveal], [data-stagger-grid] > .card, [data-stagger-grid] > a, [data-stagger-grid] > article",
        root,
      );

      if (reducedMotion || entrancePlayedForThisPageLoad) {
        gsap.set([root, ...entranceTargets], { clearProps: "all" });
      } else {
        const uniqueTargets = Array.from(new Set(entranceTargets));
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            entrancePlayedForThisPageLoad = true;
            gsap.set([root, ...uniqueTargets], {
              clearProps: "transform,filter,opacity,visibility",
            });
          },
        });

        timeline
          .fromTo(
            root,
            { autoAlpha: 0, filter: "blur(8px)" },
            { autoAlpha: 1, filter: "blur(0px)", duration: 0.48 },
          )
          .fromTo(
            uniqueTargets,
            {
              autoAlpha: 0,
              y: 34,
              scale: 0.985,
              filter: "blur(5px)",
              transformOrigin: "50% 70%",
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.72,
              stagger: { each: 0.035, from: "start" },
              ease: "power4.out",
            },
            0.08,
          );
      }

      const hoverTargets = gsap.utils.toArray<HTMLElement>(
        ".button, .quickLink, [data-gsap-hover]",
        root,
      );
      const cleanups: Array<() => void> = [];

      hoverTargets.forEach((element) => {
        const onEnter = () => gsap.to(element, { y: -3, scale: 1.008, duration: 0.22, ease: "power2.out" });
        const onLeave = () => gsap.to(element, { y: 0, scale: 1, duration: 0.32, ease: "power3.out", clearProps: "transform" });
        const onDown = () => gsap.to(element, { scale: 0.98, duration: 0.1, ease: "power2.out" });
        const onUp = () => gsap.to(element, { scale: 1.008, duration: 0.16, ease: "power2.out" });

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

      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  return <div ref={scope} className="motionShell">{children}</div>;
}
