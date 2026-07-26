import type { UserPublic } from "@/types";
import styles from "./reputation-points.module.css";

export function ReputationPoints({
  user,
  compact = false,
}: {
  user: Pick<UserPublic, "positive_points" | "negative_points" | "display_name">;
  compact?: boolean;
}) {
  return (
    <span
      className={`${styles.points} ${compact ? styles.compact : ""}`}
      aria-label={`${user.display_name}: ${user.positive_points} positive points and ${user.negative_points} negative points`}
      tabIndex={0}
    >
      <span className={styles.positive}>+{user.positive_points}</span>
      <span className={styles.negative}>-{user.negative_points}</span>
      <span className={styles.tooltip} role="tooltip">
        <span>Positive points</span>
        <span>Negative points</span>
      </span>
    </span>
  );
}
