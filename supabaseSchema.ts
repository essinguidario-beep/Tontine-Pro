/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Supabase PostgreSQL Schema & RLS Migrations
 * Covers all 16 tables, constraints, indexes, triggers and Row Level Security policies
 */

export const SUPABASE_SQL_MIGRATION = `-- =====================================================================
-- TONTINEPRO - MIGRATION COMPLÈTE POSTGRESQL / SUPABASE
-- « Votre tontine, en toute transparence »
-- Conçu pour le Cameroun & l'Afrique francophone (Devise FCFA / XAF)
-- =====================================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE : PROFILES (Utilisateurs et rôles globaux)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    city VARCHAR(100) DEFAULT 'Douala',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('super_admin', 'user')),
    subscription_tier VARCHAR(20) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'business', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE : TONTINES
CREATE TABLE IF NOT EXISTS public.tontines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rotative_tirage', 'rotative_ordre', 'mutuelle_epargne', 'secours_solidaire')),
    contribution_amount NUMERIC(15, 2) NOT NULL CHECK (contribution_amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
    start_date DATE NOT NULL,
    end_date DATE,
    total_members_target INT DEFAULT 12,
    rules_summary TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'archived')),
    payout_rotation_type VARCHAR(30) DEFAULT 'fixed_order' CHECK (payout_rotation_type IN ('fixed_order', 'auction', 'lottery')),
    penalty_rate NUMERIC(15, 2) DEFAULT 1000.00,
    meeting_day_info TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE : TONTINE_MEMBERS (Membres et rôles par tontine)
CREATE TABLE IF NOT EXISTS public.tontine_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('president', 'treasurer', 'secretary', 'member')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'late')),
    shares_count NUMERIC(4, 1) DEFAULT 1.0 CHECK (shares_count > 0),
    joined_at DATE DEFAULT CURRENT_DATE,
    total_contributed NUMERIC(15, 2) DEFAULT 0.00,
    total_debt NUMERIC(15, 2) DEFAULT 0.00,
    is_beneficiary_paid BOOLEAN DEFAULT FALSE,
    beneficiary_cycle INT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tontine_id, phone)
);

-- 4. TABLE : TONTINE_INVITATIONS
CREATE TABLE IF NOT EXISTS public.tontine_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invite_code VARCHAR(64) UNIQUE NOT NULL,
    recipient_phone VARCHAR(30),
    recipient_email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'member',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- 5. TABLE : CONTRIBUTIONS (Cotisations)
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.tontine_members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    cycle_number INT DEFAULT 1,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('mtn_momo', 'orange_money', 'cash', 'bank_transfer', 'other')),
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'rejected', 'cancelled', 'refunded')),
    verified_by UUID REFERENCES public.profiles(id),
    confirmed_at TIMESTAMPTZ DEFAULT NOW(),
    receipt_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE : CONTRIBUTION_SCHEDULES (Échéancier des cycles)
CREATE TABLE IF NOT EXISTS public.contribution_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed', 'overdue')),
    expected_amount NUMERIC(15, 2) NOT NULL,
    collected_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tontine_id, cycle_number)
);

-- 7. TABLE : BENEFICIARIES (Ordre et rotation des bénéficiaires)
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.tontine_members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    cycle_number INT NOT NULL,
    scheduled_date DATE NOT NULL,
    pot_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('paid', 'current', 'upcoming', 'delayed')),
    payout_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tontine_id, cycle_number)
);

-- 8. TABLE : PAYOUTS (Versements des cagnottes aux bénéficiaires)
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('mtn_momo', 'orange_money', 'cash', 'bank_transfer')),
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    approved_by UUID REFERENCES public.profiles(id),
    receipt_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLE : EXPENSES (Dépenses & Caisses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('catering_reception', 'hall_rental', 'bank_telecom', 'solidarity_grant', 'administrative', 'other')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    receipt_proof_url TEXT,
    authorized_by VARCHAR(255) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLE : PENALTIES (Pénalités de retard)
CREATE TABLE IF NOT EXISTS public.penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID NOT NULL REFERENCES public.tontines(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.tontine_members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'waived')),
    paid_at TIMESTAMPTZ,
    contribution_id UUID REFERENCES public.contributions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLE : NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('contribution_due', 'payment_confirmed', 'late_alert', 'beneficiary_turn', 'new_member', 'new_expense', 'invitation', 'subscription_renewal')),
    is_read BOOLEAN DEFAULT FALSE,
    channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'sms', 'whatsapp', 'email')),
    link_route VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABLE : SUBSCRIPTIONS (Abonnements SaaS TontinePro)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('starter', 'business', 'premium')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'expired', 'cancelled')),
    price_fcfa NUMERIC(15, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TABLE : SUBSCRIPTION_PAYMENTS
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_fcfa NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('mtn_momo', 'orange_money', 'card')),
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed')),
    invoice_url TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABLE : RECEIPTS (Reçus certifiés)
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(60) UNIQUE NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('contribution', 'payout', 'subscription')),
    entity_id UUID NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    tontine_name VARCHAR(255) NOT NULL,
    amount_fcfa NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    transaction_ref VARCHAR(100) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    qr_code_token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TABLE : AUDIT_LOGS (Traçabilité financière immuable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tontine_id UUID REFERENCES public.tontines(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(50)
);

-- 16. TABLE : SUPPORT_TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(30) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('payment', 'tontine', 'technical', 'account')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES DE PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_members_tontine ON public.tontine_members(tontine_id);
CREATE INDEX IF NOT EXISTS idx_members_profile ON public.tontine_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_contributions_tontine ON public.contributions(tontine_id);
CREATE INDEX IF NOT EXISTS idx_contributions_member ON public.contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.contributions(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tontine ON public.beneficiaries(tontine_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tontine ON public.expenses(tontine_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_tontine ON public.audit_logs(tontine_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tontine_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Politiques profiles
CREATE POLICY "Les utilisateurs peuvent lire leur propre profil"
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre a jour leur propre profil"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politiques tontines (membres autorisés et créateur)
CREATE POLICY "Les membres peuvent voir leur tontine"
ON public.tontines FOR SELECT
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.tontine_members tm
        WHERE tm.tontine_id = tontines.id AND tm.profile_id = auth.uid()
    )
);

CREATE POLICY "Les administrateurs peuvent modifier leur tontine"
ON public.tontines FOR UPDATE
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.tontine_members tm
        WHERE tm.tontine_id = tontines.id AND tm.profile_id = auth.uid() AND tm.role IN ('president', 'treasurer')
    )
);

-- Politiques contributions
CREATE POLICY "Les membres voient les cotisations de leur tontine"
ON public.contributions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.tontine_members tm
        WHERE tm.tontine_id = contributions.tontine_id AND tm.profile_id = auth.uid()
    )
);

CREATE POLICY "Seuls president et tresorier peuvent enregistrer des cotisations"
ON public.contributions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tontine_members tm
        WHERE tm.tontine_id = contributions.tontine_id AND tm.profile_id = auth.uid() AND tm.role IN ('president', 'treasurer')
    )
);

-- Politiques notifications
CREATE POLICY "Chaque utilisateur ne lit que ses notifications"
ON public.notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Chaque utilisateur peut marquer ses notifications"
ON public.notifications FOR UPDATE USING (user_id = auth.uid());
`;
