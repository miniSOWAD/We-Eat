import type { ReactNode } from "react";
import type { UserPublic } from "@/types";
import { ReputationPoints } from "@/components/reputation-points";
import { UserAvatar } from "@/components/user-avatar";
import styles from "./user-trust-identity.module.css";

export function UserTrustIdentity({
  user,
  subtitle,
  size = "md",
  compactPoints = true,
  className = "",
}: {
  user: Pick<
    UserPublic,
    | "display_name"
    | "username"
    | "avatar_url"
    | "positive_points"
    | "negative_points"
  >;
  subtitle?: ReactNode;
  size?: "sm" | "md" | "lg";
  compactPoints?: boolean;
  className?: string;
}) {
  return (
    <div className={`${styles.identity} ${className}`}>
      <div className={styles.visual}>
        <ReputationPoints user={user} compact={compactPoints} />
        <UserAvatar user={user} size={size} />
      </div>
      <div className={styles.copy}>
        <strong title={user.display_name}>{user.display_name}</strong>
        <span>{subtitle ?? `@${user.username}`}</span>
      </div>
    </div>
  );
}
