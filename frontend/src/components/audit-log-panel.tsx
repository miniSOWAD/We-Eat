import type { AuditLog } from "@/types";
import styles from "./audit-log-panel.module.css";

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function compactId(value?: string | null): string {
  if (!value) return "System";
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function detailText(item: AuditLog): string {
  const metadata = item.metadata_json;
  if (!metadata) return "No additional details";

  const before = metadata.before;
  const after = metadata.after;
  if (
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object"
  ) {
    const beforeRecord = before as Record<string, unknown>;
    const afterRecord = after as Record<string, unknown>;
    const changes = Object.keys(afterRecord)
      .filter((key) => beforeRecord[key] !== afterRecord[key])
      .map((key) => `${titleCase(key)}: ${String(beforeRecord[key] ?? "—")} → ${String(afterRecord[key] ?? "—")}`);
    if (changes.length) return changes.join(" · ");
  }

  return Object.entries(metadata)
    .map(([key, value]) => `${titleCase(key)}: ${typeof value === "object" ? "Updated" : String(value)}`)
    .join(" · ");
}

export function AuditLogPanel({ items }: { items: AuditLog[] }) {
  if (!items.length) {
    return (
      <div className="empty">
        <h2>No audit records</h2>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Action</th>
            <th>Target</th>
            <th>Changes</th>
            <th>Staff reference</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td data-label="Action"><strong>{titleCase(item.action)}</strong></td>
              <td data-label="Target">
                <span>{titleCase(item.target_type)}</span>
                <small>{compactId(item.target_id)}</small>
              </td>
              <td data-label="Changes" className={styles.details}>{detailText(item)}</td>
              <td data-label="Staff reference"><span className={styles.reference}>{compactId(item.actor_id)}</span></td>
              <td data-label="Time"><time>{new Date(item.created_at).toLocaleString("en-BD")}</time></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
