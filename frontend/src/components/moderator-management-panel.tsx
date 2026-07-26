"use client";

import { FormEvent, useState } from "react";
import { Search, ShieldCheck, ShieldOff, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { ReputationPoints } from "@/components/reputation-points";

export function ModeratorManagementPanel({ initial }: { initial: AdminUser[] }) {
  const [items, setItems] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    const term = encodeURIComponent(
      String(new FormData(event.currentTarget).get("search") || ""),
    );
    try {
      setItems(await api<AdminUser[]>(`/admin/moderators?search=${term}`));
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function action(
    user: AdminUser,
    name: "revoke-moderator" | "suspend" | "unsuspend",
  ) {
    setBusyId(user.id);
    try {
      const updated = await api<AdminUser>(`/admin/users/${user.id}/${name}`, {
        method: "POST",
      });
      if (name === "revoke-moderator") {
        setItems((value) => value.filter((item) => item.id !== user.id));
      } else {
        setItems((value) => value.map((item) => (item.id === updated.id ? updated : item)));
      }
      toast.success(
        name === "revoke-moderator"
          ? "Moderator access revoked"
          : name === "suspend"
            ? "Moderator suspended"
            : "Moderator restored",
      );
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="stack">
      <form className="searchBar" onSubmit={search}>
        <input
          className="input"
          name="search"
          placeholder="Search moderator by name, username or email"
        />
        <button className="button buttonPrimary" disabled={searching}>
          <Search size={17} />
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {!items.length ? (
        <div className="empty">
          <h2>No moderators found</h2>
        </div>
      ) : (
        <div className="managementTableWrap">
          <table className="dataTable managementTable managementModeratorTable">
            <colgroup>
              <col className="colIdentity" />
              <col className="colEmail" />
              <col className="colStatus" />
              <col className="colJoined" />
              <col className="colActions" />
            </colgroup>
            <thead>
              <tr>
                <th>Moderator</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id}>
                  <td data-label="Moderator">
                    <div className="avatarRow">
                      <ReputationPoints user={user} compact />
                      <UserAvatar user={user} />
                      <div className="tableIdentityText">
                        <strong>{user.display_name}</strong>
                        <div className="muted">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Email" className="tableEmail">
                    {user.email}
                  </td>
                  <td data-label="Status">
                    <span className="statusPill" data-status={user.status}>
                      {user.status}
                    </span>
                  </td>
                  <td data-label="Joined">
                    {new Date(user.created_at).toLocaleDateString("en-BD")}
                  </td>
                  <td data-label="Actions">
                    <div className="inlineActions managementActions">
                      <button
                        className="button buttonCream buttonCompact"
                        disabled={busyId === user.id}
                        onClick={() => action(user, "revoke-moderator")}
                      >
                        <UserRoundX size={15} />
                        Revoke Moderator
                      </button>
                      {user.status === "SUSPENDED" ? (
                        <button
                          className="button buttonGhost buttonCompact"
                          disabled={busyId === user.id}
                          onClick={() => action(user, "unsuspend")}
                        >
                          <ShieldCheck size={15} />
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          className="button buttonDanger buttonCompact"
                          disabled={busyId === user.id}
                          onClick={() => action(user, "suspend")}
                        >
                          <ShieldOff size={15} />
                          Suspend User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
