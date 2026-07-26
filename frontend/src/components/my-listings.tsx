"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listing-card";
import type { Listing } from "@/types";

export function MyListings({ initial }: { initial: Listing[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(item: Listing) {
    let note: string | null = null;
    if (item.status === "RESERVED") {
      const answer = window.prompt(
        "This listing has an accepted handover. Explain why you are removing it. The accepted user will see this note.",
      );
      if (answer === null) return;
      note = answer.trim();
      if (note.length < 8) {
        toast.error("Give a short reason of at least 8 characters.");
        return;
      }
    } else if (!window.confirm("Remove this listing from public view?")) {
      return;
    }

    setBusy(item.id);
    try {
      await api(`/listings/${item.id}/remove`, {
        method: "POST",
        body: { note },
      });
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, status: "REMOVED" } : row));
      toast.success("Listing removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove listing");
    } finally {
      setBusy(null);
    }
  }

  return items.length ? (
    <div className="grid">
      {items.map((item) => (
        <div key={item.id} className="stack">
          <ListingCard listing={item} />
          <div style={{ display: "flex", gap: 8 }}>
            <Link className="button buttonGhost" href={`/listings/${item.id}`}>View</Link>
            {item.status !== "REMOVED" && item.status !== "COMPLETED" && (
              <button className="button buttonDanger" disabled={busy === item.id} onClick={() => remove(item)}>
                <Trash2 size={16} />Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty">
      <h2>No listings yet</h2>
      <Link className="button buttonPrimary" href="/share">Share food</Link>
    </div>
  );
}
