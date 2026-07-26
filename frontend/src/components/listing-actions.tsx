"use client";

import Link from "next/link";
import { Heart, Send, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Listing, UserMe } from "@/types";

export function ListingActions({
  listing,
  user,
}: {
  listing: Listing;
  user: UserMe | null;
}) {
  const [saved, setSaved] = useState(Boolean(listing.is_favorited));
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [offer, setOffer] = useState("");
  const [offeredListingId, setOfferedListingId] = useState("");
  const [ownListings, setOwnListings] = useState<Listing[]>([]);
  const [busy, setBusy] = useState(false);
  const own = user?.id === listing.owner.id;

  useEffect(() => {
    if (!user || own || listing.listing_type !== "EXCHANGE") return;
    let active = true;
    api<Listing[]>("/listings/mine")
      .then((items) => {
        if (active) {
          setOwnListings(
            items.filter(
              (item) => item.status === "ACTIVE" && item.id !== listing.id,
            ),
          );
        }
      })
      .catch(() => {
        // A text-only exchange offer remains available if this request fails.
      });
    return () => {
      active = false;
    };
  }, [listing.id, listing.listing_type, own, user]);

  if (!user) {
    return (
      <div className="stack">
        <Link
          className="button buttonPrimary"
          href={`/login?next=/listings/${listing.id}`}
        >
          Sign in to propose
        </Link>
      </div>
    );
  }
  if (own) {
    return (
      <div className="stack">
        <div className="success">This is your listing.</div>
        <Link className="button buttonGhost" href="/dashboard/listings">
          Manage listing
        </Link>
      </div>
    );
  }
  if (listing.status !== "ACTIVE") {
    return <div className="error">This listing is not currently available.</div>;
  }

  async function toggleFavorite() {
    setBusy(true);
    try {
      if (saved) {
        await api(`/favorites/${listing.id}`, { method: "DELETE" });
      } else {
        await api(`/favorites/${listing.id}`, { method: "POST" });
      }
      setSaved(!saved);
      toast.success(saved ? "Removed from saved items" : "Listing saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }

  async function submitRequest() {
    setBusy(true);
    try {
      if (listing.listing_type === "EXCHANGE") {
        await api("/exchanges", {
          method: "POST",
          body: {
            listing_id: listing.id,
            offered_listing_id: offeredListingId || null,
            offered_description: offeredListingId ? null : offer.trim(),
            message: message.trim() || null,
          },
        });
        toast.success("Exchange proposal sent");
        setOffer("");
        setOfferedListingId("");
        setMessage("");
      } else {
        await api("/orders", {
          method: "POST",
          body: {
            listing_id: listing.id,
            quantity,
            fulfillment_method: method,
            message: message.trim() || null,
            delivery_address: method === "DELIVERY" ? address.trim() : null,
          },
        });
        toast.success("Food proposal sent");
        setMessage("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    const reason = window.prompt("Brief reason for reporting this listing");
    if (!reason?.trim()) return;
    try {
      await api("/reports", {
        method: "POST",
        body: {
          target_type: "LISTING",
          target_id: listing.id,
          reason: reason.trim(),
        },
      });
      toast.success("Report submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report failed");
    }
  }

  const exchangeOfferMissing =
    listing.listing_type === "EXCHANGE" &&
    !offeredListingId &&
    !offer.trim();
  const deliveryAddressMissing =
    listing.listing_type !== "EXCHANGE" &&
    method === "DELIVERY" &&
    !address.trim();

  return (
    <div className="stack">
      <button
        className="button buttonGhost"
        disabled={busy}
        onClick={toggleFavorite}
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save listing"}
      </button>

      {listing.listing_type === "EXCHANGE" ? (
        <>
          {ownListings.length > 0 && (
            <div className="field">
              <label htmlFor="offeredListing">Offer one of your listings</label>
              <select
                id="offeredListing"
                className="select"
                value={offeredListingId}
                onChange={(event) => {
                  setOfferedListingId(event.target.value);
                  if (event.target.value) setOffer("");
                }}
              >
                <option value="">Use a written offer instead</option>
                {ownListings.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title} — {item.quantity} {item.unit}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!offeredListingId && (
            <div className="field">
              <label htmlFor="offer">Describe what you will offer</label>
              <textarea
                id="offer"
                className="textarea"
                value={offer}
                onChange={(event) => setOffer(event.target.value)}
                placeholder="Example: 2 kg fresh vegetables"
                maxLength={500}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              className="input"
              type="number"
              min={1}
              max={listing.quantity}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="method">Your handover preference</label>
            <select
              id="method"
              className="select"
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as "PICKUP" | "DELIVERY")
              }
            >
              <option value="PICKUP">Pickup preferred</option>
              <option value="DELIVERY">Delivery preferred</option>
            </select>
          </div>
          {method === "DELIVERY" && (
            <div className="field">
              <label htmlFor="address">Delivery address</label>
              <textarea
                id="address"
                className="textarea"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                maxLength={500}
                required
              />
            </div>
          )}
        </>
      )}

      <div className="field">
        <label htmlFor="requestMessage">Message (optional)</label>
        <textarea
          id="requestMessage"
          className="textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add details that may help the provider decide"
          maxLength={500}
        />
      </div>
      <button
        className="button buttonPrimary"
        disabled={busy || exchangeOfferMissing || deliveryAddressMissing}
        onClick={submitRequest}
      >
        <Send size={18} />
        {busy
          ? "Sending…"
          : listing.listing_type === "EXCHANGE"
            ? "Send exchange proposal"
            : "Send proposal"}
      </button>
      <button className="button buttonGhost" onClick={report} disabled={busy}>
        <ShieldAlert size={17} />
        Report listing
      </button>
    </div>
  );
}
