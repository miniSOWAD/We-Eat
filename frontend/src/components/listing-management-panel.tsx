"use client";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Listing } from "@/types";

export function ListingManagementPanel({ initial }: { initial: Listing[] }){const[items,setItems]=useState(initial);const[busy,setBusy]=useState<string|null>(null);async function remove(item:Listing){if(!confirm(`Remove “${item.title}” from public access?`))return;setBusy(item.id);try{await api(`/listings/${item.id}`,{method:"DELETE"});setItems(value=>value.filter(x=>x.id!==item.id));toast.success("Listing removed")}catch(caught){toast.error(caught instanceof Error?caught.message:"Unable to remove listing")}finally{setBusy(null)}}return !items.length?<div className="empty"><h2>No listings found</h2></div>:<div className="dataTableWrap"><table className="dataTable"><thead><tr><th>Listing</th><th>Owner</th><th>Type</th><th>Status</th><th>Location</th><th>Actions</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.title}</strong><div className="muted">{item.category}</div></td><td>{item.owner.display_name}<div className="muted">@{item.owner.username}</div></td><td>{item.listing_type}</td><td><span className="statusPill" data-status={item.status==="ACTIVE"?"ACTIVE":""}>{item.status}</span></td><td>{item.area}, {item.city}</td><td><div className="inlineActions"><Link className="button buttonGhost" href={`/listings/${item.id}`}><Eye size={16}/>View</Link><button className="button buttonDanger" disabled={busy===item.id} onClick={()=>remove(item)}><Trash2 size={16}/>Remove</button></div></td></tr>)}</tbody></table></div>}
