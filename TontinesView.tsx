/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Tontines Management View
 */

import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Coins,
  ChevronRight,
  Edit2,
  Archive,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { Tontine, UserProfile } from '../types';

interface TontinesViewProps {
  currentUser: UserProfile;
  onNavigateDetail: (tontineId: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (tontine: Tontine) => void;
}

export const TontinesView: React.FC<TontinesViewProps> = ({
  currentUser,
  onNavigateDetail,
  onOpenCreateModal,
  onOpenEditModal,
}) => {
  const [tontines, setTontines] = useState(storage.getTontines());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');

  // Reactive subscription
  useEffect(() => {
    setTontines(storage.getTontines());
    const unsubscribe = storage.subscribe(() => {
      setTontines(storage.getTontines());
    });
    return unsubscribe;
  }, []);

  const handleArchive = (t: Tontine, e: React.MouseEvent) => {
    e.stopPropagation();
    const action = t.status === 'archived' ? 'réactiver' : 'archiver';
    if (confirm(`Voulez-vous vraiment ${action} la tontine "${t.name}" ?`)) {
      storage.updateTontine(t.id, {
        status: t.status === 'archived' ? 'active' : 'archived',
      });
      setTontines(storage.getTontines());
    }
  };

  const filtered = tontines.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'archived' ? t.status === 'archived' : t.status !== 'archived');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Gestion des Tontines</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Mes Tontines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaque tontine fonctionne de façon totalement isolée et sécurisée.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Tontine</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une tontine (ex: Ingénieurs, Mokolo...)"
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({tontines.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'active'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Actives ({tontines.filter((t) => t.status !== 'archived').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('archived')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'archived'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Archivées ({tontines.filter((t) => t.status === 'archived').length})
          </button>
        </div>
      </div>

      {/* Tontine Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <Building className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {search ? 'Aucune tontine ne correspond à votre recherche' : 'Aucune tontine enregistrée'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {search
                ? 'Essayez de modifier votre mot-clé de recherche ou réinitialisez les filtres.'
                : 'Créez votre première tontine pour commencer à gérer vos membres et cotisations.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer ma première tontine</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const members = storage.getMembers(t.id);
            const contribs = storage.getContributions(t.id);
            const totalCollected = contribs
              .filter((c) => c.status === 'confirmed')
              .reduce((acc, c) => acc + c.amount, 0);

            return (
              <div
                key={t.id}
                onClick={() => onNavigateDetail(t.id)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.status === 'active' ? 'Active' : 'Archivée'}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {t.type === 'rotative_ordre'
                          ? 'Rotative Ordre'
                          : t.type === 'rotative_tirage'
                          ? 'Rotative Tirage'
                          : t.type === 'mutuelle_epargne'
                          ? 'Mutuelle Épargne'
                          : 'Secours Solidaire'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditModal(t);
                        }}
                        title="Modifier les paramètres de la tontine"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleArchive(t, e)}
                        title={t.status === 'archived' ? 'Réactiver' : 'Archiver'}
                        className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {t.description || 'Aucune description disponible.'}
                  </p>

                  {/* Financial stats summary */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Cotisation / part :</span>
                      <span className="font-mono font-bold text-emerald-800 tabular-nums">
                        {formatFCFA(t.contribution_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Total collecté :</span>
                      <span className="font-mono font-medium text-slate-700 tabular-nums">
                        {formatFCFA(totalCollected)}
                      </span>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{members.length} / {t.total_members_target} membres</span>
                    </span>
                    <span className="capitalize">
                      {t.frequency === 'monthly'
                        ? 'Mensuelle'
                        : t.frequency === 'weekly'
                        ? 'Hebdomadaire'
                        : t.frequency === 'biweekly'
                        ? 'Bimensuelle'
                        : 'Quotidienne'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span>Ouvrir la tontine</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
