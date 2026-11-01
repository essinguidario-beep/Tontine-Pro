/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - In-Browser Relational Data Store & Audit Engine
 * Fully handles all 16 database entities, validations, duplicate prevention, and financial calculations
 */

import {
  UserProfile,
  Tontine,
  TontineMember,
  Contribution,
  BeneficiaryRound,
  Expense,
  PenaltyRecord,
  AppNotification,
  Subscription,
  SupportTicket,
  AuditLog,
  Receipt,
  PaymentMethod,
  PaymentStatus,
  SubscriptionPaymentRequest,
  SubscriptionTier,
} from '../types';
import { generateTransactionReference } from './mobileMoney';

const STORAGE_KEY = 'tontinepro_db_v1';
const CURRENT_USER_KEY = 'tontinepro_current_user';
const SUPABASE_CONFIG_KEY = 'tontinepro_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface DatabaseState {
  profiles: UserProfile[];
  tontines: Tontine[];
  members: TontineMember[];
  contributions: Contribution[];
  beneficiaries: BeneficiaryRound[];
  expenses: Expense[];
  penalties: PenaltyRecord[];
  notifications: AppNotification[];
  subscriptions: Subscription[];
  subscriptionRequests: SubscriptionPaymentRequest[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
  receipts: Receipt[];
}

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_super_admin',
    full_name: 'Dario Essingui',
    phone: '+237 670 12 34 56',
    email: 'essinguidario@gmail.com',
    avatar_url: '/src/assets/images/avatar_president_douala_1793331356280.jpg',
    city: 'Douala',
    role: 'super_admin',
    subscription_tier: 'premium',
    created_at: '2026-01-10T08:00:00Z',
    payout_method: 'orange_money',
    orange_money_number: '+237 699 33 44 55',
    mtn_momo_number: '+237 670 12 34 56',
  },
  {
    id: 'user_president_1',
    full_name: 'Jean-Paul Kamga',
    phone: '+237 699 44 21 00',
    email: 'jeanpaul.kamga@gmail.com',
    avatar_url: '/src/assets/images/avatar_president_douala_1793331356280.jpg',
    city: 'Douala',
    role: 'user',
    subscription_tier: 'business',
    created_at: '2026-01-15T09:30:00Z',
    payout_method: 'orange_money',
    orange_money_number: '+237 699 44 21 00',
    mtn_momo_number: '+237 675 88 44 11',
  },
  {
    id: 'user_treasurer_1',
    full_name: 'Marie Claire Ngo Ndjock',
    phone: '+237 677 88 99 11',
    email: 'marie.claire@gmail.com',
    avatar_url: '/src/assets/images/avatar_treasurer_yaounde_1793331357241.jpg',
    city: 'Yaoundé',
    role: 'user',
    subscription_tier: 'business',
    created_at: '2026-01-18T11:00:00Z',
    payout_method: 'mtn_momo',
    orange_money_number: '+237 695 11 88 22',
    mtn_momo_number: '+237 677 88 99 11',
  },
  {
    id: 'user_member_1',
    full_name: 'Dieudonné Fotso',
    phone: '+237 651 23 45 67',
    email: 'dieudonne.fotso@gmail.com',
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DF&backgroundColor=059669',
    city: 'Bafoussam',
    role: 'user',
    subscription_tier: 'starter',
    created_at: '2026-02-01T14:20:00Z',
    payout_method: 'orange_money',
    orange_money_number: '+237 698 77 66 55',
    mtn_momo_number: '+237 651 23 45 67',
  },
];

const INITIAL_TONTINES: Tontine[] = [
  {
    id: 'tontine_douala_cadres',
    name: 'Tontine des Ingénieurs & Cadres - Akwa',
    description: 'Tontine d’épargne et d’investissement solidaire regroupant cadres et entrepreneurs de la zone Douala.',
    type: 'rotative_ordre',
    contribution_amount: 50000,
    frequency: 'monthly',
    start_date: '2026-01-05',
    end_date: '2026-12-31',
    total_members_target: 12,
    rules_summary: 'Cotisation obligatoire avant le 5 du mois. Pénalité de 2 500 FCFA/jour de retard. Présence obligatoire aux réunions mensuelles.',
    status: 'active',
    payout_rotation_type: 'fixed_order',
    penalty_rate: 2500,
    meeting_day_info: 'Chaque 1er dimanche du mois à 15h (Akwa Douala & Visio)',
    created_by: 'user_president_1',
    created_at: '2026-01-02T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'tontine_yaounde_mokolo',
    name: 'Solidarité Commerçants Mokolo Yaoundé',
    description: 'Tontine hebdomadaire pour le renforcement du fonds de roulement des boutiques du marché Mokolo.',
    type: 'rotative_tirage',
    contribution_amount: 25000,
    frequency: 'weekly',
    start_date: '2026-02-01',
    end_date: '2026-08-30',
    total_members_target: 10,
    rules_summary: 'Versement chaque lundi matin via MTN MoMo ou Orange Money. Cagnotte remise le mercredi.',
    status: 'active',
    payout_rotation_type: 'lottery',
    penalty_rate: 1500,
    meeting_day_info: 'Chaque lundi matin à 08h au bloc B Mokolo',
    created_by: 'user_treasurer_1',
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 'tontine_famille_mbappe',
    name: 'Fonds d’Entraide Famille Mbappé',
    description: 'Secours, bourses scolaires et projets immobiliers communs de la grande famille Mbappé.',
    type: 'secours_solidaire',
    contribution_amount: 15000,
    frequency: 'monthly',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    total_members_target: 16,
    rules_summary: 'Cotisation mensuelle pour assistance santé, mariages, naissances et cagnotte annuelle.',
    status: 'active',
    payout_rotation_type: 'fixed_order',
    penalty_rate: 1000,
    meeting_day_info: 'Dernier samedi du mois à Deido',
    created_by: 'user_president_1',
    created_at: '2026-01-01T09:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
  },
];

