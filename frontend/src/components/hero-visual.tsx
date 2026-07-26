"use client";

import { useRef } from "react";
import { Clock3, MapPin, ShieldCheck, HandHeart } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./hero-visual.module.css";

gsap.registerPlugin(useGSAP);

export function HeroVisual() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const entrance = gsap.timeline({ defaults: { ease: "power4.out" } });
      entrance
        .from("[data-phone]", { y: 34, scale: 0.93, rotation: -5, autoAlpha: 0, duration: 1 })
        .from("[data-float]", { scale: 0.72, autoAlpha: 0, duration: 0.68, stagger: 0.14 }, "-=0.48");

      gsap.to("[data-phone]", {
        y: -7,
        rotation: 0.8,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-float='one']", {
        y: -12,
        x: 4,
        rotation: -1.8,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-float='two']", {
        y: 10,
        x: -3,
        rotation: 1.4,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-pulse]", {
        scale: 1.12,
        opacity: 0.62,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className={styles.wrap} aria-label="We Eat mobile listing preview" data-hero-item data-parallax>
      <div className={styles.orbOne} data-pulse />
      <div className={styles.orbTwo} data-pulse />

      <div className={styles.phone} data-phone>
        <div className={styles.phoneTop}>
          <div>
            <span className={styles.micro}>Nearby now</span>
            <strong>Fresh food around you</strong>
          </div>
          <span className={styles.avatar}>W</span>
        </div>

        <div className={styles.foodImage}>
          <span className={styles.foodEmoji}>🍱</span>
          <span className="badge badgeFree">FREE</span>
        </div>

        <div className={styles.foodBody}>
          <div className={styles.titleRow}>
            <div>
              <h3>Homemade lunch box</h3>
              <p><MapPin size={14} /> Dhanmondi, Dhaka</p>
            </div>
            <span className={styles.save}>♡</span>
          </div>
          <div className={styles.infoRow}>
            <span><Clock3 size={14} /> Collect by 7:30 PM</span>
            <span>2 portions</span>
          </div>
          <button type="button" tabIndex={-1}>Request food</button>
        </div>
      </div>

      <div className={`${styles.floatCard} ${styles.safe}`} data-float="one">
        <span className={styles.floatIcon}><ShieldCheck size={19} /></span>
        <div><strong>Private pickup</strong><small>Shown after acceptance</small></div>
      </div>

      <div className={`${styles.floatCard} ${styles.types}`} data-float="two">
        <span className={styles.floatIcon}><HandHeart size={19} /></span>
        <div><strong>3 ways to share</strong><small>Free · Discount · Exchange</small></div>
      </div>
    </div>
  );
}
