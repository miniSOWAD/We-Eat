"use client";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listing-card";
import type { Favorite } from "@/types";
export function FavoritesPanel({initial}:{initial:Favorite[]}){const[items,setItems]=useState(initial);async function remove(id:string){try{await api(`/favorites/${id}`,{method:"DELETE"});setItems(v=>v.filter(x=>x.listing.id!==id));toast.success("Removed") }catch(e){toast.error(e instanceof Error?e.message:"Unable to remove")}}return items.length?<div className="grid">{items.map(f=><div className="stack" key={f.id}><ListingCard listing={f.listing}/><button className="button buttonGhost" onClick={()=>remove(f.listing.id)}>Remove from saved</button></div>)}</div>:<div className="empty"><h2>No saved food</h2><p className="muted">Save listings to find them quickly later.</p></div>}
