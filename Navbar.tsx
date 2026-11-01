/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Top Navigation Bar (Follows Strict 3-Zone Contract)
 */

import React from 'react';
import { Logo } from '../common/Logo';
import { PWAInstallButton } from '../common/PWAInstallButton';

import { Share2, Download } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAuthenticated: boolean;
  onOpenSupabaseModal: () => void;
  onOpenViralShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAuthenticated,
  onOpenSupabaseModal,
  onOpenViralShare,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          className="text-left shrink-0 cursor-pointer"
        >
          <Logo size="md" showTagline={false} />
        </button>

        {/* Zone 2: 4-5 single-line clean text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'landing' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Accueil
              </button>
              <a
                href="#features"
                className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
              >
                Fonctionnalités
              </a>
              <a
                href="#mobile-money"
                className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
              >
                Mobile Money
              </a>
              <a
                href="#pricing"
                className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
              >
                Abonnements
              </a>
              <a
                href="#faq"
                className="hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
              >
                FAQ
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'dashboard' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Tableau de bord
              </button>
              <button
                onClick={() => onNavigate('tontines')}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'tontines' || currentView === 'tontine_detail' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Mes Tontines
              </button>
              <button
                onClick={() => onNavigate('cotisations')}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'cotisations' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Cotisations
              </button>
              <button
                onClick={() => onNavigate('beneficiaires')}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'beneficiaires' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Bénéficiaires
              </button>
              <button
                onClick={() => onNavigate('rapports')}
                className={`hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0 ${
                  currentView === 'rapports' ? 'text-emerald-700 font-semibold' : ''
                }`}
              >
                Rapports
              </button>
              <button
                onClick={() => onNavigate('mon_compte')}
                className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-medium ${
                  currentView === 'mon_compte' ? 'text-[#FF7900] font-bold' : ''
                }`}
              >
                <span>Mon compte</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-300 font-bold font-mono">
                  OM / MoMo
                </span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton variant="compact" />

          {isAuthenticated && onOpenViralShare && (
            <button
              onClick={onOpenViralShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-lg transition whitespace-nowrap shrink-0 shadow-2xs"
              title="Inviter un membre ou responsable par WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inviter WhatsApp</span>
            </button>
          )}

          <a
            href="/tontinepro-lite.zip"
            download="tontinepro-lite.zip"
            title="Télécharger l'intégralité du code source (ZIP) pour GitHub & Netlify"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition whitespace-nowrap shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Code ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </a>

          <button
            onClick={onOpenSupabaseModal}
            title="Consulter le schéma SQL Supabase"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition whitespace-nowrap shrink-0"
          >
            <span>Supabase SQL</span>
          </button>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-1.5 transition whitespace-nowrap shrink-0"
              >
                Connexion
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Créer mon compte
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Espace Gestion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