const INITIAL_MEMBERS: TontineMember[] = [
  {
    id: 'mem_1',
    tontine_id: 'tontine_douala_cadres',
    profile_id: 'user_president_1',
    member_name: 'Jean-Paul Kamga',
    phone: '+237 699 44 21 00',
    email: 'jeanpaul.kamga@gmail.com',
    role: 'president',
    status: 'active',
    shares_count: 1,
    joined_at: '2026-01-05',
    total_contributed: 150000,
    total_debt: 0,
    is_beneficiary_paid: true,
    beneficiary_cycle: 1,
    avatar_url: '/src/assets/images/avatar_president_douala_1793331356280.jpg',
  },
  {
    id: 'mem_2',
    tontine_id: 'tontine_douala_cadres',
    profile_id: 'user_treasurer_1',
    member_name: 'Marie Claire Ngo Ndjock',
    phone: '+237 677 88 99 11',
    email: 'marie.claire@gmail.com',
    role: 'treasurer',
    status: 'active',
    shares_count: 1,
    joined_at: '2026-01-05',
    total_contributed: 150000,
    total_debt: 0,
    is_beneficiary_paid: true,
    beneficiary_cycle: 2,
    avatar_url: '/src/assets/images/avatar_treasurer_yaounde_1793331357241.jpg',
  },
  {
    id: 'mem_3',
    tontine_id: 'tontine_douala_cadres',
    profile_id: 'user_member_1',
    member_name: 'Dieudonné Fotso',
    phone: '+237 651 23 45 67',
    email: 'dieudonne.fotso@gmail.com',
    role: 'member',
    status: 'active',
    shares_count: 1,
    joined_at: '2026-01-05',
    total_contributed: 150000,
    total_debt: 0,
    is_beneficiary_paid: false,
    beneficiary_cycle: 3,
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DF&backgroundColor=059669',
  },
  {
    id: 'mem_4',
    tontine_id: 'tontine_douala_cadres',
    member_name: 'Estelle Kouam',
    phone: '+237 675 11 22 33',
    email: 'estelle.kouam@yahoo.fr',
    role: 'secretary',
    status: 'active',
    shares_count: 1,
    joined_at: '2026-01-05',
    total_contributed: 150000,
    total_debt: 0,
    is_beneficiary_paid: false,
    beneficiary_cycle: 4,
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=EK&backgroundColor=10B981',
  },
  {
    id: 'mem_5',
    tontine_id: 'tontine_douala_cadres',
    member_name: 'Alain Nguemo',
    phone: '+237 690 99 88 77',
    email: 'alain.nguemo@fintech.cm',
    role: 'member',
    status: 'late',
    shares_count: 1,
    joined_at: '2026-01-05',
    total_contributed: 100000,
    total_debt: 50000,
    is_beneficiary_paid: false,
    beneficiary_cycle: 5,
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AN&backgroundColor=047857',
  },
  {
    id: 'mem_6',
    tontine_id: 'tontine_douala_cadres',
    member_name: 'Béatrice Atangana',
    phone: '+237 671 45 67 89',
    email: 'beatrice.atangana@orange.cm',
    role: 'member',
    status: 'active',
    shares_count: 1,
    joined_at: '2026-01-05',
    total_contributed: 150000,
    total_debt: 0,
    is_beneficiary_paid: false,
    beneficiary_cycle: 6,
    avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=BA&backgroundColor=065F46',
  },
];

const INITIAL_BENEFICIARIES: BeneficiaryRound[] = [
  {
    id: 'ben_1',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_1',
    member_name: 'Jean-Paul Kamga',
    cycle_number: 1,
    scheduled_date: '2026-01-05',
    pot_amount: 300000,
    status: 'paid',
    payout_date: '2026-01-06',
    payment_method: 'mtn_momo',
    transaction_ref: 'PAY-20260106-9A1B',
    notes: 'Cagnotte cycle 1 payée via MTN MoMo',
  },
  {
    id: 'ben_2',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_2',
    member_name: 'Marie Claire Ngo Ndjock',
    cycle_number: 2,
    scheduled_date: '2026-02-05',
    pot_amount: 300000,
    status: 'paid',
    payout_date: '2026-02-06',
    payment_method: 'orange_money',
    transaction_ref: 'PAY-20260206-3F8E',
    notes: 'Cagnotte cycle 2 payée via Orange Money',
  },
  {
    id: 'ben_3',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_3',
    member_name: 'Dieudonné Fotso',
    cycle_number: 3,
    scheduled_date: '2026-03-05',
    pot_amount: 300000,
    status: 'current',
    notes: 'Prochain bénéficiaire du mois en cours',
  },
  {
    id: 'ben_4',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_4',
    member_name: 'Estelle Kouam',
    cycle_number: 4,
    scheduled_date: '2026-04-05',
    pot_amount: 300000,
    status: 'upcoming',
  },
  {
    id: 'ben_5',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_5',
    member_name: 'Alain Nguemo',
    cycle_number: 5,
    scheduled_date: '2026-05-05',
    pot_amount: 300000,
    status: 'upcoming',
  },
  {
    id: 'ben_6',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_6',
    member_name: 'Béatrice Atangana',
    cycle_number: 6,
    scheduled_date: '2026-06-05',
    pot_amount: 300000,
    status: 'upcoming',
  },
];

const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'cot_1',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_1',
    member_name: 'Jean-Paul Kamga',
    amount: 50000,
    cycle_number: 1,
    payment_date: '2026-01-04',
    payment_method: 'mtn_momo',
    transaction_ref: 'COT-20260104-9841',
    status: 'confirmed',
    notes: 'Cotisation ponctuelle cycle 1',
    confirmed_at: '2026-01-04T14:00:00Z',
    created_at: '2026-01-04T13:58:00Z',
    receipt_id: 'rec_cot_1',
  },
  {
    id: 'cot_2',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_2',
    member_name: 'Marie Claire Ngo Ndjock',
    amount: 50000,
    cycle_number: 1,
    payment_date: '2026-01-05',
    payment_method: 'orange_money',
    transaction_ref: 'COT-20260105-7712',
    status: 'confirmed',
    notes: 'Cotisation Orange Money',
    confirmed_at: '2026-01-05T09:12:00Z',
    created_at: '2026-01-05T09:10:00Z',
    receipt_id: 'rec_cot_2',
  },
  {
    id: 'cot_3',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_3',
    member_name: 'Dieudonné Fotso',
    amount: 50000,
    cycle_number: 1,
    payment_date: '2026-01-05',
    payment_method: 'mtn_momo',
    transaction_ref: 'COT-20260105-3341',
    status: 'confirmed',
    notes: 'Cotisation MoMo Akwa',
    confirmed_at: '2026-01-05T10:30:00Z',
    created_at: '2026-01-05T10:28:00Z',
    receipt_id: 'rec_cot_3',
  },
  {
    id: 'cot_4',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_4',
    member_name: 'Estelle Kouam',
    amount: 50000,
    cycle_number: 1,
    payment_date: '2026-01-05',
    payment_method: 'cash',
    transaction_ref: 'COT-20260105-8899',
    status: 'confirmed',
    notes: 'Versement en réunion physique',
    confirmed_at: '2026-01-05T16:00:00Z',
    created_at: '2026-01-05T15:55:00Z',
    receipt_id: 'rec_cot_4',
  },
  {
    id: 'cot_5',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_6',
    member_name: 'Béatrice Atangana',
    amount: 50000,
    cycle_number: 1,
    payment_date: '2026-01-05',
    payment_method: 'bank_transfer',
    transaction_ref: 'COT-20260105-4421',
    status: 'confirmed',
    notes: 'Virement Afriland First Bank',
    confirmed_at: '2026-01-05T17:20:00Z',
    created_at: '2026-01-05T17:15:00Z',
    receipt_id: 'rec_cot_5',
  },
  {
    id: 'cot_6',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_3',
    member_name: 'Dieudonné Fotso',
    amount: 50000,
    cycle_number: 2,
    payment_date: '2026-02-04',
    payment_method: 'mtn_momo',
    transaction_ref: 'COT-20260204-1290',
    status: 'confirmed',
    notes: 'Cotisation cycle 2 validée',
    confirmed_at: '2026-02-04T11:00:00Z',
    created_at: '2026-02-04T10:55:00Z',
    receipt_id: 'rec_cot_6',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    tontine_id: 'tontine_douala_cadres',
    category: 'catering_reception',
    amount: 35000,
    expense_date: '2026-01-05',
    description: 'Collation & boissons de la réunion solennelle de rentrée à Akwa',
    authorized_by: 'Marie Claire Ngo Ndjock (Trésorière)',
    reference: 'DEP-20260105-001',
    status: 'approved',
    created_at: '2026-01-05T18:00:00Z',
  },
  {
    id: 'exp_2',
    tontine_id: 'tontine_douala_cadres',
    category: 'bank_telecom',
    amount: 5000,
    expense_date: '2026-02-01',
    description: 'Frais de notifications SMS et passerelle Mobile Money',
    authorized_by: 'Jean-Paul Kamga (Président)',
    reference: 'DEP-20260201-002',
    status: 'approved',
    created_at: '2026-02-01T09:00:00Z',
  },
];

