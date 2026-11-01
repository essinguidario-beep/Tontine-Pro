/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Create & Edit Tontine Modal
 * Validates authentication, form fields, persists to database, displays success confirmation & redirects to dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Coins,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { formatFCFA } from '../../services/mobileMoney';
import { Tontine, TontineType, ContributionFrequency, UserProfile } from '../../types';

interface CreateTontineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialTontine?: Tontine | null;
  onSuccess: (tontine: Tontine) => void;
  onNavigateDashboard?: () => void;
}

export const CreateTontineModal: React.FC<CreateTontineModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTontine,
  onSuccess,
  onNavigateDashboard,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TontineType>('rotative_ordre');
  const [amount, setAmount] = useState<number>(50000);
  const [frequency, setFrequency] = useState<ContributionFrequency>('monthly');
  const [targetMembers, setTargetMembers] = useState<number>(12);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [rules, setRules] = useState<string>(
    'Cotisation due avant le 5 de chaque mois. Pénalité de 2 500 FCFA/jour de retard.'
  );
  const [rotationType, setRotationType] = useState<'fixed_order' | 'auction' | 'lottery'>('fixed_order');
  const [penaltyRate, setPenaltyRate] = useState<number>(2500);
  const [meetingInfo, setMeetingInfo] = useState<string>('Chaque 1er dimanche du mois à 15h');

  // UI state
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdTontine, setCreatedTontine] = useState<Tontine | null>(null);

  // Sync state when modal opens or initialTontine changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setCreatedTontine(null);
      if (initialTontine) {
        setName(initialTontine.name);
        setDescription(initialTontine.description || '');
        setType(initialTontine.type);
        setAmount(initialTontine.contribution_amount);
        setFrequency(initialTontine.frequency);
        setTargetMembers(initialTontine.total_members_target);
        setStartDate(initialTontine.start_date);
        setEndDate(initialTontine.end_date || '');
        setRules(initialTontine.rules_summary || '');
        setRotationType(initialTontine.payout_rotation_type);
        setPenaltyRate(initialTontine.penalty_rate || 2500);
        setMeetingInfo(initialTontine.meeting_day_info || '');
      } else {
        setName('');
        setDescription('');
        setType('rotative_ordre');
        setAmount(50000);
        setFrequency('monthly');
        setTargetMembers(12);
        setStartDate(new Date().toISOString().slice(0, 10));
        setEndDate('');
        setRules('Cotisation due avant le 5 de chaque mois. Pénalité de 2 500 FCFA/jour de retard.');
        setRotationType('fixed_order');
        setPenaltyRate(2500);
        setMeetingInfo('Chaque 1er dimanche du mois à 15h');
      }
    }
  }, [isOpen, initialTontine]);

  if (!isOpen) return null;

  // Authentication Guard
  if (!currentUser || !currentUser.id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Authentification requise</h3>
          <p className="text-xs text-slate-600">
            Vous devez être connecté à un compte utilisateur vérifié pour pouvoir créer ou enregistrer une tontine.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const calculatedTotalPot = (amount || 0) * (targetMembers || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict Validations
    if (!name.trim()) {
      setError('Veuillez renseigner un nom pour votre tontine (ex: "Tontine des Cadres").');
      return;
    }
    if (name.trim().length < 3) {
      setError('Le nom de la tontine doit comporter au moins 3 caractères.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Le montant de cotisation par part doit être supérieur à 0 FCFA.');
      return;
    }
    if (amount < 1000) {
      setError('Le montant minimum recommandé d’une part de tontine est de 1 000 FCFA.');
      return;
    }
    if (!targetMembers || targetMembers < 2) {
      setError('Une tontine solidaire doit compter au minimum 2 membres / parts.');
      return;
    }
    if (!startDate) {
      setError('Veuillez indiquer la date de démarrage de la tontine.');
      return;
    }

    // Quota evaluation for TontinePro Lite
    if (!initialTontine) {
      const limits = storage.getUserSubscriptionLimits(currentUser.id);
      if (!limits.canCreateTontine) {
        setError(
          `Limite de votre forfait ${limits.planLabel} atteinte : vous avez déjà ${limits.currentTontinesCount} tontine(s) active(s) sur le maximum autorisé (${limits.maxTontines}). Veuillez passer à l'offre Standard ou Premium pour gérer plus de tontines.`
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (initialTontine) {
        // Update existing tontine
        const updated = storage.updateTontine(initialTontine.id, {
          name: name.trim(),
          description: description.trim(),
          type,
          contribution_amount: Number(amount),
          frequency,
          total_members_target: Number(targetMembers),
          start_date: startDate,
          end_date: endDate || undefined,
          rules_summary: rules.trim(),
          payout_rotation_type: rotationType,
          penalty_rate: Number(penaltyRate),
          meeting_day_info: meetingInfo.trim(),
        });

        if (!updated) {
          throw new Error('Échec de la mise à jour de la tontine.');
        }

        setIsSubmitting(false);
        setCreatedTontine(updated);
        onSuccess(updated);
      } else {
        // Create new tontine and persist to database
        const savedTontine = storage.createTontine(
          {
            name: name.trim(),
            description: description.trim() || `Tontine ${frequency} créée par ${currentUser.full_name}`,
            type,
            contribution_amount: Number(amount),
            frequency,
            start_date: startDate,
            end_date: endDate || undefined,
            total_members_target: Number(targetMembers),
            rules_summary: rules.trim(),
            status: 'active',
            payout_rotation_type: rotationType,
            penalty_rate: Number(penaltyRate),
            meeting_day_info: meetingInfo.trim(),
            created_by: currentUser.id,
          },
          currentUser
        );

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore confetti if blocked
        }

        setIsSubmitting(false);
        setCreatedTontine(savedTontine);
        onSuccess(savedTontine);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement de la tontine.");
    }
  };

  const handleFinishAndRedirect = () => {
    onClose();
    if (onNavigateDashboard) {
      onNavigateDashboard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-left">
        {/* Success Confirmation Screen */}
        {createdTontine ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
                Enregistrement Confirmé
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {initialTontine ? 'Tontine mise à jour avec succès !' : 'Tontine créée et enregistrée avec succès !'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2">
                La tontine <strong className="text-slate-900">« {createdTontine.name} »</strong> a été inscrite
                dans la base de données. Vous êtes désigné comme administrateur principal (Président).
              </p>
            </div>

            {/* Micro Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-lg mx-auto text-left grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Cotisation / part</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatFCFA(createdTontine.contribution_amount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Fréquence</span>
                <span className="font-bold text-slate-900 capitalize text-xs">
                  {createdTontine.frequency === 'monthly'
                    ? 'Mensuelle'
                    : createdTontine.frequency === 'weekly'
                    ? 'Hebdomadaire'
                    : createdTontine.frequency === 'biweekly'
                    ? 'Bimensuelle'
                    : 'Quotidienne'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Membres cibles</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {createdTontine.total_members_target}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Cagnotte cycle</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatFCFA(createdTontine.contribution_amount * createdTontine.total_members_target)}
                </span>
              </div>
            </div>

            {/* Direct Redirect Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinishAndRedirect}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Accéder au Tableau de Bord</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition"
              >
                Gérer les membres maintenant
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {initialTontine ? 'Modifier la Tontine' : 'Créer et Enregistrer une Tontine'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Enregistrement officiel dans la base de données de TontinePro
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Creator Info Badge */}
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    Fondateur : <strong>{currentUser.full_name}</strong> ({currentUser.phone})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Président
                </span>
              </div>

              {/* Nom de la Tontine */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nom de la tontine <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tontine des Cadres & Ingénieurs d'Akwa"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Donnez un nom clair et facilement identifiable par vos membres.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Description & Objectif de la tontine
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectif d'épargne, projet solidaire, entraide, investissement..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              {/* Cotisation & Fréquence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Montant de la part / cotisation (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1000"
                      step="500"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums pr-16"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-mono font-bold text-slate-400">
                      FCFA
                    </span>
                  </div>

                  {/* Quick Amount Shortcuts */}
                  <div className="flex gap-1.5 mt-1.5">
                    {[10000, 25000, 50000, 100000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmount(v)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                          amount === v
                            ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {formatFCFA(v)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Fréquence des cotisations <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ContributionFrequency)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="monthly">Mensuelle (1 fois par mois)</option>
                    <option value="biweekly">Bimensuelle (tous les 15 jours)</option>
                    <option value="weekly">Hebdomadaire (chaque semaine)</option>
                    <option value="daily">Quotidienne (chaque jour ouvrable)</option>
                  </select>
                </div>
              </div>

              {/* Nombre de membres & Date de démarrage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nombre cible de membres / parts <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="2"
                      max="100"
                      value={targetMembers}
                      onChange={(e) => setTargetMembers(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums"
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Date de démarrage du 1er cycle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Estimated Pot Projection */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Cagnotte totale estimée par tour :</span>
                </div>
                <span className="font-mono font-extrabold text-emerald-400 text-sm tabular-nums">
                  {formatFCFA(calculatedTotalPot)}
                </span>
              </div>

              {/* Type de tontine & Mode de rotation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Modèle de fonctionnement
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TontineType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="rotative_ordre">Tontine rotative à ordre fixé</option>
                    <option value="rotative_tirage">Tontine rotative à tirage au sort</option>
                    <option value="mutuelle_epargne">Mutuelle d'épargne & crédit solidaire</option>
                    <option value="secours_solidaire">Fonds d'assistance & secours solidaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mode d'attribution des cagnottes
                  </label>
                  <select
                    value={rotationType}
                    onChange={(e) => setRotationType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="fixed_order">Calendrier fixé à l'avance</option>
                    <option value="lottery">Tirage au sort (loterie périodique)</option>
                    <option value="auction">Enchères solidaires</option>
                  </select>
                </div>
              </div>

              {/* Jour et heure de réunion / versement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Jour & heure de réunion ou versement
                  </label>
                  <input
                    type="text"
                    value={meetingInfo}
                    onChange={(e) => setMeetingInfo(e.target.value)}
                    placeholder="Ex: Chaque 1er dimanche du mois à 15h"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Pénalité par jour de retard (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={penaltyRate}
                    onChange={(e) => setPenaltyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Règles intérieures */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Règles & Règlements intérieurs
                </label>
                <textarea
                  rows={2}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Modalités de versement via MTN MoMo / Orange Money, sanctions en cas de retard..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons: Cancel + Enregistrer la tontine */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Enregistrement en cours...</span>
                  ) : initialTontine ? (
                    <span>Enregistrer les modifications</span>
                  ) : (
                    <>
                      <Building className="w-4 h-4" />
                      <span>Enregistrer la tontine</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
