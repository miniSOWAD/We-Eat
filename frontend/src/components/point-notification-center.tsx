"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { PointNotification, UserMe } from "@/types";
import styles from "./point-notification-center.module.css";

export function PointNotificationCenter({ user }: { user: UserMe | null }) {
  const router = useRouter();
  const [items, setItems] = useState<PointNotification[]>([]);
  const [busy, setBusy] = useState(false);
  const refreshedFor = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const next = await api<PointNotification[]>("/reputation/notifications");
      setItems(next);
      const first = next[0];
      if (first && refreshedFor.current !== first.id) {
        refreshedFor.current = first.id;
        router.refresh();
      }
    } catch {
      // Notification polling must never interrupt normal site use.
    }
  }, [router, user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    void refresh();
    const timer = window.setInterval(refresh, 15_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, user]);

  const current = items[0];
  if (!user || !current) return null;

  const positive = current.point_kind === "POSITIVE";

  async function acknowledge() {
    setBusy(true);
    try {
      await api(`/reputation/notifications/${current.id}/acknowledge`, {
        method: "POST",
      });
      setItems((value) => value.filter((item) => item.id !== current.id));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside
      className={`${styles.notice} ${positive ? styles.positive : styles.negative}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.heading}>
        {positive ? "Green point received" : "Red point received"}
      </div>
      <p>{current.message}</p>
      <div className={styles.footer}>
        <span>{items.length > 1 ? `${items.length} point updates` : "Reputation updated"}</span>
        <button type="button" onClick={acknowledge} disabled={busy}>
          OK
        </button>
      </div>
    </aside>
  );
}
