import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, Eye, Handshake, LockKeyhole, MessageSquareText, Star } from "lucide-react";
import styles from "../content.module.css";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  ["1", "Create or find a listing", "Choose free, discounted or exchange. Public listings show the food, general area, quantity and expiry time."],
  ["2", "Send a structured request", "Orders and exchanges are stored in the database, so the provider can accept or reject a clear request."],
  ["3", "Collect or deliver safely", "Exact pickup details become available only to authorized participants after acceptance."],
  ["4", "Confirm completion", "Both parties confirm the handover. Only then does the review system unlock."],
];

export default function Page() {
  return (
    <main className="page">
      <div className="container stack">
        <section className={styles.hero} data-hero-item>
          <div className="pageIntro">
            <span className="badge badgeFree">Simple by design</span>
            <h1 className="sectionTitle">From surplus food to a second table.</h1>
            <p className="sectionLead">We Eat separates public discovery from private fulfilment details and keeps every request traceable.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="button buttonPrimary" href="/listings">Browse food <ArrowRight size={17} /></Link>
              <Link className="button buttonGhost" href="/share">Create a listing</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroVisualInner}>
              <div><Eye size={18} /> Public listing</div>
              <div><MessageSquareText size={18} /> Structured request</div>
              <div><LockKeyhole size={18} /> Private handover</div>
              <div><Star size={18} /> Verified review</div>
            </div>
          </div>
        </section>

        <section className="section" data-reveal>
          <span className="kicker">The full journey</span>
          <h2 className="sectionTitle" style={{ margin: "14px 0 30px" }}>Four steps, with clear responsibilities.</h2>
          <div className={styles.steps} data-stagger-grid>
            {steps.map(([number, title, description]) => (
              <article className={`card ${styles.step}`} key={number}>
                <div className={styles.stepNumber}>{number}</div>
                <h2>{title}</h2>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" data-reveal>
          <span className="kicker">Why the workflow matters</span>
          <h2 className="sectionTitle" style={{ margin: "14px 0 28px" }}>Designed to reduce ambiguity.</h2>
          <div className={styles.detailGrid} data-stagger-grid>
            <article className={`card ${styles.detailCard}`}><span className="iconBox"><ClipboardCheck /></span><h3>Explicit arrangements</h3><p>Free, discounted and exchange listings have different request fields, so users know what is expected before contacting a provider.</p></article>
            <article className={`card ${styles.detailCard}`}><span className="iconBox"><LockKeyhole /></span><h3>Private fulfilment</h3><p>Exact pickup information is stored separately and is not part of the public listing response.</p></article>
            <article className={`card ${styles.detailCard}`}><span className="iconBox"><Handshake /></span><h3>Two-party confirmation</h3><p>Completion is recorded before reviews unlock, reducing ratings from people who never completed a handover.</p></article>
          </div>
        </section>

        <section className="section" data-reveal>
          <span className="kicker">Common questions</span>
          <h2 className="sectionTitle" style={{ margin: "14px 0 28px" }}>Before you send a request.</h2>
          <div className={styles.faq}>
            <details><summary>Can anonymous visitors request food?</summary><p>No. Anyone can browse public listings, but an authenticated account is required to post, request, exchange, save or comment.</p></details>
            <details><summary>When is the exact address visible?</summary><p>Private collection details are intended for authorized participants after the provider accepts the request.</p></details>
            <details><summary>Can I review someone immediately?</summary><p>No. Reviews are linked to completed orders or exchanges, not casual profile visits or uncompleted requests.</p></details>
            <details><summary>What happens when a listing looks unsafe?</summary><p>Do not continue with the handover. Use the report action and follow the food-safety guidance before making any decision.</p></details>
          </div>
        </section>

        <div className="softPanel" data-reveal>
          <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}><CheckCircle2 size={23} /><div><strong>Ready to participate?</strong><p className="muted" style={{ marginBottom: 14 }}>Browse what is nearby or publish food with honest collection and safety details.</p><Link className="button buttonPrimary" href="/register">Join We Eat</Link></div></div>
        </div>
      </div>
    </main>
  );
}
