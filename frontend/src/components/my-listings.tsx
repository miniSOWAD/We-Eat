"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listing-card";
import type { Listing } from "@/types";
export function MyListings({initial}:{initial:Listing[]}){const [items,setItems]=useState(initial);async function remove(id:string){if(!confirm("Remove this listing from public view?"))return;try{await api(`/listings/${id}`,{method:"DELETE"});setItems(v=>v.map(x=>x.id===id?{...x,status:"REMOVED"}:x));toast.success("Listing removed")}catch(e){toast.error(e instanceof Error?e.message:"Unable to remove")}}return <>{items.length?<div className="grid">{items.map(item=><div key={item.id} className="stack"><ListingCard listing={item}/><div style={{display:"flex",gap:8}}><Link className="button buttonGhost" href={`/listings/${item.id}`}>View</Link>{item.status!=="REMOVED"&&<button className="button buttonDanger" onClick={()=>remove(item.id)}><Trash2 size={16}/>Remove</button>}</div></div>)}</div>:<div className="empty"><h2>No listings yet</h2><Link className="button buttonPrimary" href="/share">Share food</Link></div>}</>}