const INITIAL_PENALTIES: PenaltyRecord[] = [
  {
    id: 'pen_1',
    tontine_id: 'tontine_douala_cadres',
    member_id: 'mem_5',
    member_name: 'Alain Nguemo',
    reason: 'Retard de paiement cycle 2 (échéance dépassée de 4 jours)',
    amount: 5000,
    due_date: '2026-02-10',
    status: 'unpaid',
    created_at: '2026-02-09T08:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    user_id: 'user_president_1',
    title: 'Cotisation reçue',
    message: 'Dieudonné Fotso a cotisé 50 000 FCFA via MTN MoMo.',
    type: 'payment_confirmed',
    is_read: false,
    channel: 'in_app',
    link_route: 'cotisations',
    created_at: '2026-02-04T11:00:00Z',
  },
  {
    id: 'notif_2',
    user_id: 'user_president_1',
    title: 'Prochain bénéficiaire',
    message: 'Dieudonné Fotso est le bénéficiaire de la cagnotte du cycle 3.',
    type: 'beneficiary_turn',
    is_read: false,
    channel: 'whatsapp',
    link_route: 'beneficiaires',
    created_at: '2026-02-10T14:30:00Z',
  },
  {
    id: 'notif_3',
    user_id: 'user_president_1',
    title: 'Alerte Retard',
    message: 'Alain Nguemo a une cotisation de 50 000 FCFA en attente de régularisation.',
    type: 'late_alert',
    is_read: true,
    channel: 'sms',
    link_route: 'membres',
    created_at: '2026-02-09T08:15:00Z',
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    user_id: 'user_president_1',
    plan: 'standard',
    status: 'active',
    price_fcfa: 2000,
    billing_cycle: 'monthly',
    starts_at: '2026-02-01T00:00:00Z',
    expires_at: '2026-03-31T00:00:00Z',
  },
];

const INITIAL_SUBSCRIPTION_REQUESTS: SubscriptionPaymentRequest[] = [
  {
    id: 'sub_req_1',
    user_id: 'user_president_1',
    user_name: 'Jean-Paul Kamga',
    user_phone: '+237 699 44 21 00',
    plan: 'standard',
    amount_fcfa: 2000,
    payment_method: 'orange_money',
    transaction_ref: 'OM-20260210-9981',
    submitted_at: '2026-02-10T14:30:00Z',
    status: 'approved',
    reviewed_at: '2026-02-10T14:35:00Z',
    reviewed_by: 'Dario Essingui (Super Admin)',
  },
  {
    id: 'sub_req_2',
    user_id: 'user_treasurer_1',
    user_name: 'Marie Claire Ngo Ndjock',
    user_phone: '+237 677 88 99 11',
    plan: 'premium',
    amount_fcfa: 5000,
    payment_method: 'orange_money',
    transaction_ref: 'OM-20260301-4821',
    submitted_at: '2026-03-01T10:15:00Z',
    status: 'pending',
  },
];

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec_cot_1',
    receipt_number: 'REC-2026-0001',
    type: 'contribution',
    entity_id: 'cot_1',
    member_name: 'Jean-Paul Kamga',
    tontine_name: 'Tontine des Ingénieurs & Cadres - Akwa',
    amount_fcfa: 50000,
    payment_method: 'mtn_momo',
    transaction_ref: 'COT-20260104-9841',
    issued_at: '2026-01-04T14:00:00Z',
    notes: 'Cotisation validée par TontinePro Mobile Money Gateway',
  },
  {
    id: 'rec_cot_2',
    receipt_number: 'REC-2026-0002',
    type: 'contribution',
    entity_id: 'cot_2',
    member_name: 'Marie Claire Ngo Ndjock',
    tontine_name: 'Tontine des Ingénieurs & Cadres - Akwa',
    amount_fcfa: 50000,
    payment_method: 'orange_money',
    transaction_ref: 'COT-20260105-7712',
    issued_at: '2026-01-05T09:12:00Z',
    notes: 'Certifié conforme par la trésorerie TontinePro',
  },
];

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket_1',
    user_id: 'user_president_1',
    user_name: 'Jean-Paul Kamga',
    user_email: 'jeanpaul.kamga@gmail.com',
    user_phone: '+237 699 44 21 00',
    subject: 'Intégration du webhook MTN MoMo pour prélèvements automatiques',
    category: 'payment',
    priority: 'high',
    status: 'in_progress',
    messages: [
      {
        sender: 'Jean-Paul Kamga',
        text: 'Bonjour le support TontinePro, nous souhaitons activer le prélèvement direct sur les comptes MTN MoMo de nos 12 membres.',
        date: '2026-02-12T10:00:00Z',
      },
      {
        sender: 'Support TontinePro',
        text: 'Bonjour M. Kamga. La passerelle MTN Mobile Money Cameroon est prête. Vous pouvez renseigner vos identifiants marchands dans Paramètres > Intégrations.',
        date: '2026-02-12T11:30:00Z',
      },
    ],
    created_at: '2026-02-12T10:00:00Z',
    updated_at: '2026-02-12T11:30:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    tontine_id: 'tontine_douala_cadres',
    actor_name: 'Système TontinePro',
    actor_role: 'system',
    action: 'INIT_TONTINE',
    details: 'Création de la tontine "Tontine des Ingénieurs & Cadres - Akwa" avec 12 parts cibles.',
    timestamp: '2026-01-02T10:00:00Z',
  },
  {
    id: 'log_2',
    tontine_id: 'tontine_douala_cadres',
    actor_name: 'Marie Claire Ngo Ndjock',
    actor_role: 'Trésorière',
    action: 'CONFIRM_PAYMENT',
    details: 'Validation de la cotisation de 50 000 FCFA de Dieudonné Fotso (COT-20260204-1290).',
    timestamp: '2026-02-04T11:00:00Z',
  },
];

