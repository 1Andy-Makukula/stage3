// KithLy Type System - The "Bible" in Code

export type UserRole = 'customer' | 'merchant' | 'admin';
export type TransactionStatus = 'pending' | 'in_escrow' | 'completed' | 'disputed' | 'cancelled';
export type HandshakeMethod = 'manual' | 'qr';
export type ShopStatus = 'pending' | 'active' | 'suspended';
export type ProductCategory = 'food' | 'electronics' | 'fashion' | 'home' | 'gifts' | 'other';

export interface District {
  id: string;
  name: string;
  province: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  profile?: UserProfile;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  nrc_number?: string;
  tpin?: string;
  district_id: string;
  district?: District;
  momo_number?: string;
  is_verified: boolean;
  profile_complete: boolean;
  avatar_url?: string;
  /**
   * Denormalized display name for document-only reads (e.g. Firebase rules).
   * Canonical `full_name` lives on {@link User}; keep in sync on write.
   */
  full_name?: string;
  role: UserRole;
  has_shop: boolean;
  shop_id?: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  /** Canonical shop title — use everywhere in UI and queries. */
  business_name: string;
  /**
   * Legacy / import alias (e.g. older Firebase docs). Prefer `business_name`.
   * @deprecated
   */
  name?: string;
  description?: string;
  tpin: string;
  district_id: string;
  district?: District;
  /** High-level category label for directory cards (food, retail, services, …). */
  category?: string;
  /** Customer-facing contact; may match owner profile phone. */
  contact_phone?: string;
  logo_url?: string;
  banner_url?: string;
  rating: number;
  total_transactions: number;
  success_rate: number;
  status: ShopStatus;
  /** KithLy onboarding / TPIN verification complete. */
  is_verified: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  shop?: Shop;
  title: string;
  description: string;
  price_zmw: number;
  stock_count: number;
  category: ProductCategory;
  images: string[];
  featured: boolean;
  is_available: boolean;
  created_at: string;
}

/** Gift recipient / message data — required for merchant fulfillment and escrow handoff. */
export interface GiftFulfillmentDetails {
  recipient_name: string;
  recipient_phone: string;
  gift_message?: string;
  /** Omitted when `send_anonymously` is true. */
  sender_name?: string;
  send_anonymously: boolean;
}

/** Assembled at checkout for persistence (Firebase / engine). */
export interface CheckoutOrderPayload {
  id: string;
  buyer_id: string;
  lines: CheckoutLineItem[];
  amount_zmw: number;
  currency: 'ZMW';
  fulfillment: GiftFulfillmentDetails;
  handshake_codes: string[];
  payment_reference?: string;
  idempotency_key?: string;
  created_at: string;
}

export interface CheckoutLineItem {
  product_id: string;
  shop_id: string;
  quantity: number;
  unit_price_zmw: number;
  title: string;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  buyer?: User;
  product_id: string;
  product?: Product;
  shop_id: string;
  shop?: Shop;
  amount_zmw: number;
  status: TransactionStatus;
  claim_code: string;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  /** Present when purchase includes personalization (checkout / escrow). */
  fulfillment?: GiftFulfillmentDetails;
}

export interface HandshakeLog {
  id: string;
  transaction_id: string;
  transaction?: Transaction;
  method: HandshakeMethod;
  verified_by?: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  shop_id?: string;
}
