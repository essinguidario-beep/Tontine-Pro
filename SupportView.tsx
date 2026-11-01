/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - User Support & Assistance View
 */

import React, { useState } from 'react';
import { Headphones, Plus, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { storage } from '../services/storage';
import { SupportTicket, UserProfile } from '../types';

interface SupportViewProps {
  currentUser: UserProfile;
}

export const SupportView: React.FC<SupportViewProps> = ({ currentUser }) => {
  const [tickets, setTickets] = useState(storage.getSupportTickets());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'payment' | 'tontine' | 'technical' | 'account'>('payment');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [message, setMessage] = useState('');

  const refreshList = () => {
    setTickets(storage.getSupportTickets());
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    storage.createSupportTicket({
      subject,
      category,
      priority,
      initialMessage: message,
    });

    refreshList();
    setIsModalOpen(false);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Support & Assistance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Centre d'Assistance TontinePro
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Une équipe dédiée à Douala et Yaoundé pour vous accompagner 7j/7.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ouvrir un ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t) => (
          <div key={t.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                t.status === 'open'
                  ? 'bg-amber-100 text-amber-800'
                  : t.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {t.status === 'open' ? 'Ouvert' : t.status === 'in_progress' ? 'En traitement' : 'Résolu'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(t.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>

            <h3 className="font-extrabold text-slate-900 text-sm">{t.subject}</h3>

            <div className="space-y-2 border-t border-slate-100 pt-2 text-xs">
              {t.messages.map((m, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-bold text-[10px] text-slate-500">{m.sender}</div>
                  <p className="text-slate-800 mt-0.5">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Nouveau Ticket de Support</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="payment">Paiement Mobile Money / Reçu</option>
                  <option value="tontine">Fonctionnement Tontine</option>
                  <option value="account">Compte & Profil</option>
                  <option value="technical">Problème Technique</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objet de la demande</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Question sur la passerelle MoMo"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description détaillée</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez votre situation..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 rounded-lg"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
