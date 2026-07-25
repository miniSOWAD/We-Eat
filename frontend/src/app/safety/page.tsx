import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  PackageCheck,
  ShieldAlert,
  Snowflake,
  ThermometerSun,
  type LucideIcon,
} from "lucide-react";
import styles from "../content.module.css";

export const metadata: Metadata = { title: "Food safety" };

type SafetyRule = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const rules: SafetyRule[] = [
  { icon: Eye, title: "Describe food honestly", description: "State ingredients, preparation time, storage history, condition and allergens accurately." },
  { icon: PackageCheck, title: "Use clean packaging", description: "Use food-safe containers that close properly and protect the food during the handover." },
  { icon: ThermometerSun, title: "Control temperature", description: "Keep hot food hot and chilled food cold. Avoid long periods at unsafe room temperature." },
  { icon: Clock3, title: "Set a realistic deadline", description: "Use a clear collect-before time and remove food that is no longer suitable to share." },
  { icon: ShieldAlert, title: "Keep addresses private", description: "Never publish an exact home address in a title, description, image or public comment." },
  { icon: AlertTriangle, title: "Report unsafe conduct", description: "Do not proceed when information conflicts, food appears spoiled or the interaction becomes suspicious." },
];

export default function Page() {
  return (
    <main className="page">
      <div className="container stack">
        <section className={styles.hero} data-hero-item>
          <div className="pageIntro">
            <span className="badge badgeExchange">Safety first</span>
            <h1 className="sectionTitle">Food sharing requires honest information and sensible judgement.</h1>
            <p className="sectionLead">We Eat provides workflow controls, but providers and recipients remain responsible for deciding whether food is safe to offer, transport and consume.</p>
            <Link className="button buttonGhost" href="/listings">Browse current listings</Link>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroVisualInner}>
              <div><Snowflake size={18} /> Keep cold food cold</div>
              <div><ThermometerSun size={18} /> Keep hot food hot</div>
              <div><PackageCheck size={18} /> Use safe packaging</div>
              <div><AlertTriangle size={18} /> Stop when uncertain</div>
            </div>
          </div>
        </section>

        <section className="section" data-reveal>
          <span className="kicker">Community checklist</span>
          <h2 className="sectionTitle" style={{ margin: "14px 0 30px" }}>Six rules before every handover.</h2>
          <div className={styles.ruleGrid} data-stagger-grid>
            {rules.map(({ icon: Icon, title, description }) => (
              <article className={`card ${styles.rule}`} key={title}>
                <span className={styles.ruleIcon}><Icon size={21} /></span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" data-reveal>
          <div className={styles.warning}>
            <h2>Do not proceed when</h2>
            <p>The food smells unusual, packaging is damaged, storage history is unclear, temperature control has failed, or the provider’s description conflicts with what you see.</p>
            <p><strong>When in doubt, do not consume it.</strong> A low price or free offer is not a reason to accept avoidable risk.</p>
          </div>
        </section>

        <section className="section" data-reveal>
          <div className="twoColumn">
            <div>
              <span className="kicker">Provider responsibilities</span>
              <h2 className="sectionTitle" style={{ marginTop: 14 }}>Before publishing.</h2>
              <div className={styles.checklist}>
                <div><CheckCircle2 size={19} /> Use recent photos that represent the actual food.</div>
                <div><CheckCircle2 size={19} /> Mention common allergens and any uncertainty you have.</div>
                <div><CheckCircle2 size={19} /> Choose an expiry or collect-before time conservatively.</div>
                <div><CheckCircle2 size={19} /> Remove the listing when the food is unavailable or no longer safe.</div>
              </div>
            </div>
            <div>
              <span className="kicker">Recipient responsibilities</span>
              <h2 className="sectionTitle" style={{ marginTop: 14 }}>Before accepting.</h2>
              <div className={styles.checklist}>
                <div><CheckCircle2 size={19} /> Read the description, timing and allergen information.</div>
                <div><CheckCircle2 size={19} /> Ask relevant questions before travelling.</div>
                <div><CheckCircle2 size={19} /> Inspect the food and packaging at handover.</div>
                <div><CheckCircle2 size={19} /> Store or consume the food promptly and appropriately.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
