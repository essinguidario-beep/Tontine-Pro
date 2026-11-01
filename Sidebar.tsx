/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro Lite - Workspace Sidebar & Mobile Bottom Navigation
 * Section 14: Clean 8-item menu + sub-modules & viral share
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Coins,
  CalendarDays,
  FileSpreadsheet,
  Bell,
  CreditCard,
  Settings,
  ShieldAlert,
  Headphones,
  LogOut,
  ChevronRight,
  TrendingDown,
  UserCheck,
  Building,
  Share2,
  ChevronDown,
  Smartphone,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { UserProfile } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserProfile;
  onUserChanged: (user: UserProfile) => void;
  unreadNotificationsCount: number;
  onLogout?: () => void;
  onOpenViralShare?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onUserChanged,
  unreadNotificationsCount,
  onLogout,
  onOpenViralShare,
}) => {
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showAdvancedModules, setShowAdvancedModules] = useState(false);
  const profiles = storage.getProfiles();

  // Primary Items with new « Mon compte » section
  const primaryNavItems = [
    { id: 'dashboard', label: '1. Tableau de bord', icon: LayoutDashboard },
    { id: 'tontines', label: '2. Mes tontines', icon: Building },
    { id: 'membres', label: '3. Membres', icon: Users },
    { id: 'cotisations', label: '4. Cotisations', icon: Coins },
    { id: 'rapports', label: '5. Rapports', icon: FileSpreadsheet },
    { id: 'abonnement', label: '6. Abonnements', icon: CreditCard },
    { id: 'mon_compte', label: '7. Mon compte', icon: Smartphone, tag: 'OM & MoMo' },
    { id: 'profil', label: '8. Profil & Paramètres', icon: Settings },
  ];

  // Secondary Tools
  const secondaryNavItems = [
    { id: 'beneficiaires', label: 'Tours & Bénéficiaires', icon: CalendarDays },
    { id: 'depenses', label: 'Dépenses & Trésorerie', icon: TrendingDown },
    { id: 'penalites', label: 'Retards & Pénalités', icon: ShieldAlert },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { id: 'support', label: 'Assistance & Support', icon: Headphones },
  ];

  if (currentUser.role === 'super_admin') {
    secondaryNavItems.push({ id: 'admin', label: 'Console Super Admin', icon: UserCheck });
  }

  const handleSelectUser = (profile: UserProfile) => {
    storage.setCurrentUser(profile);
    onUserChanged(profile);
    setShowUserSwitcher(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('landing');
    }
  };

  return (
    <>
      {/* Desktop Sidebar (Left column 260px) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Menu Principal (Lite)</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">8/8</span>
          </div>

          {/* Primary Items */}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'tontines' && currentView === 'tontine_detail');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? item.id === 'mon_compte'
                          ? 'text-[#FF7900]'
                          : 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.tag && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}

          {/* 8. Item: Déconnexion (Section 14) */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">8. Déconnexion</span>
            </div>
          </button>

          {/* Viral Invitation Quick Button */}
          {onOpenViralShare && (
            <div className="pt-2 px-1">
              <button
                type="button"
                onClick={onOpenViralShare}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#25D366] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs hover:opacity-95 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Inviter par WhatsApp</span>
              </button>
            </div>
          )}

          {/* Secondary Tools Collapsible Section */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            <button
              onClick={() => setShowAdvancedModules(!showAdvancedModules)}
              className="w-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between hover:text-slate-600 transition"
            >
              <span>Outils Complémentaires</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showAdvancedModules ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAdvancedModules && (
              <div className="mt-1 space-y-0.5 animate-in fade-in duration-100">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User profile & rapid role switcher (for testability) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 relative">
          <button
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs transition text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=TP'}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/20 shrink-0"
              />
              <div className="truncate">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <span className="font-semibold text-emerald-800 uppercase">
                    {currentUser.subscription_tier || 'Gratuit'}
                  </span>
                  <span>·</span>
                  <span className="font-mono">{currentUser.phone.slice(-8)}</span>
                </div>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-slate-400 transition-transform ${
                showUserSwitcher ? 'rotate-90' : ''
              }`}
            />
          </button>

          {/* Quick User Switcher Dropup */}
          {showUserSwitcher && (
            <div className="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Tester un autre compte (Admin / Responsable)
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectUser(p)}
                    className={`w-full text-left p-1.5 rounded-lg text-xs flex items-center justify-between ${
                      p.id === currentUser.id
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{p.full_name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{p.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between px-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400">
            <span className="font-mono">FCFA (XAF) · Cameroun</span>
            <button
              onClick={handleLogoutClick}
              className="text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3 h-3" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Fixed bottom for touch Android/iPhone) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition ${
            currentView === 'dashboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Accueil</span>
        </button>

        <button
          onClick={() => onNavigate('tontines')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition ${
            currentView === 'tontines' || currentView === 'tontine_detail'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Tontines</span>
        </button>

        <button
          onClick={() => onNavigate('cotisations')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition ${
            currentView === 'cotisations' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Cotisations</span>
        </button>

        <button
          onClick={() => onNavigate('mon_compte')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition relative ${
            currentView === 'mon_compte' ? 'text-[#FF7900] font-bold' : 'text-slate-500'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mon compte</span>
        </button>

        <button
          onClick={() => onNavigate('rapports')}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition ${
            currentView === 'rapports' ? 'text-emerald-700 font-bold' : 'text-slate-500'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rapports</span>
        </button>
      </div>
    </>
  );
};
