import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HandHeart,
  LockKeyhole,
  Repeat2,
  ShieldCheck,
  Tag,
  UserCheck,
} from "lucide-react";
import { HeroVisual } from "@/components/hero-visual";
import { ListingCard } from "@/components/listing-card";
import { backendFetch } from "@/lib/server-api";
import type { ListingBrowse } from "@/types";
import styles from "./home.module.css";

export default async function HomePage() {
  let recent: ListingBrowse = { items: [], total: 0, page: 1, page_size: 6, pages: 0 };
  try {
    recent = await backendFetch<ListingBrowse>("/listings?page_size=6");
  } catch {}

  return (
    <main>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow} data-hero-item>
              <HandHeart size={16} /> Community food, not food waste
            </span>
            <h1 className={styles.title} data-hero-item>
              Good food deserves a <span>second table.</span>
            </h1>
            <p className={styles.lead} data-hero-item>
              Share surplus meals for free, offer them at a fair discount, or
              exchange food with people nearby. We Eat keeps every step simple,
              local and accountable.
            </p>
            <div className={styles.actions} data-hero-item>
              <Link className="button buttonPrimary" href="/listings">
                Find food <ArrowRight size={18} />
              </Link>
              <Link className="button buttonCream" href="/share">
                Share surplus food
              </Link>
            </div>
            <div className={styles.trustRow} data-hero-item>
              <span><LockKeyhole size={16} /> Private pickup details</span>
              <span><UserCheck size={16} /> Verified accounts</span>
              <span><ShieldCheck size={16} /> Moderated reports</span>
            </div>
            <div className={styles.stats} data-hero-item>
              <div className={styles.stat}><strong>3 ways</strong><span className="muted">Free, discounted, exchange</span></div>
              <div className={styles.stat}><strong>Private</strong><span className="muted">Exact address stays protected</span></div>
              <div className={styles.stat}><strong>Trusted</strong><span className="muted">Reviews after completion</span></div>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="section" data-reveal>
        <div className="container">
          <span className="kicker">Flexible sharing</span>
          <h2 className="sectionTitle" style={{ marginTop: 14 }}>Choose how you want to help.</h2>
          <p className="sectionLead">
            The listing type is explicit, so everyone understands the arrangement
            before sending a request.
          </p>
          <div className={styles.featureGrid} data-stagger-grid>
            <article className={`card ${styles.feature}`}>
              <div className={styles.featureIcon} style={{ background: "var(--cream)" }}><HandHeart /></div>
              <h3>Give it free</h3>
              <p className="muted">Offer safe surplus food to a neighbour, volunteer group or family without payment.</p>
            </article>
            <article className={`card ${styles.feature}`}>
              <div className={styles.featureIcon} style={{ background: "var(--blue)" }}><Tag /></div>
              <h3>Discount the surplus</h3>
              <p className="muted">Recover part of the cost while helping good food get used before it expires.</p>
            </article>
            <article className={`card ${styles.feature}`}>
              <div className={styles.featureIcon} style={{ background: "var(--blue-strong)" }}><Repeat2 /></div>
              <h3>Exchange food</h3>
              <p className="muted">Trade one food item for another through a structured request and completion flow.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={`section ${styles.processSection}`} data-reveal>
        <div className="container">
          <span className="kicker">Simple workflow</span>
          <h2 className="sectionTitle" style={{ marginTop: 14 }}>From listing to handover in three clear steps.</h2>
          <div className={styles.processGrid}>
            <article className={styles.processCard}><span className={styles.processNumber}>1</span><h3>Discover or publish</h3><p>Browse public food information or create a listing with honest timing, ingredients and location details.</p></article>
            <article className={styles.processCard}><span className={styles.processNumber}>2</span><h3>Request and agree</h3><p>The provider reviews the request. Private collection details remain hidden until an arrangement is accepted.</p></article>
            <article className={styles.processCard}><span className={styles.processNumber}>3</span><h3>Complete and review</h3><p>Both people confirm the handover. A review becomes available only after the transaction is completed.</p></article>
          </div>
        </div>
      </section>

      <section className="section" data-reveal>
        <div className={`container ${styles.safetyBand}`}>
          <div>
            <span className="kicker">Designed for responsible sharing</span>
            <h2 className="sectionTitle" style={{ marginTop: 14 }}>Useful safeguards without unnecessary friction.</h2>
            <p className="sectionLead">Public discovery and private fulfilment are separated, while reports and reviews create accountability.</p>
            <Link className="button buttonGhost" href="/safety">Read safety guidance <ArrowRight size={17} /></Link>
          </div>
          <div className={styles.safetyList}>
            <div><CheckCircle2 size={20} /><span><strong>Public:</strong> food, general area, quantity and expiry time.</span></div>
            <div><CheckCircle2 size={20} /><span><strong>Private:</strong> exact pickup address and direct contact information.</span></div>
            <div><CheckCircle2 size={20} /><span><strong>Accountable:</strong> database-backed requests, reports and completion records.</span></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "rgba(255,248,222,.68)" }} data-reveal>
        <div className="container">
          <div className={styles.sectionHead}>
            <div><span className="kicker">Community feed</span><h2 className="sectionTitle" style={{ marginTop: 14 }}>Recently shared</h2><p className="sectionLead">Fresh listings from the community.</p></div>
            <Link className="button buttonGhost" href="/listings">View all</Link>
          </div>
          {recent.items.length ? (
            <div className="grid" data-stagger-grid>{recent.items.map((item) => <ListingCard key={item.id} listing={item} />)}</div>
          ) : (
            <div className="empty"><h3>No food has been listed yet.</h3><p className="muted">Be the first person to share something useful.</p><Link className="button buttonPrimary" href="/share">Create a listing</Link></div>
          )}
        </div>
      </section>

      <section className="section" data-reveal>
        <div className={`container ${styles.cta}`}>
          <div><h2>Have safe surplus food today?</h2><p>Publish a clear listing in a few minutes and choose whether to give it free, discount it or exchange it.</p></div>
          <div className={styles.ctaActions}><Link className="button buttonCream" href="/share">Share food</Link><Link className="button buttonGhost" href="/how-it-works">See the process</Link></div>
        </div>
      </section>
    </main>
  );
}
