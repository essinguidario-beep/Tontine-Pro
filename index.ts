/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Type Definitions
 */

export type UserRole = 'super_admin' | 'user';
export type TontineRole = 'president' | 'treasurer' | 'secretary' | 'member';
export type TontineType = 'rotative_tirage' | 'rotative_ordre' | 'mutuelle_epargne' | 'secours_solidaire';
export type ContributionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type TontineStatus = 'active' | 'pending' | 'completed' | 'archived';
export type MemberStatus = 'active' | 'suspended' | 'late';
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'cash' | 'bank_transfer' | 'other';
export type PaymentStatus = 'confirmed' | 'pending' | 'rejected' | 'cancelled' | 'refunded';
export type BeneficiaryStatus = 'paid' | 'current' | 'upcoming' | 'delayed';
export type ExpenseCategory = 'catering_reception' | 'hall_rental' | 'bank_telecom' | 'solidarity_grant' | 'administrative' | 'other';
export type NotificationType = 'contribution_due' | 'payment_confirmed' | 'late_alert' | 'beneficiary_turn' | 'new_member' | 'new_expense' | 'invitation' | 'subscription_renewal' | 'subscription_approved' | 'general';
export type SubscriptionTier = 'free' | 'standard' | 'premium' | 'starter' | 'business';

export interface SubscriptionPaymentRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  plan: 'standard' | 'premium';
  amount_fcfa: number;
  payment_method: 'mtn_momo' | 'orange_money';
  transaction_ref: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string; // Cameroonian format +237 6XX XX XX XX
  email: string;
  avatar_url?: string;
  city: string; // e.g. Douala, Yaoundé, Bafoussam
  role: UserRole;
  subscription_tier: SubscriptionTier;
  created_at: string;
  payout_method?: 'orange_money' | 'mtn_momo';
  orange_money_number?: string;
  mtn_momo_number?: string;
}

export interface Tontine {
  id: string;
  name: string;
  description: string;
  type: TontineType;
  contribution_amount: number; // in FCFA
  frequency: ContributionFrequency;
  start_date: string;
  end_date?: string;
  total_members_target: number;
  rules_summary: string;
  status: TontineStatus;
  payout_rotation_type: 'fixed_order' | 'auction' | 'lottery';
  penalty_rate: number; // in FCFA per day or flat fee
  meeting_day_info?: string; // e.g. "Chaque 1er dimanche du mois à 15h"
  created_by: string; // profile_id
  created_at: string;
  updated_at: string;
}

export interface TontineMember {
  id: string;
  tontine_id: string;
  profile_id?: string;
  member_name: string;
  phone: string;
  email?: string;
  role: TontineRole;
  status: MemberStatus;
  shares_count: number;
  joined_at: string;
  total_contributed: number;
  total_debt: number;
  is_beneficiary_paid: boolean;
  beneficiary_cycle?: number;
  avatar_url?: string;
}

export interface Contribution {
  id: string;
  tontine_id: string;
  member_id: string;
  member_name: string;
  amount: number; // in FCFA
  cycle_number: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_ref: string;
  notes?: string;
  status: PaymentStatus;
  verified_by?: string;
  confirmed_at?: string;
  receipt_id?: string;
  created_at: string;
}

export interface BeneficiaryRound {
  id: string;
  tontine_id: string;
  member_id: string;
  member_name: string;
  cycle_number: number;
  scheduled_date: string;
  pot_amount: number; // in FCFA
  status: BeneficiaryStatus;
  payout_date?: string;
  payment_method?: PaymentMethod;
  transaction_ref?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  tontine_id: string;
  category: ExpenseCategory;
  amount: number; // in FCFA
  expense_date: string;
  description: string;
  authorized_by: string;
  reference: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface PenaltyRecord {
  id: string;
  tontine_id: string;
  member_id: string;
  member_name: string;
  reason: string;
  amount: number; // in FCFA
  due_date: string;
  status: 'unpaid' | 'paid' | 'waived';
  paid_at?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  channel: 'in_app' | 'sms' | 'whatsapp';
  link_route?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionTier;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  price_fcfa: number;
  billing_cycle: 'monthly' | 'annual';
  starts_at: string;
  expires_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subject: string;
  category: 'payment' | 'tontine' | 'technical' | 'account';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  messages: Array<{
    sender: string;
    text: string;
    date: string;
  }>;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  tontine_id?: string;
  actor_name: string;
  actor_role: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  type: 'contribution' | 'payout' | 'subscription';
  entity_id: string;
  member_name: string;
  tontine_name: string;
  amount_fcfa: number;
  payment_method: PaymentMethod;
  transaction_ref: string;
  issued_at: string;
  notes?: string;
}
