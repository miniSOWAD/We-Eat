import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
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
  return <Link className={`card ${styles.card}`} href={`/listings/${listing.id}`}>
    <div className={styles.image}>
      <span className={styles.type}><ListingTypeBadge type={listing.listing_type}/></span>
      {image ? <Image src={image} alt={listing.title} fill sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 33vw"/> : <div className={styles.placeholder}>🍲</div>}
    </div>
    <div className={styles.body}>
      <div className={styles.meta}><span>{listing.category}</span><span>{listing.quantity} {listing.unit}</span></div>
      <h3 className={styles.title}>{listing.title}</h3>
      <div className={styles.meta}><span><MapPin size={14} style={{verticalAlign:"-2px"}}/> {listing.area}, {listing.city}</span><span className={styles.price}>{offer(listing)}</span></div>
      <div className={styles.owner}><span className={styles.avatar}>{listing.owner.display_name.slice(0,1).toUpperCase()}</span><span>{listing.owner.display_name}</span></div>
    </div>
  </Link>;
}
