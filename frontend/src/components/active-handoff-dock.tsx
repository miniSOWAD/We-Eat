"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Check, MapPin, PackageCheck, Truck, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Proposal, UserMe } from "@/types";
import styles from "./active-handoff-dock.module.css";

function endpoint(proposal: Proposal): string {
  return proposal.kind === "ORDER" ? `/orders/${proposal.id}` : `/exchanges/${proposal.id}`;
}

export function ActiveHandoffDock({ user }: { user: UserMe | null }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Proposal[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await api<Proposal[]>("/proposals/active"));
    } catch {
      // The dock is optional; normal pages remain usable during a transient failure.
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refresh();
    const timer = window.setInterval(refresh, 15_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname, refresh, user]);


  async function showPickup(proposal: Proposal) {
    try {
      const details = await api<{ pickup_address: string; contact_phone?: string | null; delivery_notes?: string | null }>(
        `/listings/${proposal.listing.id}/pickup-details`,
      );
      window.alert(
        `Pickup: ${details.pickup_address}\nPhone: ${details.contact_phone || "Not provided"}\nNotes: ${details.delivery_notes || "None"}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Pickup details unavailable");
    }
  }

  async function markReceived(proposal: Proposal) {
    if (!window.confirm("Confirm only after you have received the food.")) return;
    setBusy(proposal.id);
    try {
      await api(`${endpoint(proposal)}/received`, { method: "POST" });
      await refresh();
      toast.success("Receipt confirmed. The provider can now complete the handover.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to confirm receipt");
    } finally {
      setBusy(null);
    }
  }

  if (!user || !items.length) return null;
  const firstImage = items[0]?.listing.images?.[0]?.secure_url;

  return (
    <div className={styles.dock}>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Accepted food handovers">
          <div className={styles.panelHead}>
            <div><strong>Accepted food</strong><span>{items.length} active handover{items.length === 1 ? "" : "s"}</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className={styles.list}>
            {items.map((proposal) => {
              const image = proposal.listing.images?.[0]?.secure_url;
              return (
                <article className={styles.item} key={`${proposal.kind}-${proposal.id}`}>
                  <Link href={`/listings/${proposal.listing.id}`} className={styles.foodImage} onClick={() => setOpen(false)}>
                    {image ? <Image src={image} alt={proposal.listing.title} fill sizes="58px" /> : <PackageCheck size={22} />}
                  </Link>
                  <div className={styles.details}>
                    <strong>{proposal.listing.title}</strong>
                    <span><CalendarClock size={14} /> {proposal.scheduled_for ? new Date(proposal.scheduled_for).toLocaleString("en-BD") : "Time pending"}</span>
                    <span>{proposal.fulfillment_method === "DELIVERY" ? <Truck size={14} /> : <MapPin size={14} />} {proposal.fulfillment_method === "DELIVERY" ? "Delivery" : "Pickup"}</span>
                    {proposal.handoff_note && <p>{proposal.handoff_note}</p>}
                  </div>
                  <div className={styles.itemActions}>
                    {proposal.fulfillment_method === "PICKUP" && (
                      <button className="button buttonGhost" type="button" onClick={() => showPickup(proposal)}>Pickup details</button>
                    )}
                    {proposal.received_at ? (
                      <span className={styles.waiting}><Check size={15} /> Waiting for provider</span>
                    ) : (
                      <button className="button buttonPrimary" type="button" disabled={busy === proposal.id} onClick={() => markReceived(proposal)}>Received</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
      <button className={styles.trigger} type="button" onClick={() => setOpen((value) => !value)} aria-label="Open accepted food">
        <span className={styles.triggerImage}>
          {firstImage ? <Image src={firstImage} alt="" fill sizes="58px" /> : <PackageCheck size={24} />}
        </span>
        <span className={styles.pulse} />
        {items.length > 1 && <span className={styles.number}>{items.length}</span>}
      </button>
    </div>
  );
}
