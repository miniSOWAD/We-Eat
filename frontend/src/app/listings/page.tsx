import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { backendFetch } from "@/lib/server-api";
import type { ListingBrowse, ListingType } from "@/types";

export const metadata: Metadata = { title: "Find food" };

export default async function ListingsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const sp=await searchParams;
  const get=(key:string)=>typeof sp[key]==="string" ? String(sp[key]) : "";
  const params=new URLSearchParams();
  ["search","city","category","listing_type"].forEach(k=>{const v=get(k);if(v)params.set(k,v)});
  params.set("page",get("page")||"1"); params.set("page_size","12");
  let data:ListingBrowse={items:[],total:0,page:1,page_size:12,pages:0};
  let error="";
  try{data=await backendFetch<ListingBrowse>(`/listings?${params}`)}catch(e){error=e instanceof Error?e.message:"Unable to load listings"}
  return <main className="page"><div className="container stack">
    <div><span className="badge badgeDiscounted">Community marketplace</span><h1 className="sectionTitle" style={{marginTop:16}}>Find food near you</h1><p className="sectionLead">Filter by arrangement, location or food category. Exact pickup information stays private.</p></div>
    <form className="card formGrid" style={{padding:22}} method="get">
      <div className="field"><label htmlFor="search">Search</label><input className="input" id="search" name="search" defaultValue={get("search")} placeholder="Rice, cake, vegetables…"/></div>
      <div className="field"><label htmlFor="city">City</label><input className="input" id="city" name="city" defaultValue={get("city")} placeholder="Dhaka"/></div>
      <div className="field"><label htmlFor="category">Category</label><input className="input" id="category" name="category" defaultValue={get("category")} placeholder="Cooked meal"/></div>
      <div className="field"><label htmlFor="listing_type">Arrangement</label><select className="select" id="listing_type" name="listing_type" defaultValue={get("listing_type") as ListingType|""}><option value="">All types</option><option value="FREE">Free</option><option value="DISCOUNTED">Discounted</option><option value="EXCHANGE">Exchange</option></select></div>
      <div className="full" style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="button buttonPrimary" type="submit">Apply filters</button><Link className="button buttonGhost" href="/listings">Clear</Link></div>
    </form>
    {error&&<div className="error">{error}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}><strong>{data.total} listing{data.total===1?"":"s"}</strong><Link className="button buttonCream" href="/share">Share food</Link></div>
    {data.items.length?<div className="grid">{data.items.map(item=><ListingCard key={item.id} listing={item}/>)}</div>:<div className="empty"><h2>No matching food found</h2><p className="muted">Remove a filter or check again when new food is shared.</p></div>}
    {data.pages>1&&<nav style={{display:"flex",gap:10,justifyContent:"center"}} aria-label="Pagination">{Array.from({length:data.pages},(_,i)=>i+1).map(page=>{const q=new URLSearchParams(params);q.set("page",String(page));return <Link key={page} className={`button ${page===data.page?"buttonPrimary":"buttonGhost"}`} href={`/listings?${q}`}>{page}</Link>})}</nav>}
  </div></main>
}