class StorageService {
  private db: DatabaseState;
  private currentUser: UserProfile;
  private supabaseConfig: SupabaseConfig;
  private listeners: Array<() => void> = [];

  constructor() {
    this.db = this.loadState();
    this.currentUser = this.loadCurrentUser();
    this.supabaseConfig = this.loadSupabaseConfig();
  }

  private loadState(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.subscriptionRequests) {
          parsed.subscriptionRequests = INITIAL_SUBSCRIPTION_REQUESTS;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }

    const initialState: DatabaseState = {
      profiles: INITIAL_PROFILES,
      tontines: INITIAL_TONTINES,
      members: INITIAL_MEMBERS,
      contributions: INITIAL_CONTRIBUTIONS,
      beneficiaries: INITIAL_BENEFICIARIES,
      expenses: INITIAL_EXPENSES,
      penalties: INITIAL_PENALTIES,
      notifications: INITIAL_NOTIFICATIONS,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      subscriptionRequests: INITIAL_SUBSCRIPTION_REQUESTS,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      auditLogs: INITIAL_AUDIT_LOGS,
      receipts: INITIAL_RECEIPTS,
    };
    this.saveState(initialState);
    return initialState;
  }

  private saveState(state: DatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.db = state;
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save TontinePro database state:', e);
    }
  }

  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying storage listener:', err);
      }
    }
  }

  private loadCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    // Default to President Jean-Paul Kamga for rich dashboard initial view
    return INITIAL_PROFILES[1];
  }

  private loadSupabaseConfig(): SupabaseConfig {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return {
      url: '',
      anonKey: '',
      isConnected: false,
    };
  }

  // --- Auth & Users ---
  getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  setCurrentUser(user: UserProfile): void {
    this.currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  getProfiles(): UserProfile[] {
    return [...this.db.profiles];
  }

  updateProfileTier(userId: string, tier: SubscriptionTier): void {
    const updatedProfiles = this.db.profiles.map((p) =>
      p.id === userId ? { ...p, subscription_tier: tier } : p
    );
    this.saveState({ ...this.db, profiles: updatedProfiles });
    if (this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, subscription_tier: tier };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    }
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    let targetProfile = this.db.profiles.find((p) => p.id === userId);
    let updatedProfile: UserProfile;

    if (targetProfile) {
      updatedProfile = { ...targetProfile, ...updates };
      const updatedProfiles = this.db.profiles.map((p) =>
        p.id === userId ? updatedProfile : p
      );
      this.saveState({ ...this.db, profiles: updatedProfiles });
    } else {
      updatedProfile = { ...this.currentUser, ...updates };
      this.saveState({ ...this.db, profiles: [...this.db.profiles, updatedProfile] });
    }

    if (this.currentUser.id === userId) {
      this.currentUser = updatedProfile;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    }

    this.logAudit({
      actor_name: updatedProfile.full_name,
      actor_role: updatedProfile.role === 'super_admin' ? 'Super Admin' : 'Responsable Tontine',
      action: 'USER_PROFILE_UPDATE',
      details: `Mise à jour durable du compte: Moyen actif: ${updatedProfile.payout_method === 'mtn_momo' ? 'MTN Mobile Money' : 'Orange Money'}, OM: ${updatedProfile.orange_money_number || 'Non renseigné'}, MTN: ${updatedProfile.mtn_momo_number || 'Non renseigné'}`,
    });

    this.notifyListeners();
    return updatedProfile;
  }

  registerUser(data: {
    fullName: string;
    phone: string;
    email: string;
    city?: string;
  }): UserProfile {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email.toLowerCase(),
      city: data.city || 'Douala',
      role: 'user',
      subscription_tier: 'starter',
      created_at: new Date().toISOString(),
    };

    const updatedProfiles = [...this.db.profiles, newUser];
    this.saveState({ ...this.db, profiles: updatedProfiles });
    this.setCurrentUser(newUser);

    this.logAudit({
      actor_name: newUser.full_name,
      actor_role: 'Nouveau membre',
      action: 'USER_REGISTER',
      details: `Création de compte pour ${newUser.full_name} (${newUser.phone})`,
    });

    return newUser;
  }

  // --- Supabase Live Config ---
  getSupabaseConfig(): SupabaseConfig {
    return { ...this.supabaseConfig };
  }

  setSupabaseConfig(config: SupabaseConfig): void {
    this.supabaseConfig = config;
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  }

  // --- Tontines CRUD ---
  getTontines(): Tontine[] {
    return [...this.db.tontines];
  }

  getTontineById(id: string): Tontine | undefined {
    return this.db.tontines.find((t) => t.id === id);
  }

  createTontine(
    tontineData: Omit<Tontine, 'id' | 'created_at' | 'updated_at'>,
    creator?: UserProfile
  ): Tontine {
    const activeCreator = creator || this.currentUser;

    const newTontine: Tontine = {
      ...tontineData,
      id: `tontine_${Date.now()}`,
      created_by: activeCreator.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newTontine, ...this.db.tontines];

    // Automatically add creator as founding president member
    const newMember: TontineMember = {
      id: `mem_${Date.now()}`,
      tontine_id: newTontine.id,
      profile_id: activeCreator.id,
      member_name: activeCreator.full_name,
      phone: activeCreator.phone,
      email: activeCreator.email,
      role: 'president',
      status: 'active',
      shares_count: 1,
      joined_at: newTontine.start_date || new Date().toISOString().slice(0, 10),
      total_contributed: 0,
      total_debt: 0,
      is_beneficiary_paid: false,
      avatar_url: activeCreator.avatar_url,
    };

    // Automatically generate first beneficiary round for this new tontine
    const newBeneficiary: BeneficiaryRound = {
      id: `ben_${Date.now()}`,
      tontine_id: newTontine.id,
      member_id: newMember.id,
      member_name: newMember.member_name,
      cycle_number: 1,
      scheduled_date: newTontine.start_date,
      pot_amount: newTontine.contribution_amount * (newTontine.total_members_target || 1),
      status: 'upcoming',
      notes: 'Premier tour de rotation assigné au fondateur de la tontine',
    };

    const newNotification: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: activeCreator.id,
      title: 'Tontine enregistrée avec succès',
      message: `La tontine "${newTontine.name}" est créée. Part : ${newTontine.contribution_amount} FCFA (${newTontine.frequency}).`,
      type: 'general',
      is_read: false,
      channel: 'in_app',
      link_route: 'tontines',
      created_at: new Date().toISOString(),
    };

    this.saveState({
      ...this.db,
      tontines: updated,
      members: [...this.db.members, newMember],
      beneficiaries: [...this.db.beneficiaries, newBeneficiary],
      notifications: [newNotification, ...this.db.notifications],
    });

    this.logAudit({
      tontine_id: newTontine.id,
      actor_name: activeCreator.full_name,
      actor_role: 'Président',
      action: 'CREATE_TONTINE',
      details: `Création de la tontine "${newTontine.name}" avec cotisation de ${newTontine.contribution_amount} FCFA`,
    });

    return newTontine;
  }

  updateTontine(id: string, updates: Partial<Tontine>): Tontine | null {
    const index = this.db.tontines.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTontine: Tontine = {
      ...this.db.tontines[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const newTontines = [...this.db.tontines];
    newTontines[index] = updatedTontine;
    this.saveState({ ...this.db, tontines: newTontines });

    this.logAudit({
      tontine_id: id,
      actor_name: this.currentUser.full_name,
      actor_role: 'Admin',
      action: 'UPDATE_TONTINE',
      details: `Modification des paramètres de la tontine "${updatedTontine.name}"`,
    });

    return updatedTontine;
  }

  // --- Members CRUD ---
  getMembers(tontineId?: string): TontineMember[] {
    if (tontineId) {
      return this.db.members.filter((m) => m.tontine_id === tontineId);
    }
    return [...this.db.members];
  }

  addMember(memberData: Omit<TontineMember, 'id' | 'total_contributed' | 'total_debt' | 'is_beneficiary_paid'>): TontineMember {
    const newMember: TontineMember = {
      ...memberData,
      id: `mem_${Date.now()}`,
      total_contributed: 0,
      total_debt: 0,
      is_beneficiary_paid: false,
      avatar_url: memberData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(memberData.member_name)}&backgroundColor=059669`,
    };

    const updated = [...this.db.members, newMember];
    this.saveState({ ...this.db, members: updated });

    this.logAudit({
      tontine_id: memberData.tontine_id,
      actor_name: this.currentUser.full_name,
      actor_role: 'Bureau Tontine',
      action: 'ADD_MEMBER',
      details: `Ajout du membre ${newMember.member_name} (${newMember.role})`,
    });

    return newMember;
  }

  updateMember(id: string, updates: Partial<TontineMember>): TontineMember | null {
    const index = this.db.members.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updatedMember = { ...this.db.members[index], ...updates };
    const newMembers = [...this.db.members];
    newMembers[index] = updatedMember;
    this.saveState({ ...this.db, members: newMembers });
    return updatedMember;
  }

  // --- Contributions CRUD ---
  getContributions(tontineId?: string): Contribution[] {
    if (tontineId) {
      return this.db.contributions.filter((c) => c.tontine_id === tontineId);
    }
    return [...this.db.contributions];
  }

  recordContribution(data: {
    tontine_id: string;
    member_id: string;
    amount: number;
    payment_method: PaymentMethod;
    transaction_ref?: string;
    notes?: string;
    payment_date?: string;
  }): { success: boolean; contribution?: Contribution; receipt?: Receipt; error?: string } {
    const tontine = this.getTontineById(data.tontine_id);
    const member = this.db.members.find((m) => m.id === data.member_id);

    if (!tontine || !member) {
      return { success: false, error: 'Tontine ou membre introuvable' };
    }

    const txRef = data.transaction_ref || generateTransactionReference('COT');

    // Duplicate check
    const existingTx = this.db.contributions.find((c) => c.transaction_ref === txRef);
    if (existingTx) {
      return { success: false, error: `Référence de transaction "${txRef}" déjà enregistrée.` };
    }

    const receiptId = `rec_${Date.now()}`;
    const newContribution: Contribution = {
      id: `cot_${Date.now()}`,
      tontine_id: data.tontine_id,
      member_id: data.member_id,
      member_name: member.member_name,
      amount: data.amount,
      cycle_number: 1,
      payment_date: data.payment_date || new Date().toISOString().slice(0, 10),
      payment_method: data.payment_method,
      transaction_ref: txRef,
      notes: data.notes,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      receipt_id: receiptId,
      created_at: new Date().toISOString(),
    };

    const newReceipt: Receipt = {
      id: receiptId,
      receipt_number: `REC-2026-${String(this.db.receipts.length + 1).padStart(4, '0')}`,
      type: 'contribution',
      entity_id: newContribution.id,
      member_name: member.member_name,
      tontine_name: tontine.name,
      amount_fcfa: data.amount,
      payment_method: data.payment_method,
      transaction_ref: txRef,
      issued_at: new Date().toISOString(),
      notes: data.notes || 'Paiement confirmé par TontinePro',
    };

    // Update member's total contributed
    const updatedMembers = this.db.members.map((m) => {
      if (m.id === data.member_id) {
        return {
          ...m,
          total_contributed: m.total_contributed + data.amount,
          status: 'active' as const,
          total_debt: Math.max(0, m.total_debt - data.amount),
        };
      }
      return m;
    });

    this.saveState({
      ...this.db,
      contributions: [newContribution, ...this.db.contributions],
      receipts: [newReceipt, ...this.db.receipts],
      members: updatedMembers,
    });

    this.logAudit({
      tontine_id: data.tontine_id,
      actor_name: this.currentUser.full_name,
      actor_role: 'Trésorier',
      action: 'RECORD_CONTRIBUTION',
      details: `Enregistrement de ${data.amount} FCFA pour ${member.member_name} (${txRef})`,
    });

    return { success: true, contribution: newContribution, receipt: newReceipt };
  }

  createMember(memberData: Omit<TontineMember, 'id' | 'total_contributed' | 'total_debt' | 'is_beneficiary_paid'>): TontineMember {
    return this.addMember(memberData);
  }

  createContribution(data: {
    tontine_id: string;
    member_id: string;
    amount: number;
    payment_method: PaymentMethod;
    transaction_ref?: string;
    notes?: string;
    payment_date?: string;
    status?: PaymentStatus;
    cycle_number?: number;
  }): Contribution {
    const res = this.recordContribution(data);
    if (!res.success || !res.contribution) {
      throw new Error(res.error || 'Erreur lors de l’enregistrement de la cotisation');
    }
    return res.contribution;
  }

  updateContributionStatus(id: string, newStatus: PaymentStatus): void {
    const index = this.db.contributions.findIndex((c) => c.id === id);
    if (index === -1) return;

    const oldStatus = this.db.contributions[index].status;
    const target = this.db.contributions[index];

    const updated = [...this.db.contributions];
    updated[index] = { ...target, status: newStatus };

    // Update financial impact on member
    const updatedMembers = this.db.members.map((m) => {
      if (m.id === target.member_id) {
        let diff = 0;
        if (oldStatus === 'confirmed' && newStatus !== 'confirmed') {
          diff = -target.amount;
        } else if (oldStatus !== 'confirmed' && newStatus === 'confirmed') {
          diff = target.amount;
        }
        return {
          ...m,
          total_contributed: Math.max(0, m.total_contributed + diff),
        };
      }
      return m;
    });

    this.saveState({ ...this.db, contributions: updated, members: updatedMembers });

    this.logAudit({
      tontine_id: target.tontine_id,
      actor_name: this.currentUser.full_name,
      actor_role: 'Admin',
      action: 'CHANGE_PAYMENT_STATUS',
      details: `Statut de la cotisation ${target.transaction_ref} changé de ${oldStatus} à ${newStatus}`,
    });
  }

  // --- Beneficiaries & Payouts ---
  getBeneficiaries(tontineId?: string): BeneficiaryRound[] {
    if (tontineId) {
      return this.db.beneficiaries.filter((b) => b.tontine_id === tontineId);
    }
    return [...this.db.beneficiaries];
  }

  recordPayout(beneficiaryId: string, paymentMethod: PaymentMethod, notes?: string): { success: boolean; error?: string } {
    const target = this.db.beneficiaries.find((b) => b.id === beneficiaryId);
    if (!target) return { success: false, error: 'Bénéficiaire introuvable' };

    const txRef = generateTransactionReference('PAY');
    const updatedBeneficiaries = this.db.beneficiaries.map((b) => {
      if (b.id === beneficiaryId) {
        return {
          ...b,
          status: 'paid' as const,
          payout_date: new Date().toISOString().slice(0, 10),
          payment_method: paymentMethod,
          transaction_ref: txRef,
          notes: notes || 'Versement de la cagnotte effectué',
        };
      }
      return b;
    });

    // Mark member as paid
    const updatedMembers = this.db.members.map((m) => {
      if (m.id === target.member_id) {
        return { ...m, is_beneficiary_paid: true };
      }
      return m;
    });

    this.saveState({
      ...this.db,
      beneficiaries: updatedBeneficiaries,
      members: updatedMembers,
    });

    this.logAudit({
      tontine_id: target.tontine_id,
      actor_name: this.currentUser.full_name,
      actor_role: 'Trésorier',
      action: 'PAYOUT_BENEFICIARY',
      details: `Paiement de la cagnotte de ${target.pot_amount} FCFA à ${target.member_name} (${txRef})`,
    });

    return { success: true };
  }

  reorderBeneficiaries(tontineId: string, newOrder: BeneficiaryRound[]): void {
    const otherTontineBens = this.db.beneficiaries.filter((b) => b.tontine_id !== tontineId);
    // Renumber cycles sequentially
    const renumbered = newOrder.map((b, idx) => ({
      ...b,
      cycle_number: idx + 1,
    }));

    this.saveState({
      ...this.db,
      beneficiaries: [...otherTontineBens, ...renumbered],
    });

    this.logAudit({
      tontine_id: tontineId,
      actor_name: this.currentUser.full_name,
      actor_role: 'Bureau',
      action: 'REORDER_BENEFICIARIES',
      details: `Modification de l'ordre de passage des bénéficiaires`,
    });
  }

  // --- Expenses & Treasury ---
  getExpenses(tontineId?: string): Expense[] {
    if (tontineId) {
      return this.db.expenses.filter((e) => e.tontine_id === tontineId);
    }
    return [...this.db.expenses];
  }

  recordExpense(data: Omit<Expense, 'id' | 'reference' | 'created_at'>): Expense {
    const ref = generateTransactionReference('DEP');
    const newExpense: Expense = {
      ...data,
      id: `exp_${Date.now()}`,
      reference: ref,
      created_at: new Date().toISOString(),
    };

    this.saveState({
      ...this.db,
      expenses: [newExpense, ...this.db.expenses],
    });

    this.logAudit({
      tontine_id: data.tontine_id,
      actor_name: this.currentUser.full_name,
      actor_role: 'Trésorier',
      action: 'RECORD_EXPENSE',
      details: `Enregistrement d'une dépense de ${data.amount} FCFA (${data.description})`,
    });

    return newExpense;
  }

  // --- Penalties ---
  getPenalties(tontineId?: string): PenaltyRecord[] {
    if (tontineId) {
      return this.db.penalties.filter((p) => p.tontine_id === tontineId);
    }
    return [...this.db.penalties];
  }

  resolvePenalty(id: string, action: 'paid' | 'waived'): void {
    const updated = this.db.penalties.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: action,
          paid_at: action === 'paid' ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });
    this.saveState({ ...this.db, penalties: updated });
  }

  // --- Financial Calculations & Overview ---
  getFinancialSummary(tontineId?: string) {
    const contributions = this.getContributions(tontineId).filter((c) => c.status === 'confirmed');
    const totalCollected = contributions.reduce((acc, c) => acc + c.amount, 0);

    const expenses = this.getExpenses(tontineId).filter((e) => e.status === 'approved');
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    const beneficiaries = this.getBeneficiaries(tontineId).filter((b) => b.status === 'paid');
    const totalPayouts = beneficiaries.reduce((acc, b) => acc + b.pot_amount, 0);

    const members = this.getMembers(tontineId);
    const totalMembers = members.length;
    const lateMembers = members.filter((m) => m.status === 'late' || m.total_debt > 0);
    const totalLateDebt = lateMembers.reduce((acc, m) => acc + m.total_debt, 0);

    // Available cash balance
    const cashBalance = totalCollected - totalPayouts - totalExpenses;

    return {
      totalCollected,
      totalExpenses,
      totalPayouts,
      cashBalance,
      totalMembers,
      lateMembersCount: lateMembers.length,
      totalLateDebt,
    };
  }

  // --- Receipts & Audits ---
  getReceipts(): Receipt[] {
    return [...this.db.receipts];
  }

  getAuditLogs(tontineId?: string): AuditLog[] {
    if (tontineId) {
      return this.db.auditLogs.filter((l) => l.tontine_id === tontineId);
    }
    return [...this.db.auditLogs];
  }

  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const newLog: AuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.saveState({
      ...this.db,
      auditLogs: [newLog, ...this.db.auditLogs].slice(0, 100), // maintain last 100
    });
  }

  // --- Notifications ---
  getNotifications(): AppNotification[] {
    return [...this.db.notifications];
  }

  markNotificationAsRead(id: string): void {
    const updated = this.db.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.saveState({ ...this.db, notifications: updated });
  }

  markAllNotificationsAsRead(): void {
    const updated = this.db.notifications.map((n) => ({ ...n, is_read: true }));
    this.saveState({ ...this.db, notifications: updated });
  }

  // --- Support Tickets ---
  getSupportTickets(): SupportTicket[] {
    return [...this.db.supportTickets];
  }

  createSupportTicket(data: {
    subject: string;
    category: 'payment' | 'tontine' | 'technical' | 'account';
    priority: 'low' | 'medium' | 'high';
    initialMessage: string;
  }): SupportTicket {
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      user_id: this.currentUser.id,
      user_name: this.currentUser.full_name,
      user_email: this.currentUser.email,
      user_phone: this.currentUser.phone,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: 'open',
      messages: [
        {
          sender: this.currentUser.full_name,
          text: data.initialMessage,
          date: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.saveState({
      ...this.db,
      supportTickets: [newTicket, ...this.db.supportTickets],
    });
    return newTicket;
  }

  // --- Subscription Requests & Quotas (TontinePro Lite) ---
  getSubscriptionRequests(): SubscriptionPaymentRequest[] {
    return [...(this.db.subscriptionRequests || [])];
  }

  submitSubscriptionPayment(data: {
    user_id: string;
    user_name: string;
    user_phone: string;
    plan: 'standard' | 'premium';
    amount_fcfa: number;
    payment_method: 'mtn_momo' | 'orange_money';
    transaction_ref: string;
  }): SubscriptionPaymentRequest {
    const newRequest: SubscriptionPaymentRequest = {
      id: `sub_req_${Date.now()}`,
      user_id: data.user_id,
      user_name: data.user_name,
      user_phone: data.user_phone,
      plan: data.plan,
      amount_fcfa: data.amount_fcfa,
      payment_method: data.payment_method,
      transaction_ref: data.transaction_ref,
      submitted_at: new Date().toISOString(),
      status: 'pending',
    };

    const updatedRequests = [newRequest, ...(this.db.subscriptionRequests || [])];

    // Notification for user and admin
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: data.user_id,
      title: `Demande d'abonnement ${data.plan.toUpperCase()} transmise`,
      message: `Votre référence de paiement Mobile Money (${data.transaction_ref}) a bien été transmise. Un administrateur la vérifiera sous peu.`,
      type: 'general',
      is_read: false,
      channel: 'in_app',
      link_route: 'abonnement',
      created_at: new Date().toISOString(),
    };

    this.saveState({
      ...this.db,
      subscriptionRequests: updatedRequests,
      notifications: [newNotification, ...this.db.notifications],
    });

    this.logAudit({
      actor_name: data.user_name,
      actor_role: 'Utilisateur',
      action: 'SUBMIT_SUBSCRIPTION_PAYMENT',
      details: `Demande d'abonnement ${data.plan.toUpperCase()} (${data.amount_fcfa} FCFA) via ${data.payment_method} - Réf: ${data.transaction_ref}`,
    });

    return newRequest;
  }

  approveSubscriptionPayment(requestId: string, adminName: string): boolean {
    const req = (this.db.subscriptionRequests || []).find((r) => r.id === requestId);
    if (!req) return false;

    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Update request
    const updatedRequests = (this.db.subscriptionRequests || []).map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            reviewed_at: now.toISOString(),
            reviewed_by: adminName,
          }
        : r
    );

    // Update User Profile tier
    const updatedProfiles = this.db.profiles.map((p) =>
      p.id === req.user_id ? { ...p, subscription_tier: req.plan } : p
    );

    // Update or add active subscription
    const existingSubIndex = this.db.subscriptions.findIndex((s) => s.user_id === req.user_id);
    const newSub: Subscription = {
      id: existingSubIndex !== -1 ? this.db.subscriptions[existingSubIndex].id : `sub_${Date.now()}`,
      user_id: req.user_id,
      plan: req.plan,
      status: 'active',
      price_fcfa: req.amount_fcfa,
      billing_cycle: 'monthly',
      starts_at: now.toISOString(),
      expires_at: expiry.toISOString(),
    };

    let updatedSubs = [...this.db.subscriptions];
    if (existingSubIndex !== -1) {
      updatedSubs[existingSubIndex] = newSub;
    } else {
      updatedSubs.push(newSub);
    }

    // Generate Subscription Receipt
    const newReceipt: Receipt = {
      id: `rec_sub_${Date.now()}`,
      receipt_number: `REC-SUB-${now.getFullYear()}-${String(this.db.receipts.length + 1).padStart(4, '0')}`,
      type: 'subscription',
      entity_id: req.id,
      member_name: req.user_name,
      tontine_name: `Abonnement TontinePro Lite - ${req.plan.toUpperCase()}`,
      amount_fcfa: req.amount_fcfa,
      payment_method: req.payment_method,
      transaction_ref: req.transaction_ref,
      issued_at: now.toISOString(),
      notes: `Abonnement activé pour 30 jours (Expire le ${expiry.toLocaleDateString('fr-FR')})`,
    };

    // User notification
    const approvalNotif: AppNotification = {
      id: `notif_${Date.now()}_appr`,
      user_id: req.user_id,
      title: `🎉 Abonnement ${req.plan.toUpperCase()} Activé !`,
      message: `Votre paiement Mobile Money (${req.transaction_ref}) a été validé par ${adminName}. Vous bénéficiez désormais de l'offre ${req.plan.toUpperCase()} jusqu'au ${expiry.toLocaleDateString('fr-FR')}.`,
      type: 'subscription_approved',
      is_read: false,
      channel: 'in_app',
      link_route: 'abonnement',
      created_at: now.toISOString(),
    };

    // If current active user is the one updated, sync
    if (this.currentUser.id === req.user_id) {
      this.currentUser = { ...this.currentUser, subscription_tier: req.plan };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    }

    this.saveState({
      ...this.db,
      subscriptionRequests: updatedRequests,
      profiles: updatedProfiles,
      subscriptions: updatedSubs,
      receipts: [newReceipt, ...this.db.receipts],
      notifications: [approvalNotif, ...this.db.notifications],
    });

    this.logAudit({
      actor_name: adminName,
      actor_role: 'Super Admin',
      action: 'APPROVE_SUBSCRIPTION',
      details: `Validation du paiement ${req.transaction_ref} (${req.amount_fcfa} FCFA) et activation du forfait ${req.plan.toUpperCase()} pour ${req.user_name}`,
    });

    return true;
  }

  rejectSubscriptionPayment(requestId: string, adminName: string, reason?: string): boolean {
    const req = (this.db.subscriptionRequests || []).find((r) => r.id === requestId);
    if (!req) return false;

    const now = new Date();
    const updatedRequests = (this.db.subscriptionRequests || []).map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'rejected' as const,
            reviewed_at: now.toISOString(),
            reviewed_by: adminName,
            rejection_reason: reason || 'Paiement Mobile Money non identifié sur le compte récepteur.',
          }
        : r
    );

    const rejectionNotif: AppNotification = {
      id: `notif_${Date.now()}_rej`,
      user_id: req.user_id,
      title: `Dépôt Mobile Money non confirmé`,
      message: `Votre demande d'abonnement (${req.transaction_ref}) n'a pas pu être validée : ${reason || 'Référence introuvable ou montant non reçu'}. Merci de vérifier votre SMS MoMo/Orange Money.`,
      type: 'general',
      is_read: false,
      channel: 'in_app',
      link_route: 'abonnement',
      created_at: now.toISOString(),
    };

    this.saveState({
      ...this.db,
      subscriptionRequests: updatedRequests,
      notifications: [rejectionNotif, ...this.db.notifications],
    });

    this.logAudit({
      actor_name: adminName,
      actor_role: 'Super Admin',
      action: 'REJECT_SUBSCRIPTION',
      details: `Rejet de la demande ${req.transaction_ref} (${req.user_name}) : ${reason || 'Non confirmé'}`,
    });

    return true;
  }

  getUserSubscriptionLimits(userId?: string) {
    const targetUserId = userId || this.currentUser.id;
    const profile = this.db.profiles.find((p) => p.id === targetUserId) || this.currentUser;
    const tier = profile.subscription_tier || 'free';
    const sub = this.db.subscriptions.find((s) => s.user_id === targetUserId);

    let maxTontines = 1;
    let maxMembersPerTontine = 10;
    let planLabel = 'Gratuit (Découverte)';

    if (tier === 'standard' || tier === 'starter' || tier === 'business') {
      maxTontines = 3;
      maxMembersPerTontine = 50;
      planLabel = 'Standard (2 000 FCFA/mois)';
    } else if (tier === 'premium') {
      maxTontines = 9999;
      maxMembersPerTontine = 9999;
      planLabel = 'Premium (5 000 FCFA/mois)';
    }

    const currentTontines = this.db.tontines.filter((t) => t.status !== 'archived');
    const canCreateTontine = currentTontines.length < maxTontines;

    let daysRemaining = 30;
    let isExpiringSoon = false;
    if (sub && sub.expires_at) {
      const msLeft = new Date(sub.expires_at).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      if (daysRemaining <= 5 && daysRemaining > 0) {
        isExpiringSoon = true;
      }
    }

    return {
      tier,
      planLabel,
      maxTontines,
      maxMembersPerTontine,
      currentTontinesCount: currentTontines.length,
      canCreateTontine,
      daysRemaining,
      isExpiringSoon,
      subscription: sub,
    };
  }

  hasMemberDuplicate(
    tontineId: string,
    name: string,
    phone: string,
    excludeMemberId?: string
  ): { isDuplicate: boolean; reason?: string } {
    const existing = this.db.members.filter(
      (m) => m.tontine_id === tontineId && (!excludeMemberId || m.id !== excludeMemberId)
    );

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');

    for (const m of existing) {
      const cleanExistingPhone = m.phone.replace(/[^0-9]/g, '');
      if (cleanInputPhone.length >= 9 && cleanInputPhone.slice(-9) === cleanExistingPhone.slice(-9)) {
        return {
          isDuplicate: true,
          reason: `Un adhérent (${m.member_name}) possède déjà le numéro ${m.phone} dans cette tontine.`,
        };
      }
      if (m.member_name.trim().toLowerCase() === name.trim().toLowerCase()) {
        return {
          isDuplicate: true,
          reason: `Un adhérent nommé "${m.member_name}" est déjà inscrit dans cette tontine.`,
        };
      }
    }

    return { isDuplicate: false };
  }

  archiveTontine(tontineId: string): boolean {
    const tIndex = this.db.tontines.findIndex((t) => t.id === tontineId);
    if (tIndex === -1) return false;

    const tontine = this.db.tontines[tIndex];
    const updatedTontine: Tontine = {
      ...tontine,
      status: 'archived',
      updated_at: new Date().toISOString(),
    };

    const newTontines = [...this.db.tontines];
    newTontines[tIndex] = updatedTontine;
    this.saveState({ ...this.db, tontines: newTontines });

    this.logAudit({
      tontine_id: tontineId,
      actor_name: this.currentUser.full_name,
      actor_role: 'Admin',
      action: 'ARCHIVE_TONTINE',
      details: `Archivage de la tontine "${tontine.name}"`,
    });

    return true;
  }

  unarchiveTontine(tontineId: string): boolean {
    const tIndex = this.db.tontines.findIndex((t) => t.id === tontineId);
    if (tIndex === -1) return false;

    const tontine = this.db.tontines[tIndex];
    const updatedTontine: Tontine = {
      ...tontine,
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    const newTontines = [...this.db.tontines];
    newTontines[tIndex] = updatedTontine;
    this.saveState({ ...this.db, tontines: newTontines });

    this.logAudit({
      tontine_id: tontineId,
      actor_name: this.currentUser.full_name,
      actor_role: 'Admin',
      action: 'UNARCHIVE_TONTINE',
      details: `Réactivation de la tontine "${tontine.name}"`,
    });

    return true;
  }

  // Reset database to demo state
  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.db = this.loadState();
  }
}

export const storage = new StorageService();
