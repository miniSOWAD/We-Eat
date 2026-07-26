"use client";

import {
  CalendarClock,
  CheckCircle2,
  MapPin,
  PackageCheck,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Proposal } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { ReputationPoints } from "@/components/reputation-points";
import styles from "./proposal-list.module.css";

function localDateTimeValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function proposalEndpoint(proposal: Proposal): string {
  return proposal.kind === "ORDER" ? `/orders/${proposal.id}` : `/exchanges/${proposal.id}`;
}

function reviewEndpoint(proposal: Proposal): string {
  return `/proposals/${proposal.kind.toLowerCase()}/${proposal.id}/review-cancellation`;
}

export function ProposalList({
  listingId,
  initial,
}: {
  listingId: string;
  initial: Proposal[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState("");
  const [method, setMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [scheduledFor, setScheduledFor] = useState(
    localDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const acceptedExists = items.some((item) => ["ACCEPTED", "READY"].includes(item.status));

  async function refresh() {
    const next = await api<Proposal[]>(`/proposals/listing/${listingId}`);
    setItems(next);
  }

  async function reject(proposal: Proposal) {
    if (!window.confirm("Reject and remove this proposal from your list?")) return;
    setBusy(proposal.id);
    try {
      await api(`${proposalEndpoint(proposal)}/reject`, { method: "POST" });
      await refresh();
      toast.success("Proposal rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reject proposal");
    } finally {
      setBusy(null);
    }
  }

  async function accept(proposal: Proposal) {
    if (acceptedExists) {
      toast.error("Complete or cancel the current handover before accepting another proposal.");
      return;
    }
    if (!scheduledFor) {
      toast.error("Choose a handover time");
      return;
    }
    setBusy(proposal.id);
    try {
      await api(`${proposalEndpoint(proposal)}/accept`, {
        method: "POST",
        body: {
          fulfillment_method: method,
          scheduled_for: new Date(scheduledFor).toISOString(),
          handoff_note: note.trim() || null,
        },
      });
      await refresh();
      setAccepting(null);
      setMethod("PICKUP");
      setNote("");
      toast.success("Proposal accepted. Other proposals remain pending.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to accept proposal");
    } finally {
      setBusy(null);
    }
  }

  async function cancelHandoff(proposal: Proposal) {
    const reason = cancelNote.trim();
    if (reason.length < 8) {
      toast.error("Give a short reason of at least 8 characters.");
      return;
    }
    setBusy(proposal.id);
    try {
      await api(`${proposalEndpoint(proposal)}/cancel`, {
        method: "POST",
        body: { note: reason },
      });
      await refresh();
      setCancelling(null);
      setCancelNote("");
      toast.success("Handover cancelled. Pending proposals can be considered again.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel handover");
    } finally {
      setBusy(null);
    }
  }

  async function reviewCancellation(proposal: Proposal, action: "MARK" | "OK") {
    if (action === "MARK" && !window.confirm("Add one negative point to this user?")) return;
    setBusy(proposal.id);
    try {
      await api(reviewEndpoint(proposal), {
        method: "POST",
        body: { action },
      });
      await refresh();
      router.refresh();
      toast.success(action === "MARK" ? "Negative point added" : "Cancellation acknowledged");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to review cancellation");
    } finally {
      setBusy(null);
    }
  }

  async function delivered(proposal: Proposal) {
    if (!window.confirm("Confirm that the handover is complete.")) return;
    setBusy(proposal.id);
    try {
      await api(`${proposalEndpoint(proposal)}/delivered`, { method: "POST" });
      await refresh();
      router.refresh();
      toast.success("Handover completed. Both users earned one positive point.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete handover");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={`card ${styles.panel}`} aria-labelledby="proposal-list-title">
      <div className={styles.heading}>
        <div>
          <span className="badge badgeExchange">Private</span>
          <h2 id="proposal-list-title">Proposal list</h2>
          <p>Review offers and keep alternatives available until a handover is completed.</p>
        </div>
        <span className={styles.count}>{items.length}</span>
      </div>

      {!items.length ? (
        <div className={styles.empty}>
          <UserRound size={24} />
          <strong>No active proposals yet</strong>
          <span>New offers will appear here for you only.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((proposal) => {
            const pending = ["REQUESTED", "PENDING"].includes(proposal.status);
            const accepted = ["ACCEPTED", "READY"].includes(proposal.status);
            const cancelledReview = proposal.status === "CANCELLED" && proposal.cancellation_requires_review;
            const deliveryUnavailable = proposal.kind === "ORDER" && !proposal.delivery_address;
            const acceptDisabled = acceptedExists && !accepted;

            return (
              <article
                className={`${styles.proposal} ${cancelledReview ? styles.cancelledProposal : ""}`}
                key={`${proposal.kind}-${proposal.id}`}
              >
                <div className={styles.personRow}>
                  <ReputationPoints user={proposal.requester} compact />
                  <UserAvatar user={proposal.requester} size="sm" />
                  <div className={styles.personText}>
                    <strong>{proposal.requester.display_name}</strong>
                    <span>@{proposal.requester.username}</span>
                  </div>
                  <span className={`badge ${accepted ? "badgeDiscounted" : cancelledReview ? "badgeMuted" : "badgeExchange"}`}>
                    {accepted ? "Bid in progress" : cancelledReview ? "Cancelled" : "Pending proposal"}
                  </span>
                </div>

                <div className={styles.offerBox}>
                  {proposal.kind === "EXCHANGE" ? (
                    <>
                      <strong>Offering</strong>
                      <span>{proposal.offered_listing?.title || proposal.offered_description}</span>
                    </>
                  ) : (
                    <>
                      <strong>Request</strong>
                      <span>{proposal.quantity} {proposal.listing.unit}</span>
                    </>
                  )}
                  {proposal.message && <p>{proposal.message}</p>}
                  {proposal.delivery_address && <p><strong>Delivery address:</strong> {proposal.delivery_address}</p>}
                </div>

                {pending && acceptDisabled && (
                  <p className={styles.pendingNotice}>
                    Another handover is in progress. This proposal stays pending and can be accepted if that handover is cancelled.
                  </p>
                )}

                {cancelledReview && (
                  <div className={styles.cancellationBox}>
                    <strong>The requester cancelled after acceptance</strong>
                    <p>{proposal.cancellation_note || "No reason was supplied."}</p>
                    <div className={styles.actions}>
                      <button
                        className="button buttonDanger"
                        type="button"
                        disabled={busy === proposal.id}
                        onClick={() => reviewCancellation(proposal, "MARK")}
                      >
                        Mark user
                      </button>
                      <button
                        className="button buttonGhost"
                        type="button"
                        disabled={busy === proposal.id}
                        onClick={() => reviewCancellation(proposal, "OK")}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}

                {accepted && (
                  <div className={styles.handoff}>
                    <span><CalendarClock size={16} /> {proposal.scheduled_for ? new Date(proposal.scheduled_for).toLocaleString("en-BD") : "Time pending"}</span>
                    <span>{proposal.fulfillment_method === "DELIVERY" ? <Truck size={16} /> : <MapPin size={16} />} {proposal.fulfillment_method === "DELIVERY" ? "Delivery" : "Pickup"}</span>
                    {proposal.handoff_note && <p>{proposal.handoff_note}</p>}
                    <div className={styles.progress}>
                      <span className={proposal.received_at ? styles.done : ""}><CheckCircle2 size={16} /> Recipient confirmed</span>
                      <span className={proposal.delivered_at ? styles.done : ""}><PackageCheck size={16} /> Provider completed</span>
                    </div>
                  </div>
                )}

                {accepting === proposal.id && pending && !acceptDisabled && (
                  <div className={styles.acceptForm}>
                    <button className={styles.close} type="button" onClick={() => setAccepting(null)} aria-label="Close acceptance form"><X size={17} /></button>
                    <div className="field">
                      <label htmlFor={`method-${proposal.id}`}>Handover method</label>
                      <select id={`method-${proposal.id}`} className="select" value={method} onChange={(event) => setMethod(event.target.value as "PICKUP" | "DELIVERY")}>
                        <option value="PICKUP">Pickup</option>
                        <option value="DELIVERY" disabled={deliveryUnavailable}>I will deliver</option>
                      </select>
                      {deliveryUnavailable && <small className="muted">Delivery is unavailable because no delivery address was supplied.</small>}
                    </div>
                    <div className="field">
                      <label htmlFor={`schedule-${proposal.id}`}>Pickup or delivery time</label>
                      <input id={`schedule-${proposal.id}`} className="input" type="datetime-local" min={localDateTimeValue(new Date(Date.now() + 5 * 60 * 1000))} value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor={`note-${proposal.id}`}>Handover note (optional)</label>
                      <textarea id={`note-${proposal.id}`} className="textarea" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Meeting point, contact instructions or delivery note" />
                    </div>
                    <button className="button buttonPrimary" type="button" disabled={busy === proposal.id} onClick={() => accept(proposal)}>Confirm acceptance</button>
                  </div>
                )}

                {cancelling === proposal.id && accepted && (
                  <div className={styles.acceptForm}>
                    <button className={styles.close} type="button" onClick={() => { setCancelling(null); setCancelNote(""); }} aria-label="Close cancellation form"><X size={17} /></button>
                    <div className="field">
                      <label htmlFor={`cancel-${proposal.id}`}>Why are you cancelling?</label>
                      <textarea
                        id={`cancel-${proposal.id}`}
                        className="textarea"
                        minLength={8}
                        maxLength={800}
                        value={cancelNote}
                        onChange={(event) => setCancelNote(event.target.value)}
                        placeholder="Explain what changed so the other person understands."
                      />
                    </div>
                    <button className="button buttonDanger" type="button" disabled={busy === proposal.id} onClick={() => cancelHandoff(proposal)}>Cancel handover</button>
                  </div>
                )}

                {!cancelledReview && (
                  <div className={styles.actions}>
                    {pending && accepting !== proposal.id && (
                      <>
                        <button
                          className="button buttonPrimary"
                          type="button"
                          disabled={acceptDisabled || busy === proposal.id}
                          onClick={() => setAccepting(proposal.id)}
                          title={acceptDisabled ? "Another proposal is already accepted" : undefined}
                        >
                          Accept
                        </button>
                        <button className="button buttonDanger" type="button" disabled={busy === proposal.id} onClick={() => reject(proposal)}>Reject</button>
                      </>
                    )}
                    {accepted && cancelling !== proposal.id && (
                      <>
                        <button className="button buttonDanger" type="button" disabled={busy === proposal.id} onClick={() => setCancelling(proposal.id)}>Cancel handover</button>
                        <button className="button buttonPrimary" type="button" disabled={!proposal.received_at || busy === proposal.id} onClick={() => delivered(proposal)}>
                          <PackageCheck size={17} />
                          {proposal.received_at ? "Delivered" : "Waiting for Received"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
