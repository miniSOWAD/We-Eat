import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock3, Leaf, MapPin, ShieldCheck } from "lucide-react";
import { ListingTypeBadge } from "@/components/listing-card";
import { ListingActions } from "@/components/listing-actions";
import { Comments } from "@/components/comments";
import { backendFetch, getSession, getToken } from "@/lib/server-api";
import type { Comment, Listing } from "@/types";
import styles from "./detail.module.css";

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params; try{const item=await backendFetch<Listing>(`/listings/${id}`);return{title:item.title,description:item.description?.slice(0,155)}}catch{return{title:"Listing"}}
}

export default async function ListingPage({params}:{params:Promise<{id:string}>}){
  const { id } = await params;
  const token = await getToken();
  const listing = await backendFetch<Listing>(`/listings/${id}`, {}, token).catch(() => null);
  if (!listing) {
    return notFound();
  }
  const user = await getSession();
  let comments:Comment[]=[];try{comments=await backendFetch<Comment[]>(`/listings/${id}/comments`)}catch{}
  const image=listing.images?.[0]?.secure_url;
  return <main className="page"><div className={`container twoColumn`}>
    <section className="stack">
      <div className={styles.gallery}><div className={styles.heroImage}>{image?<Image src={image} alt={listing.title} fill priority sizes="(max-width:900px) 100vw, 65vw"/>:<div className={styles.placeholder}>🍲</div>}</div></div>
      <article className={`card ${styles.content}`}>
        <ListingTypeBadge type={listing.listing_type}/><h1 className={styles.title}>{listing.title}</h1>
        <p className="sectionLead" style={{maxWidth:"none"}}>{listing.description}</p>
        <div className={styles.infoGrid}>
          <div className={styles.info}><strong><MapPin size={16}/> Area</strong><div className="muted">{listing.area}, {listing.city}</div></div>
          <div className={styles.info}><strong><Clock3 size={16}/> Expires</strong><div className="muted">{new Date(listing.expires_at).toLocaleString("en-BD")}</div></div>
          <div className={styles.info}><strong>Quantity</strong><div className="muted">{listing.quantity} {listing.unit}</div></div>
          <div className={styles.info}><strong><Leaf size={16}/> Food info</strong><div className="muted">{listing.is_vegetarian?"Vegetarian":"Not marked vegetarian"}</div></div>
        </div>
        {listing.allergens&&<p><strong>Allergens:</strong> {listing.allergens}</p>}
        {listing.exchange_for&&<p><strong>Requested exchange:</strong> {listing.exchange_for}</p>}
      </article>
      <Comments listingId={listing.id} initialComments={comments} signedIn={Boolean(user)}/>
    </section>
    <aside className={`card ${styles.sidebar}`}>
      <div className={styles.owner}><div className={styles.avatar}>{listing.owner.display_name[0]?.toUpperCase()}</div><div><strong>{listing.owner.display_name}</strong><div className="muted">Community provider</div></div></div>
      <hr className="divider"/>
      <div style={{display:"grid",gap:10}}><div><strong>{listing.listing_type==="FREE"?"Free":listing.listing_type==="DISCOUNTED"?`${Number(listing.discounted_price??0).toLocaleString("en-BD")} BDT`:"Exchange"}</strong></div><span className="muted">{listing.status}</span></div>
      <hr className="divider"/>
      <ListingActions listing={listing} user={user}/>
      <div style={{display:"flex",gap:8,marginTop:18,color:"var(--ink-soft)",fontSize:13,lineHeight:1.5}}><ShieldCheck size={35}/><span>Exact pickup details are shown only after a request is accepted.</span></div>
    </aside>
  </div></main>
}
