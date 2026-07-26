"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Order } from "@/types";

function futureTime(): string {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

export function OrdersPanel({ initial, userId }: { initial: Order[]; userId: string }) {
  const [items, setItems] = useState(initial);
  function replace(order: Order) { setItems((current) => current.map((item) => item.id === order.id ? order : item)); }

  async function action(order: Order, name: string) {
    try {
      if (name === "review") {
        const rating = Number(window.prompt("Rating from 1 to 5"));
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
        const comment = window.prompt("Optional review comment") || null;
        await api("/reviews", { method: "POST", body: { order_id: order.id, rating, comment } });
        toast.success("Review published");
        return;
      }
      if (name === "accept") {
        const method = (window.prompt("Type PICKUP or DELIVERY", "PICKUP") || "").toUpperCase();
        if (!['PICKUP','DELIVERY'].includes(method)) return;
        const time = window.prompt("Handover time in ISO format", futureTime());
        if (!time) return;
        const note = window.prompt("Optional handover note") || null;
        const result = await api<Order>(`/orders/${order.id}/accept`, { method: "POST", body: { fulfillment_method: method, scheduled_for: new Date(time).toISOString(), handoff_note: note } });
        replace(result); toast.success("Proposal accepted"); return;
      }
      const result = await api<Order | { message: string }>(`/orders/${order.id}/${name}`, { method: "POST" });
      if ("id" in result) replace(result);
      toast.success("Order updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Action failed"); }
  }

  async function pickup(order: Order) {
    try {
      const details = await api<{ pickup_address: string; contact_phone?: string; delivery_notes?: string }>(`/listings/${order.listing.id}/pickup-details`);
      window.alert(`Pickup: ${details.pickup_address}\nPhone: ${details.contact_phone || "Not provided"}\nNotes: ${details.delivery_notes || "None"}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Details unavailable"); }
  }

  if (!items.length) return <div className="empty"><h2>No food proposals</h2><p className="muted">Proposals you send or receive will appear here.</p></div>;
  return <div className="stack">{items.map((order) => {
    const provider = order.provider.id === userId;
    const party = provider ? order.requester : order.provider;
    const active = ["ACCEPTED", "READY"].includes(order.status);
    return <article key={order.id} className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><span className="badge badgeMuted">{active ? "BID IN PROGRESS" : order.status}</span><h3>{order.listing.title}</h3><p className="muted">{provider ? "Proposed by" : "Provided by"} {party.display_name} · {order.quantity} {order.listing.unit}</p>{order.scheduled_for && <p className="muted">{order.fulfillment_method} · {new Date(order.scheduled_for).toLocaleString("en-BD")}</p>}{order.message && <p>{order.message}</p>}</div>
        <strong>{Number(order.agreed_price).toLocaleString("en-BD")} BDT</strong>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {provider && order.status === "REQUESTED" && <><button className="button buttonPrimary" onClick={() => action(order, "accept")}>Accept</button><button className="button buttonDanger" onClick={() => action(order, "reject")}>Reject</button></>}
        {!provider && active && !order.requester_confirmed_at && <button className="button buttonPrimary" onClick={() => action(order, "received")}>Received</button>}
        {!provider && active && order.requester_confirmed_at && <span className="success">Waiting for provider to complete</span>}
        {provider && active && <button className="button buttonPrimary" disabled={!order.requester_confirmed_at} onClick={() => action(order, "delivered")}>{order.requester_confirmed_at ? "Delivered" : "Waiting for Received"}</button>}
        {active && <button className="button buttonGhost" onClick={() => pickup(order)}>Pickup details</button>}
        {["REQUESTED", "ACCEPTED", "READY"].includes(order.status) && <button className="button buttonDanger" onClick={() => action(order, "cancel")}>Cancel</button>}
        {order.status === "COMPLETED" && <button className="button buttonGhost" onClick={() => action(order, "review")}>Leave review</button>}
      </div>
    </article>;
  })}</div>;
}
