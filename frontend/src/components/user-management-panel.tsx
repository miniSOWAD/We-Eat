"use client";

import { FormEvent, useState } from "react";
import { Search, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types";
import { UserAvatar } from "@/components/user-avatar";

export function UserManagementPanel({
  initial,
  canPromote,
}: {
  initial: AdminUser[];
  canPromote: boolean;
}) {
  const [users, setUsers] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    const form = new FormData(event.currentTarget);
    const term = encodeURIComponent(String(form.get("search") || ""));
    try {
      const suffix = canPromote ? "&role=USER" : "";
      setUsers(await api<AdminUser[]>(`/admin/users?search=${term}${suffix}`));
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function action(
    user: AdminUser,
    name: "make-moderator" | "suspend" | "unsuspend",
  ) {
    setBusyId(user.id);
    try {
      const updated = await api<AdminUser>(`/admin/users/${user.id}/${name}`, {
        method: "POST",
      });
      if (name === "make-moderator") {
        setUsers((value) => value.filter((item) => item.id !== user.id));
      } else {
        setUsers((value) => value.map((item) => (item.id === updated.id ? updated : item)));
      }
      toast.success(
        name === "make-moderator"
          ? "Moderator access granted"
          : name === "suspend"
            ? "User suspended"
            : "User restored",
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
        <input className="input" name="search" placeholder="Search by name, username or email" />
        <button className="button buttonPrimary" disabled={searching}>
          <Search size={17} />
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {!users.length ? (
        <div className="empty">
          <h2>No users found</h2>
          <p className="muted">Try a different name, username or email.</p>
        </div>
      ) : (
        <div className="managementTableWrap">
          <table className="dataTable managementTable managementUserTable">
            <colgroup>
              <col className="colIdentity" />
              <col className="colEmail" />
              <col className="colStatus" />
              <col className="colJoined" />
              <col className="colActions" />
            </colgroup>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="User">
                    <div className="avatarRow">
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
                      {canPromote && (
                        <button
                          className="button buttonCream buttonCompact"
                          disabled={busyId === user.id || user.status !== "ACTIVE"}
                          onClick={() => action(user, "make-moderator")}
                        >
                          <UserCog size={15} />
                          Make Moderator
                        </button>
                      )}
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
