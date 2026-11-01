/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Members Directory & Management View
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Share2,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Building,
  MessageCircle,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA, validateCameroonPhone } from '../services/mobileMoney';
import { getWhatsAppReminderUrl, getWhatsAppTontineInviteUrl } from '../services/whatsapp';
import { TontineMember, TontineRole, MemberStatus, UserProfile } from '../types';

interface MembersViewProps {
  currentUser: UserProfile;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  targetTontineId?: string;
  onOpenRecordContributionModal: (tontineId: string, memberId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  currentUser,
  isAddModalOpen: initialAddOpen = false,
  onCloseAddModal,
  targetTontineId,
  onOpenRecordContributionModal,
}) => {
  const [members, setMembers] = useState(storage.getMembers());
  const [search, setSearch] = useState('');
  const [selectedTontineId, setSelectedTontineId] = useState<string>(targetTontineId || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'late'>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialAddOpen);

  useEffect(() => {
    if (initialAddOpen !== undefined) {
      setIsModalOpen(initialAddOpen);
    }
  }, [initialAddOpen]);

  // Reactive subscription
  useEffect(() => {
    setMembers(storage.getMembers());
    const unsubscribe = storage.subscribe(() => {
      setMembers(storage.getMembers());
    });
    return unsubscribe;
  }, []);

  // Form states for new member
  const [tontineId, setTontineId] = useState(targetTontineId || storage.getTontines()[0]?.id || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+237 6');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TontineRole>('member');
  const [shares, setShares] = useState(1);
  const [formError, setFormError] = useState('');

  const tontines = storage.getTontines();

  const refreshMembers = () => {
    setMembers(storage.getMembers());
  };

  const handleOpenAdd = () => {
    setName('');
    setPhone('+237 6');
    setEmail('');
    setRole('member');
    setShares(1);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Le nom du membre est obligatoire.');
      return;
    }

    const phoneVal = validateCameroonPhone(phone);
    if (!phoneVal.isValid) {
      setFormError('Numéro camerounais invalide (+237 6XX XX XX XX).');
      return;
    }

    // Check duplicate
    const dup = storage.hasMemberDuplicate(tontineId, name.trim(), phoneVal.formatted);
    if (dup.isDuplicate) {
      setFormError(dup.reason || 'Ce membre existe déjà dans cette tontine.');
      return;
    }

    // Check quota
    const limits = storage.getUserSubscriptionLimits(currentUser.id);
    const existing = storage.getMembers(tontineId);
    if (existing.length >= limits.maxMembersPerTontine) {
      setFormError(`Limite du forfait ${limits.planLabel} atteinte (${limits.maxMembersPerTontine} membres max).`);
      return;
    }

    storage.addMember({
      tontine_id: tontineId,
      member_name: name.trim(),
      phone: phoneVal.formatted,
      email: email.trim(),
      role,
      status: 'active',
      shares_count: shares,
      joined_at: new Date().toISOString().slice(0, 10),
    });

    refreshMembers();
    setIsModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
  };

  const handleShareWhatsAppInvite = (m?: TontineMember) => {
    const activeTontine = tontines.find((t) => t.id === (m ? m.tontine_id : tontineId)) || tontines[0];
    const text = `Bonjour ${m ? m.member_name : ''}, vous êtes convié(e) à participer à la tontine "${activeTontine.name}" sur TontinePro.\nConsultez vos cotisations et vos reçus sur : ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.member_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      (m.email ? m.email.toLowerCase().includes(search.toLowerCase()) : false);
    const matchesTontine = selectedTontineId === 'all' || m.tontine_id === selectedTontineId;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'late' ? m.status === 'late' || m.total_debt > 0 : m.status === 'active');
    return matchesSearch && matchesTontine && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Membres & Rôles</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Répertoire des Membres
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi individuel des parts, des coordonnées téléphoniques et de l'état des cotisations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleShareWhatsAppInvite()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Lien d'invitation WhatsApp</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un membre</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone (+237)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tontine Selector */}
          <select
            value={selectedTontineId}
            onChange={(e) => setSelectedTontineId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Toutes les Tontines</option>
            {tontines.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({members.length})
            </button>
            <button
              onClick={() => setStatusFilter('late')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'late'
                  ? 'bg-white text-red-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En retard
            </button>
          </div>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Membre</th>
                <th className="px-4 py-3.5">Contact Cameroun</th>
                <th className="px-4 py-3.5">Tontine</th>
                <th className="px-4 py-3.5">Rôle</th>
                <th className="px-4 py-3.5 text-right">Total Cotisé</th>
                <th className="px-4 py-3.5 text-right">Dettes</th>
                <th className="px-4 py-3.5 text-center">Cagnotte</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => {
                const tontineObj = tontines.find((t) => t.id === m.tontine_id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=TP'}
                          alt={m.member_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{m.member_name}</div>
                          <div className="text-[10px] text-slate-400">Adhésion : {new Date(m.joined_at).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-700 font-medium tabular-nums">{m.phone}</div>
                      <div className="text-[10px] text-slate-400">{m.email}</div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <span className="line-clamp-1">{tontineObj ? tontineObj.name : 'Tontine'}</span>
                    </td>

                    <td className="px-4 py-3 capitalize">
                      <span className="font-medium text-slate-800">
                        {m.role === 'president' ? 'Président' : m.role === 'treasurer' ? 'Trésorier' : m.role === 'secretary' ? 'Secrétaire' : 'Membre'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatFCFA(m.total_contributed)}
                    </td>

                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {m.total_debt > 0 ? (
                        <span className="text-red-600 font-bold">{formatFCFA(m.total_debt)}</span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {m.is_beneficiary_paid ? (
                        <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Reçue
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.total_debt > 0 && (
                          <a
                            href={getWhatsAppReminderUrl({
                              phone: m.phone,
                              memberName: m.member_name,
                              amount: m.total_debt,
                              tontineName: tontineObj ? tontineObj.name : 'Tontine',
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[11px] rounded-lg transition border border-[#25D366]/30"
                            title="Envoyer un rappel de cotisation par WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                            <span>Rappel WA</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenRecordContributionModal(m.tontine_id, m.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg transition"
                        >
                          Cotiser
                        </button>

                        <a
                          href={getWhatsAppTontineInviteUrl({
                            tontineName: tontineObj ? tontineObj.name : 'Tontine',
                            contributionAmount: tontineObj?.contribution_amount || 50000,
                            frequency: tontineObj?.frequency === 'monthly' ? 'Mensuel' : 'Hebdo',
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded-md transition"
                          title="Inviter par WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Ajouter un Membre à la Tontine</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tontine d'affectation</label>
                <select
                  value={tontineId}
                  onChange={(e) => setTontineId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  {tontines.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Samuel Eto'o Mbappé"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone Cameroun (+237) *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="membre@exemple.cm"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle au bureau</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TontineRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="member">Membre simple</option>
                    <option value="treasurer">Trésorier(e)</option>
                    <option value="secretary">Secrétaire</option>
                    <option value="president">Président(e)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de parts</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Enregistrer le membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
