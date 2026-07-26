import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, UsersRound } from "lucide-react";
import type { Listing } from "@/types";
import styles from "./listing-card.module.css";

export function ListingTypeBadge({ type }: { type: Listing["listing_type"] }) {
  const cls = type === "FREE" ? "badgeFree" : type === "DISCOUNTED" ? "badgeDiscounted" : "badgeExchange";
  return <span className={`badge ${cls}`}>{type === "DISCOUNTED" ? "DISCOUNTED" : type}</span>;
}

function offer(listing: Listing) {
  if (listing.listing_type === "FREE") return "Free";
  if (listing.listing_type === "EXCHANGE") return `For ${listing.exchange_for ?? "another food item"}`;
  return `${Number(listing.discounted_price ?? 0).toLocaleString("en-BD")} BDT`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0]?.secure_url;
  const expires = new Date(listing.expires_at).toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link className={`card ${styles.card}`} href={`/listings/${listing.id}`}>
      <div className={styles.image}>
        <span className={styles.type}><ListingTypeBadge type={listing.listing_type} /></span>
        {listing.status === "RESERVED" && <span className={styles.bidStatus}>Bid in progress</span>}
        {image ? (
          <Image src={image} alt={listing.title} fill sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 33vw" />
        ) : (
          <div className={styles.placeholder}>🍲</div>
        )}
        <span className={styles.openIcon}><ArrowUpRight size={17} /></span>
      </div>
      <div className={styles.body}>
        <div className={styles.metaTop}>
          <span>{listing.category}</span>
          <span>{listing.quantity} {listing.unit}</span>
        </div>
        <h3 className={styles.title}>{listing.title}</h3>
        <div className={styles.location}><MapPin size={15} /><span>{listing.area}, {listing.city}</span></div>
        <div className={styles.offerRow}>
          <span className={styles.expiry}><Clock3 size={14} /> {expires}</span>
          <strong className={styles.price}>{offer(listing)}</strong>
        </div>
        <div className={styles.owner}>
          <span className={styles.avatar}>{listing.owner.display_name.slice(0, 1).toUpperCase()}</span>
          <span>Shared by {listing.owner.display_name}</span>
          {listing.status === "ACTIVE" && <span className={styles.proposals}><UsersRound size={14} /> {listing.proposal_count}</span>}
        </div>
      </div>
    </Link>
  );
}
