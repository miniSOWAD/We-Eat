export type Role = "USER" | "MODERATOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type ListingType = "FREE" | "DISCOUNTED" | "EXCHANGE";
export type ListingStatus = "ACTIVE" | "RESERVED" | "COMPLETED" | "EXPIRED" | "REMOVED";

export interface UserPublic {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  area?: string | null;
  created_at: string;
}

export interface UserMe extends UserPublic {
  email: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  email_verified_at?: string | null;
  last_login_at?: string | null;
}

export interface AdminUser extends UserMe { updated_at: string; }

export interface ListingImage { id?: string; secure_url: string; public_id: string; position: number; }

export interface Listing {
  id: string;
  listing_type: ListingType;
  status: ListingStatus;
  title: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  original_price?: string | null;
  discounted_price?: string | null;
  exchange_for?: string | null;
  prepared_at?: string | null;
  expires_at: string;
  city: string;
  area: string;
  is_vegetarian: boolean;
  allergens?: string | null;
  images: ListingImage[];
  owner: UserPublic;
  created_at: string;
  updated_at?: string;
  is_favorited?: boolean;
  proposal_count: number;
  private_details?: { pickup_address: string; contact_phone?: string | null; delivery_notes?: string | null; } | null;
}

export interface ListingBrowse { items: Listing[]; total: number; page: number; page_size: number; pages: number; }

export interface Order {
  id: string; listing: Listing; requester: UserPublic; provider: UserPublic;
  status: "REQUESTED" | "ACCEPTED" | "REJECTED" | "READY" | "COMPLETED" | "CANCELLED";
  quantity: number; agreed_price: string; fulfillment_method: "PICKUP" | "DELIVERY";
  message?: string | null; delivery_address?: string | null;
  scheduled_for?: string | null; handoff_note?: string | null;
  requester_confirmed_at?: string | null; provider_confirmed_at?: string | null; created_at: string;
}

export interface Exchange {
  id: string; listing: Listing; offered_listing?: Listing | null; requester: UserPublic; provider: UserPublic;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  offered_description?: string | null; message?: string | null;
  fulfillment_method?: "PICKUP" | "DELIVERY" | null;
  scheduled_for?: string | null; handoff_note?: string | null;
  requester_confirmed_at?: string | null; provider_confirmed_at?: string | null; created_at: string;
}

export interface Proposal {
  kind: "ORDER" | "EXCHANGE";
  id: string;
  listing: Listing;
  requester: UserPublic;
  status: string;
  quantity?: number | null;
  agreed_price?: string | null;
  offered_listing?: Listing | null;
  offered_description?: string | null;
  message?: string | null;
  delivery_address?: string | null;
  fulfillment_method?: "PICKUP" | "DELIVERY" | null;
  scheduled_for?: string | null;
  handoff_note?: string | null;
  received_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}

export interface Favorite { id: string; listing: Listing; created_at: string; }
export interface Comment { id: string; listing_id: string; parent_comment_id?: string | null; content: string; is_deleted: boolean; user: UserPublic; created_at: string; updated_at: string; replies: Comment[]; }
export interface Report { id: string; reporter_id: string; target_type: "LISTING" | "USER" | "COMMENT"; listing_id?: string | null; user_id?: string | null; comment_id?: string | null; reason: string; details?: string | null; status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED"; resolution_note?: string | null; created_at: string; }
export interface AuditLog { id: string; actor_id?: string | null; action: string; target_type: string; target_id?: string | null; metadata_json?: Record<string, unknown> | null; created_at: string; }
export interface AdminStats { users: number; moderators: number; suspended_users: number; active_listings: number; open_reports: number; completed_orders: number; completed_exchanges: number; rescued_items: number; }

export interface IntegrationStatus {
  email: {
    mode: string;
    configured: boolean;
    sender: string;
    smtp_host?: string | null;
    missing_settings: string[];
  };
  cloudinary: {
    configured: boolean;
    cloud_name?: string | null;
    configuration_source: string;
  };
}
