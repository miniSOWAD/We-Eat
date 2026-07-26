import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Leaf, MapPin, PackageCheck, ShieldCheck, UsersRound } from "lucide-react";
import { ListingTypeBadge } from "@/components/listing-card";
import { ListingActions } from "@/components/listing-actions";
import { ProposalList } from "@/components/proposal-list";
import { Comments } from "@/components/comments";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Comment, Listing, Proposal } from "@/types";
import styles from "./detail.module.css";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await backendFetch<Listing>(`/listings/${id}`);
    return { title: item.title, description: item.description?.slice(0, 155) };
  } catch {
    return { title: "Listing" };
  }
}

function statusLabel(status: Listing["status"]): string {
  if (status === "RESERVED") return "BID IN PROGRESS";
  return status;
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [token, user] = await Promise.all([getToken(), getSession()]);
  const listing = await backendFetch<Listing>(`/listings/${id}`, {}, token).catch(() => null);
  if (!listing) return notFound();

  let comments: Comment[] = [];
  let proposals: Proposal[] = [];
  const own = user?.id === listing.owner.id;
  try { comments = await backendFetch<Comment[]>(`/listings/${id}/comments`); } catch {}
  if (own) {
    try { proposals = await backendFetch<Proposal[]>(`/proposals/listing/${id}`, {}, token); } catch {}
  }

  const image = listing.images?.[0]?.secure_url;
  const offer = listing.listing_type === "FREE"
    ? "Free"
    : listing.listing_type === "DISCOUNTED"
      ? `${Number(listing.discounted_price ?? 0).toLocaleString("en-BD")} BDT`
      : "Exchange";

  return (
    <main className="page">
      <div className="container stack">
        <Link className={styles.backLink} href="/listings" data-hero-item><ArrowLeft size={16} /> Back to food listings</Link>
        <div className="twoColumn">
          <section className="stack">
            <div className={styles.gallery} data-hero-item>
              <div className={styles.heroImage}>
                {image ? <Image src={image} alt={listing.title} fill priority sizes="(max-width:900px) 100vw, 65vw" /> : <div className={styles.placeholder}>🍲</div>}
              </div>
            </div>

            <article className={`card ${styles.content}`} data-reveal>
              <div className={styles.badgeRow}>
                <ListingTypeBadge type={listing.listing_type} />
                {listing.status === "RESERVED" && <span className="badge badgeDiscounted">Bid in progress</span>}
              </div>
              <h1 className={styles.title}>{listing.title}</h1>
              <p className="sectionLead" style={{ maxWidth: "none" }}>{listing.description}</p>
              <div className={styles.infoGrid}>
                <div className={styles.info}><strong><MapPin size={16} /> General area</strong><div className="muted">{listing.area}, {listing.city}</div></div>
                <div className={styles.info}><strong><Clock3 size={16} /> Collect before</strong><div className="muted">{new Date(listing.expires_at).toLocaleString("en-BD")}</div></div>
                <div className={styles.info}><strong><PackageCheck size={16} /> Quantity</strong><div className="muted">{listing.quantity} {listing.unit}</div></div>
                <div className={styles.info}><strong><Leaf size={16} /> Food information</strong><div className="muted">{listing.is_vegetarian ? "Vegetarian" : "Not marked vegetarian"}</div></div>
              </div>
              <div className={styles.extraInfo}>
                {listing.allergens && <p><strong>Allergens:</strong> {listing.allergens}</p>}
                {listing.exchange_for && <p><strong>Requested exchange:</strong> {listing.exchange_for}</p>}
              </div>
            </article>
            <div data-reveal><Comments listingId={listing.id} initialComments={comments} signedIn={Boolean(user)} /></div>
          </section>

          <aside className={styles.asideStack} data-hero-item>
            <div className={`card ${styles.sidebar}`}>
              <div className={styles.owner}>
                <div className={styles.avatar}>{listing.owner.avatar_url ? <Image src={listing.owner.avatar_url} alt="" fill sizes="50px" /> : listing.owner.display_name.slice(0,2).toUpperCase()}</div>
                <div><strong>{listing.owner.display_name}</strong><div className="muted">Community provider</div></div>
              </div>
              <hr className="divider" />
              <div className={styles.offer}>
                <strong>{offer}</strong>
                <div className={styles.statusLine}>
                  <span className={`badge ${listing.status === "RESERVED" ? "badgeDiscounted" : "badgeMuted"}`}>{statusLabel(listing.status)}</span>
                  {!own && listing.status === "ACTIVE" && <span className={styles.proposalCount}><UsersRound size={15} /> {listing.proposal_count} proposal{listing.proposal_count === 1 ? "" : "s"}</span>}
                </div>
              </div>
              <hr className="divider" />
              <ListingActions listing={listing} user={user} />
              <div className={styles.trustNote}><ShieldCheck size={22} /><span>Pickup information becomes available only after a proposal is accepted.</span></div>
            </div>
            {own && <ProposalList listingId={listing.id} initial={proposals} />}
          </aside>
        </div>
      </div>
    </main>
  );
}
