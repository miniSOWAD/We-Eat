import type { UserPublic } from "@/types";
import styles from "./user-avatar.module.css";

function initials(name: string): string {
  const letters = name.replace(/[^\p{L}\p{N}]/gu, "");
  return (letters.slice(0, 2) || "WE").toUpperCase();
}

export function UserAvatar({ user, size = "md" }: { user: Pick<UserPublic, "display_name" | "avatar_url">; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`${styles.avatar} ${styles[size]}`} aria-label={`${user.display_name} profile photo`}>
      {user.avatar_url ? <img src={user.avatar_url} alt="" /> : <span>{initials(user.display_name)}</span>}
    </span>
  );
}
