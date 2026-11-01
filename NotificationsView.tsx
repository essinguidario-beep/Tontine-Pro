/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Notifications Center & Multi-Channel Alert View
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Smartphone,
  Mail,
  Coins,
  Calendar,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';
import { storage } from '../services/storage';
import { AppNotification, UserProfile } from '../types';

interface NotificationsViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string) => void;
  onRefreshNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  currentUser,
  onNavigate,
  onRefreshNotifications,
}) => {
  const [notifications, setNotifications] = useState(storage.getNotifications());
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Preview simulator states
  const [previewPhone, setPreviewPhone] = useState('+237 699 44 21 00');
  const [previewChannel, setPreviewChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [customMsg, setCustomMsg] = useState(
    'Rappel TontinePro : Votre cotisation de 50 000 FCFA pour le cycle 3 est attendue avant le 5 du mois. Réglez par MoMo (*126#) ou OM (*150#).'
  );
  const [testSent, setTestSent] = useState(false);

  const refreshList = () => {
    setNotifications(storage.getNotifications());
    onRefreshNotifications();
  };

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    refreshList();
  };

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead();
    refreshList();
  };

  const handleSendLiveWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?phone=${encodeURIComponent(previewPhone)}&text=${encodeURIComponent(customMsg)}`, '_blank');
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.is_read : true));

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Notifications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Centre des Alertes & Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Canaux intégrés : In-App, SMS Cameroun (+237) et Passerelle WhatsApp Business.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Notifications List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-900">
              Historique des Alertes ({filtered.length})
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  filter === 'unread' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Non lues ({notifications.filter((n) => !n.is_read).length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((n) => {
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition text-left flex items-start justify-between gap-3 ${
                    !n.is_read
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'payment_confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : n.type === 'late_alert'
                          ? 'bg-red-100 text-red-800'
                          : n.type === 'beneficiary_turn'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {n.type === 'payment_confirmed' && <Coins className="w-4 h-4" />}
                      {n.type === 'late_alert' && <AlertTriangle className="w-4 h-4" />}
                      {n.type === 'beneficiary_turn' && <Calendar className="w-4 h-4" />}
                      {n.type !== 'payment_confirmed' && n.type !== 'late_alert' && n.type !== 'beneficiary_turn' && <Bell className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                          {n.channel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                        {new Date(n.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Marquer lu
                      </button>
                    )}
                    {n.link_route && (
                      <button
                        onClick={() => onNavigate(n.link_route || 'dashboard')}
                        className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        Voir →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Broadcast & Simulator Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Générateur de Rappels WhatsApp & SMS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Envoyez directement une alerte certifiée à un adhérent camerounais.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Canal d'expédition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewChannel('whatsapp')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      previewChannel === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewChannel('sms')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition ${
                      previewChannel === 'sms'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>SMS Réseau (+237)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro destinataire
                </label>
                <input
                  type="text"
                  value={previewPhone}
                  onChange={(e) => setPreviewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message du rappel
                </label>
                <textarea
                  rows={4}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSendLiveWhatsApp}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ouvrir dans WhatsApp Business</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
