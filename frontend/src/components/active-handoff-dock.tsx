"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  MapPin,
  PackageCheck,
  Truck,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Proposal, UserMe } from "@/types";
import styles from "./active-handoff-dock.module.css";

function endpoint(proposal: Proposal): string {
  return proposal.kind === "ORDER" ? `/orders/${proposal.id}` : `/exchanges/${proposal.id}`;
}

function proposalActionEndpoint(proposal: Proposal, action: string): string {
  return `/proposals/${proposal.kind.toLowerCase()}/${proposal.id}/${action}`;
}

function rejectionMessage(reason?: string | null): string {
  if (reason === "DELIVERED_TO_SOMEONE_ELSE") return "Delivered to someone else, sorry.";
  if (reason === "LISTING_REMOVED") return "The listing was removed and is no longer available.";
  return "Proposal rejected.";
}

function stateOf(proposal: Proposal): "accepted" | "pending" | "cancelled" | "rejected" {
  if (["ACCEPTED", "READY"].includes(proposal.status)) return "accepted";
  if (["REQUESTED", "PENDING"].includes(proposal.status)) return "pending";
  if (proposal.status === "CANCELLED") return "cancelled";
  return "rejected";
}

export function ActiveHandoffDock({ user }: { user: UserMe | null }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Proposal[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await api<Proposal[]>("/proposals/mine"));
    } catch {
      // Keep the rest of the application usable during a transient status refresh failure.
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refresh();
    const timer = window.setInterval(refresh, 10_000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    const onProposalUpdated = () => void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("we-eat:proposal-updated", onProposalUpdated);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("we-eat:proposal-updated", onProposalUpdated);
    };
  }, [pathname, refresh, user]);

  const triggerState = useMemo(() => {
    if (items.some((item) => stateOf(item) === "accepted")) return "accepted";
    if (items.some((item) => ["cancelled", "rejected"].includes(stateOf(item)))) return "alert";
    return "pending";
  }, [items]);

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

  async function cancelProposal(proposal: Proposal, accepted: boolean) {
    const note = cancelNote.trim();
    if (accepted && note.length < 8) {
      toast.error("Give a short reason of at least 8 characters.");
      return;
    }
    if (!accepted && !window.confirm("Withdraw this pending proposal?")) return;
    setBusy(proposal.id);
    try {
      await api(`${endpoint(proposal)}/cancel`, {
        method: "POST",
        body: { note: note || null },
      });
      await refresh();
      setCancelling(null);
      setCancelNote("");
      toast.success(accepted ? "Handover cancelled and the provider received your note." : "Proposal withdrawn");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel proposal");
    } finally {
      setBusy(null);
    }
  }

  async function dismiss(proposal: Proposal) {
    setBusy(proposal.id);
    try {
      await api(proposalActionEndpoint(proposal, "dismiss"), { method: "POST" });
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to dismiss notice");
    } finally {
      setBusy(null);
    }
  }

  async function reviewCancellation(proposal: Proposal, action: "MARK" | "OK") {
    if (action === "MARK" && !window.confirm("Add one negative point to the provider?")) return;
    setBusy(proposal.id);
    try {
      await api(proposalActionEndpoint(proposal, "review-cancellation"), {
        method: "POST",
        body: { action },
      });
      await refresh();
      toast.success(action === "MARK" ? "Negative point added" : "Cancellation acknowledged");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to review cancellation");
    } finally {
      setBusy(null);
    }
  }

  if (!user || !items.length) return null;
  const firstImage = items[0]?.listing.images?.[0]?.secure_url;
  const triggerLabel = triggerState === "accepted"
    ? "Handover active"
    : triggerState === "alert"
      ? "Proposal update"
      : "Proposal pending";

  return (
    <div className={styles.dock}>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Your food proposals">
          <div className={styles.panelHead}>
            <div><strong>Your proposals</strong><span>{items.length} current update{items.length === 1 ? "" : "s"}</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className={styles.list}>
            {items.map((proposal) => {
              const image = proposal.listing.images?.[0]?.secure_url;
              const state = stateOf(proposal);
              const accepted = state === "accepted";
              const pending = state === "pending";
              const cancelled = state === "cancelled";
              const rejected = state === "rejected";
              const otherHandover = pending && proposal.listing.status === "RESERVED";

              return (
                <article className={`${styles.item} ${styles[state]}`} key={`${proposal.kind}-${proposal.id}`}>
                  <Link href={`/listings/${proposal.listing.id}`} className={styles.foodImage} onClick={() => setOpen(false)}>
                    {image ? <Image src={image} alt={proposal.listing.title} fill sizes="58px" /> : <PackageCheck size={22} />}
                  </Link>
                  <div className={styles.details}>
                    <div className={styles.statusRow}>
                      <strong>{proposal.listing.title}</strong>
                      <span className={styles.statusText}>
                        {accepted ? "Accepted" : pending ? "Pending" : cancelled ? "Cancelled" : "Rejected"}
                      </span>
                    </div>

                    {accepted && (
                      <>
                        <span><CalendarClock size={14} /> {proposal.scheduled_for ? new Date(proposal.scheduled_for).toLocaleString("en-BD") : "Time pending"}</span>
                        <span>{proposal.fulfillment_method === "DELIVERY" ? <Truck size={14} /> : <MapPin size={14} />} {proposal.fulfillment_method === "DELIVERY" ? "Delivery" : "Pickup"}</span>
                        {proposal.handoff_note && <p>{proposal.handoff_note}</p>}
                      </>
                    )}

                    {pending && (
                      <p className={styles.message}>
                        {otherHandover
                          ? "Another proposal is currently in progress. Yours remains pending."
                          : "Waiting for the provider to review your proposal."}
                      </p>
                    )}

                    {rejected && <p className={styles.message}>{rejectionMessage(proposal.rejection_reason)}</p>}

                    {cancelled && (
                      <>
                        <p className={styles.message}>{proposal.cancelled_by_id ? "The provider cancelled the accepted handover." : "The accepted handover was cancelled."}</p>
                        <p className={styles.cancelNote}>{proposal.cancellation_note || "No reason was supplied."}</p>
                      </>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    {accepted && proposal.fulfillment_method === "PICKUP" && (
                      <button className="button buttonGhost" type="button" onClick={() => showPickup(proposal)}>Pickup details</button>
                    )}
                    {accepted && (
                      proposal.received_at ? (
                        <span className={styles.waiting}><Check size={15} /> Waiting for provider</span>
                      ) : (
                        <button className="button buttonPrimary" type="button" disabled={busy === proposal.id} onClick={() => markReceived(proposal)}>Received</button>
                      )
                    )}
                    {pending && (
                      <button className="button buttonGhost" type="button" disabled={busy === proposal.id} onClick={() => cancelProposal(proposal, false)}>Withdraw proposal</button>
                    )}
                    {accepted && cancelling !== proposal.id && !proposal.received_at && (
                      <button className="button buttonDanger" type="button" disabled={busy === proposal.id} onClick={() => setCancelling(proposal.id)}>Cancel handover</button>
                    )}
                    {rejected && (
                      <button className="button buttonGhost" type="button" disabled={busy === proposal.id} onClick={() => dismiss(proposal)}>OK</button>
                    )}
                    {cancelled && proposal.cancellation_requires_review && (
                      <>
                        <button className="button buttonDanger" type="button" disabled={busy === proposal.id} onClick={() => reviewCancellation(proposal, "MARK")}>Mark user</button>
                        <button className="button buttonGhost" type="button" disabled={busy === proposal.id} onClick={() => reviewCancellation(proposal, "OK")}>OK</button>
                      </>
                    )}
                    {cancelled && !proposal.cancellation_requires_review && (
                      <button className="button buttonGhost" type="button" disabled={busy === proposal.id} onClick={() => dismiss(proposal)}>OK</button>
                    )}
                  </div>

                  {accepted && cancelling === proposal.id && (
                    <div className={styles.cancelForm}>
                      <label htmlFor={`dock-cancel-${proposal.id}`}>Why do you no longer need this food?</label>
                      <textarea
                        id={`dock-cancel-${proposal.id}`}
                        className="textarea"
                        minLength={8}
                        maxLength={800}
                        value={cancelNote}
                        onChange={(event) => setCancelNote(event.target.value)}
                        placeholder="Explain what changed so the provider understands."
                      />
                      <div className={styles.itemActions}>
                        <button className="button buttonDanger" type="button" disabled={busy === proposal.id} onClick={() => cancelProposal(proposal, true)}>Confirm cancellation</button>
                        <button className="button buttonGhost" type="button" onClick={() => { setCancelling(null); setCancelNote(""); }}>Keep proposal</button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}
      <button
        className={`${styles.trigger} ${styles[`trigger_${triggerState}`]}`}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open proposal updates"
      >
        <span className={styles.triggerImage}>
          {firstImage ? <Image src={firstImage} alt="" fill sizes="58px" /> : <PackageCheck size={24} />}
        </span>
        <span className={styles.triggerText}>{triggerLabel}</span>
        <span className={styles.pulse} />
        {items.length > 1 && <span className={styles.number}>{items.length}</span>}
      </button>
    </div>
  );
}
