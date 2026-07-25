import Link from "next/link";
import { ArrowRight, HandHeart, Repeat2, Tag } from "lucide-react";
import { HeroVisual } from "@/components/hero-visual";
import { ListingCard } from "@/components/listing-card";
import { backendFetch } from "@/lib/server-api";
import type { ListingBrowse } from "@/types";
import styles from "./home.module.css";

export default async function HomePage(){
  let recent: ListingBrowse = {items:[],total:0,page:1,page_size:6,pages:0};
  try { recent = await backendFetch<ListingBrowse>("/listings?page_size=6"); } catch {}
  return <main>
    <section className={styles.hero}><div className={`container ${styles.heroGrid}`}>
      <div>
        <span className={styles.eyebrow}>Community food, not food waste</span>
        <h1 className={styles.title}>Good food deserves a <span>second table.</span></h1>
        <p className={styles.lead}>Share surplus meals for free, offer them at a fair discount, or exchange food with people nearby. We Eat keeps the process simple, local and accountable.</p>
        <div className={styles.actions}><Link className="button buttonPrimary" href="/listings">Find food <ArrowRight size={18}/></Link><Link className="button buttonCream" href="/share">Share surplus food</Link></div>
        <div className={styles.stats}><div className={styles.stat}><strong>3 ways</strong><span className="muted">Free, discounted, exchange</span></div><div className={styles.stat}><strong>Private</strong><span className="muted">Pickup address protected</span></div><div className={styles.stat}><strong>Trusted</strong><span className="muted">Reviews after completion</span></div></div>
      </div><HeroVisual/>
    </div></section>

    <section className="section"><div className="container">
      <h2 className="sectionTitle">Choose how you want to help.</h2><p className="sectionLead">The listing type is explicit, so everyone understands the arrangement before sending a request.</p>
      <div className={styles.featureGrid}>
        <article className={`card ${styles.feature}`}><div className={styles.featureIcon} style={{background:"var(--cream)"}}><HandHeart/></div><h3>Give it free</h3><p className="muted">Offer safe surplus food to a neighbour, volunteer group or family without payment.</p></article>
        <article className={`card ${styles.feature}`}><div className={styles.featureIcon} style={{background:"var(--blue)"}}><Tag/></div><h3>Discount the surplus</h3><p className="muted">Recover part of the cost while helping good food get used before it expires.</p></article>
        <article className={`card ${styles.feature}`}><div className={styles.featureIcon} style={{background:"var(--blue-strong)"}}><Repeat2/></div><h3>Exchange food</h3><p className="muted">Trade one food item for another through a structured request and completion flow.</p></article>
      </div>
    </div></section>

    <section className="section" style={{background:"var(--cream-soft)"}}><div className="container">
      <div className={styles.sectionHead}><div><h2 className="sectionTitle">Recently shared</h2><p className="sectionLead">Fresh listings from the community.</p></div><Link className="button buttonGhost" href="/listings">View all</Link></div>
      {recent.items.length ? <div className="grid">{recent.items.map(item=><ListingCard key={item.id} listing={item}/>)}</div> : <div className="empty"><h3>No food has been listed yet.</h3><p className="muted">Be the first person to share something useful.</p><Link className="button buttonPrimary" href="/share">Create a listing</Link></div>}
    </div></section>
  </main>;
}
