"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Exchange } from "@/types";
import { ReputationPoints } from "@/components/reputation-points";

function futureTime(): string { return new Date(Date.now() + 60 * 60 * 1000).toISOString(); }

export function ExchangesPanel({ initial, userId }: { initial: Exchange[]; userId: string }) {
  const [items, setItems] = useState(initial);
  function replace(exchange: Exchange) { setItems((current) => current.map((item) => item.id === exchange.id ? exchange : item)); }

  async function action(exchange: Exchange, name: string) {
    try {
      if (name === "review") {
        const rating = Number(window.prompt("Rating from 1 to 5"));
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
        await api("/reviews", { method: "POST", body: { exchange_request_id: exchange.id, rating, comment: window.prompt("Optional comment") || null } });
        toast.success("Review published"); return;
      }
      if (name === "accept") {
        const method = (window.prompt("Type PICKUP or DELIVERY", "PICKUP") || "").toUpperCase();
        if (!['PICKUP','DELIVERY'].includes(method)) return;
        const time = window.prompt("Handover time in ISO format", futureTime());
        if (!time) return;
        const note = window.prompt("Optional handover note") || null;
        const result = await api<Exchange>(`/exchanges/${exchange.id}/accept`, { method: "POST", body: { fulfillment_method: method, scheduled_for: new Date(time).toISOString(), handoff_note: note } });
        replace(result); toast.success("Proposal accepted"); return;
      }
      if (name === "cancel") {
        const accepted = exchange.status === "ACCEPTED";
        const note = accepted ? window.prompt("Explain why you are cancelling this accepted handover") : null;
        if (accepted && (note === null || note.trim().length < 8)) {
          if (note !== null) toast.error("Give a short reason of at least 8 characters.");
          return;
        }
        const result = await api<Exchange | { message: string }>(`/exchanges/${exchange.id}/cancel`, { method: "POST", body: { note: note?.trim() || null } });
        if ("id" in result) replace(result);
        toast.success("Exchange cancelled");
        return;
      }
      const result = await api<Exchange | { message: string }>(`/exchanges/${exchange.id}/${name}`, { method: "POST" });
      if ("id" in result) replace(result);
      toast.success("Exchange updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Action failed"); }
  }

  async function showPickup(listingId: string, label: string) {
    try {
      const details = await api<{ pickup_address: string; contact_phone?: string | null; delivery_notes?: string | null }>(`/listings/${listingId}/pickup-details`);
      window.alert(`${label}\nPickup: ${details.pickup_address}\nPhone: ${details.contact_phone || "Not provided"}\nNotes: ${details.delivery_notes || "None"}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Pickup details unavailable"); }
  }

  if (!items.length) return <div className="empty"><h2>No exchange proposals</h2><p className="muted">Exchange activity will appear here.</p></div>;
  return <div className="stack">{items.map((exchange) => {
    const provider = exchange.provider.id === userId;
    const active = exchange.status === "ACCEPTED";
    return <article className="card" style={{ padding: 22 }} key={exchange.id}>
      <span className="badge badgeExchange">{active ? "BID IN PROGRESS" : exchange.status}</span>
      <h3>{exchange.listing.title}</h3>
      <p><strong>Offer:</strong> {exchange.offered_listing?.title || exchange.offered_description}</p>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><ReputationPoints user={provider ? exchange.requester : exchange.provider} compact/><p className="muted" style={{margin:0}}>{provider ? `From ${exchange.requester.display_name}` : `To ${exchange.provider.display_name}`}</p></div>
      {exchange.scheduled_for && <p className="muted">{exchange.fulfillment_method} · {new Date(exchange.scheduled_for).toLocaleString("en-BD")}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {provider && exchange.status === "PENDING" && <><button className="button buttonPrimary" onClick={() => action(exchange, "accept")}>Accept</button><button className="button buttonDanger" onClick={() => action(exchange, "reject")}>Reject</button></>}
        {!provider && active && !exchange.requester_confirmed_at && <button className="button buttonPrimary" onClick={() => action(exchange, "received")}>Received</button>}
        {!provider && active && exchange.requester_confirmed_at && <span className="success">Waiting for provider to complete</span>}
        {provider && active && <button className="button buttonPrimary" disabled={!exchange.requester_confirmed_at} onClick={() => action(exchange, "delivered")}>{exchange.requester_confirmed_at ? "Delivered" : "Waiting for Received"}</button>}
        {active && <button className="button buttonGhost" onClick={() => showPickup(exchange.listing.id, "Requested food")}>Pickup details</button>}
        {["PENDING", "ACCEPTED"].includes(exchange.status) && <button className="button buttonDanger" onClick={() => action(exchange, "cancel")}>Cancel</button>}
        {exchange.status === "COMPLETED" && <button className="button buttonGhost" onClick={() => action(exchange, "review")}>Leave review</button>}
      </div>
    </article>;
  })}</div>;
}
