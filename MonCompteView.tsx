/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro Lite - Rubrique « Mon compte »
 * Gestion du profil utilisateur et sélection directe des moyens de paiement Orange Money / MTN Mobile Money
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Save,
  Copy,
  Check,
  ShieldCheck,
  Building,
  CreditCard,
  MapPin,
  HelpCircle,
  Zap,
  Info,
  Download,
  Globe,
} from 'lucide-react';
import { storage } from '../services/storage';
import { validateCameroonPhone } from '../services/mobileMoney';
import { UserProfile } from '../types';

interface MonCompteViewProps {
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onNavigate?: (view: string) => void;
}

export const MonCompteView: React.FC<MonCompteViewProps> = ({
  currentUser,
  onUserUpdated,
  onNavigate,
}) => {
  // Payout method selection: 'orange_money' or 'mtn_momo'
  const [payoutMethod, setPayoutMethod] = useState<'orange_money' | 'mtn_momo'>(
    currentUser.payout_method || 'orange_money'
  );

  // Form states - always directly editable
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState(
    currentUser.orange_money_number || ''
  );
  const [mtnMomoNumber, setMtnMomoNumber] = useState(
    currentUser.mtn_momo_number || ''
  );
  const [city, setCity] = useState(currentUser.city || 'Douala');

  // UI feedback states
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showUssdHelper, setShowUssdHelper] = useState<boolean>(false);

  // Synchronize when currentUser changes externally
  useEffect(() => {
    setFullName(currentUser.full_name || '');
    setPhone(currentUser.phone || '');
    setOrangeMoneyNumber(currentUser.orange_money_number || '');
    setMtnMomoNumber(currentUser.mtn_momo_number || '');
    setCity(currentUser.city || 'Douala');
    if (currentUser.payout_method) {
      setPayoutMethod(currentUser.payout_method);
    }
  }, [currentUser]);

  // Real-time phone validations
  const phoneValidation = validateCameroonPhone(phone);
  const omValidation = validateCameroonPhone(orangeMoneyNumber);
  const mtnValidation = validateCameroonPhone(mtnMomoNumber);

  const isOrangeOperator = omValidation.isValid && omValidation.operator === 'ORANGE';
  const isMtnOperator = mtnValidation.isValid && mtnValidation.operator === 'MTN';

  // Active receiving number based on chosen provider
  const activeReceivingNumber =
    payoutMethod === 'orange_money'
      ? (orangeMoneyNumber || currentUser.orange_money_number || '')
      : (mtnMomoNumber || currentUser.mtn_momo_number || '');

  const handleCopyReceivingNumber = () => {
    if (activeReceivingNumber) {
      navigator.clipboard.writeText(activeReceivingNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSaveInformation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Validation Nom complet
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Veuillez renseigner un nom complet valide (minimum 2 caractères).');
      return;
    }

    // 2. Validation Numéro de téléphone principal
    const validPhone = validateCameroonPhone(phone);
    if (!validPhone.isValid) {
      setErrorMessage(
        'Le numéro de téléphone principal est invalide. Format attendu : 9 chiffres au Cameroun (ex: 670 12 34 56 ou +237 6XX XX XX XX).'
      );
      return;
    }

    // 3. Validation selon le moyen de paiement sélectionné
    let formattedOM = orangeMoneyNumber.trim();
    let formattedMTN = mtnMomoNumber.trim();

    if (payoutMethod === 'orange_money') {
      if (!orangeMoneyNumber.trim()) {
        setErrorMessage(
          'Veuillez renseigner votre numéro Orange Money pour recevoir les paiements de vos cotisations.'
        );
        return;
      }
      const validOM = validateCameroonPhone(orangeMoneyNumber);
      if (!validOM.isValid) {
        setErrorMessage(
          'Le numéro Orange Money saisi est invalide. Veuillez saisir un numéro camerounais valide à 9 chiffres (ex: 699 33 44 55).'
        );
        return;
      }
      formattedOM = validOM.formatted;
    } else {
      // MTN Mobile Money
      if (!mtnMomoNumber.trim()) {
        setErrorMessage(
          'Veuillez renseigner votre numéro MTN Mobile Money pour recevoir les paiements de vos cotisations.'
        );
        return;
      }
      const validMTN = validateCameroonPhone(mtnMomoNumber);
      if (!validMTN.isValid) {
        setErrorMessage(
          'Le numéro MTN Mobile Money saisi est invalide. Veuillez saisir un numéro camerounais valide à 9 chiffres (ex: 670 12 34 56).'
        );
        return;
      }
      formattedMTN = validMTN.formatted;
    }

    try {
      // Durable database persistence in storage service
      const updated = storage.updateUserProfile(currentUser.id, {
        full_name: fullName.trim(),
        phone: validPhone.formatted,
        city: city.trim(),
        payout_method: payoutMethod,
        orange_money_number: formattedOM,
        mtn_momo_number: formattedMTN,
      });

      onUserUpdated(updated);

      const activeLabel = payoutMethod === 'orange_money' ? 'Orange Money' : 'MTN Mobile Money';
      const activeNum = payoutMethod === 'orange_money' ? formattedOM : formattedMTN;

      setSuccessMessage(
        `Enregistrement réussi ! Votre moyen de paiement (${activeLabel}) et votre numéro (${activeNum}) ont été enregistrés avec succès dans la base de données.`
      );

      // Auto dismiss success toast after 6 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 6000);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Une erreur est survenue lors de l'enregistrement de vos informations."
      );
    }
  };

  // User tontines stats
  const allTontines = storage.getTontines();
  const myTontines = allTontines.filter((t) => t.created_by === currentUser.id);

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-16">
      {/* Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-emerald-700 font-semibold">Mon compte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Mon compte</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/30">
                Orange Money
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-800 border border-amber-300">
                MTN MoMo
              </span>
            </div>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Choisissez votre moyen de paiement (Orange Money ou MTN Mobile Money) et enregistrez
            votre numéro de réception pour vos tontines au Cameroun.
          </p>
        </div>

        {/* Quick Save button in header for mobile & desktop */}
        <div>
          <button
            type="button"
            onClick={handleSaveInformation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-950">✓ Confirmation de sauvegarde</h4>
            <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-950">Attention</h4>
            <p className="text-xs sm:text-sm text-rose-800 mt-0.5 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Dynamic Payout Spotlight Banner (Orange Money or MTN Mobile Money) */}
      <div
        className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-md border transition-all duration-300 ${
          payoutMethod === 'orange_money'
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 border-orange-500/40'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border-amber-500/40'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs text-white">
              {payoutMethod === 'orange_money' ? (
                <span className="bg-[#FF7900] px-3 py-1 rounded-full flex items-center gap-1.5 font-extrabold shadow-sm">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Compte Sélectionné : Orange Money Cameroun</span>
                </span>
              ) : (
                <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full flex items-center gap-1.5 font-extrabold shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Compte Sélectionné : MTN Mobile Money Cameroun</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {payoutMethod === 'orange_money'
                ? 'Réception des fonds par Orange Money (#150#)'
                : 'Réception des fonds par MTN MoMo (*126#)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {payoutMethod === 'orange_money'
                ? 'Les membres de vos tontines utiliseront ce numéro Orange Money pour vous envoyer leurs cotisations via le code #150# sans frais supplémentaires.'
                : 'Les membres de vos tontines utiliseront ce numéro MTN Mobile Money pour vous envoyer leurs cotisations via le code *126# sans frais supplémentaires.'}
            </p>
          </div>

          {/* Quick Number Display & 1-Click Copy Button */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[260px] flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span>Numéro de réception</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/20">
                {payoutMethod === 'orange_money' ? 'Orange Money' : 'MTN'}
              </span>
            </span>
            <div className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-wide my-1">
              {activeReceivingNumber || 'Non renseigné'}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleCopyReceivingNumber}
                disabled={!activeReceivingNumber}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  payoutMethod === 'orange_money'
                    ? 'bg-[#FF7900] hover:bg-[#e66c00] text-white'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le numéro</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowUssdHelper(!showUssdHelper)}
                className="p-2 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Syntaxe USSD de transfert direct"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible USSD Syntax Helper */}
        {showUssdHelper && (
          <div className="mt-4 pt-4 border-t border-white/15 text-xs text-slate-200 bg-white/5 rounded-xl p-3.5 space-y-2">
            <p className="font-bold text-amber-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Syntaxe USSD de transfert direct pour vos membres :</span>
            </p>
            {payoutMethod === 'orange_money' ? (
              <div className="bg-black/50 p-2.5 rounded-lg font-mono text-emerald-400 text-xs sm:text-sm select-all border border-orange-500/20">
                #150*1*1*{activeReceivingNumber || '699334455'}*MONTANT#
              </div>
            ) : (
              <div className="bg-black/50 p-2.5 rounded-lg font-mono text-amber-300 text-xs sm:text-sm select-all border border-amber-500/20">
                *126*1*1*{activeReceivingNumber || '670123456'}*MONTANT#
              </div>
            )}
            <p className="text-[11px] text-slate-300">
              Vos membres composent cette syntaxe depuis leur téléphone au Cameroun pour envoyer
              instantanément la cotisation avec un reçu SMS officiel.
            </p>
          </div>
        )}
      </div>

      {/* Main Form Card - Fully Interactive */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Coordonnées & Moyen de Réception</h3>
              <p className="text-xs text-slate-500">
                Cliquez directement sur Orange Money ou MTN Mobile Money pour choisir votre opérateur
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Édition Directe
          </span>
        </div>

        <form onSubmit={handleSaveInformation} className="p-5 sm:p-6 space-y-6">
          {/* SECTION 1: DEUX BOUTONS DE SÉLECTION FONCTIONNELS (ORANGE MONEY OU MTN MOBILE MONEY) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>1. Choisissez votre moyen de paiement</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                Cliquez pour basculer d'opérateur
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* BOUTON FONCTIONNEL A : Orange Money */}
              <button
                type="button"
                onClick={() => {
                  setPayoutMethod('orange_money');
                  setErrorMessage('');
                }}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
                  payoutMethod === 'orange_money'
                    ? 'border-[#FF7900] bg-orange-50/70 shadow-md ring-2 ring-[#FF7900]/30'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition ${
                    payoutMethod === 'orange_money'
                      ? 'border-[#FF7900] bg-[#FF7900] text-white shadow-xs'
                      : 'border-slate-300 bg-white group-hover:border-orange-400'
                  }`}
                >
                  {payoutMethod === 'orange_money' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      Orange Money
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF7900] text-white shadow-2xs">
                      #150#
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Recevez vos cotisations de tontine sur votre compte Orange Money Cameroun.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-orange-900 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF7900]" />
                    <span>Préfixes : 69x, 655 à 659</span>
                  </div>
                </div>
              </button>

              {/* BOUTON FONCTIONNEL B : MTN Mobile Money */}
              <button
                type="button"
                onClick={() => {
                  setPayoutMethod('mtn_momo');
                  setErrorMessage('');
                }}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
                  payoutMethod === 'mtn_momo'
                    ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/40'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition ${
                    payoutMethod === 'mtn_momo'
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-xs'
                      : 'border-slate-300 bg-white group-hover:border-amber-400'
                  }`}
                >
                  {payoutMethod === 'mtn_momo' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      MTN Mobile Money
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono shadow-2xs">
                      *126#
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Recevez vos cotisations de tontine sur votre compte MTN MoMo Cameroun.
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-amber-950 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Préfixes : 67x, 68x, 650 à 654</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: DYNAMIC RECEPTION PHONE NUMBER INPUT */}
          <div className="pt-2 border-t border-slate-100">
            {payoutMethod === 'orange_money' ? (
              /* CHAMP NUMÉRO ORANGE MONEY */
              <div className="space-y-2 animate-in fade-in duration-150">
                <label
                  htmlFor="user_om_number"
                  className="block text-xs sm:text-sm font-bold text-orange-950 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#FF7900]" />
                    <span>2. Saisissez votre numéro Orange Money de réception</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-bold text-white bg-[#FF7900] px-2 py-0.5 rounded">
                    Orange Money CM
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="user_om_number"
                    type="tel"
                    value={orangeMoneyNumber}
                    onChange={(e) => setOrangeMoneyNumber(e.target.value)}
                    placeholder="Ex: 699 33 44 55 ou +237 69X XX XX XX"
                    className="w-full pl-4 pr-28 py-3.5 rounded-xl text-sm font-mono transition bg-orange-50/40 border-2 border-orange-300 focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/20 text-slate-900 shadow-xs font-semibold"
                    required
                    autoFocus
                  />
                  <span
                    className="absolute right-3 top-3.5 text-[10px] font-bold px-2.5 py-1 rounded-md font-mono bg-orange-100 text-[#FF7900] border border-orange-300 shadow-2xs flex items-center gap-1 select-none pointer-events-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]" />
                    <span>Orange Money</span>
                  </span>
                </div>
                <p className="text-[11px] text-orange-950 font-medium">
                  Les cotisations payées par vos membres via Orange Money (#150#) arriveront sur
                  ce compte.
                </p>
              </div>
            ) : (
              /* CHAMP NUMÉRO MTN MOBILE MONEY */
              <div className="space-y-2 animate-in fade-in duration-150">
                <label
                  htmlFor="user_mtn_number"
                  className="block text-xs sm:text-sm font-bold text-amber-950 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600 fill-current" />
                    <span>2. Saisissez votre numéro MTN Mobile Money de réception</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded font-mono">
                    MTN MoMo CM
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="user_mtn_number"
                    type="tel"
                    value={mtnMomoNumber}
                    onChange={(e) => setMtnMomoNumber(e.target.value)}
                    placeholder="Ex: 670 12 34 56 ou +237 67X XX XX XX"
                    className="w-full pl-4 pr-20 py-3.5 rounded-xl text-sm font-mono transition bg-amber-50/50 border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 shadow-xs font-semibold"
                    required
                    autoFocus
                  />
                  <span
                    className="absolute right-3 top-3.5 text-[10px] font-bold px-2.5 py-1 rounded-md font-mono bg-amber-200 text-slate-950 border border-amber-400 font-extrabold shadow-2xs flex items-center gap-1 select-none pointer-events-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>MTN</span>
                  </span>
                </div>
                <p className="text-[11px] text-amber-950 font-medium">
                  Les cotisations payées par vos membres via MTN Mobile Money (*126#) arriveront
                  sur ce compte.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: COORDONNÉES PERSONNELLES (NOM COMPLET, VILLE, TÉLÉPHONE) */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Nom complet */}
            <div className="space-y-1.5">
              <label
                htmlFor="user_fullname"
                className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>3. Nom complet</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="user_fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Jean-Paul Kamga"
                className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500">Nom officiel sur les reçus de tontines.</p>
            </div>

            {/* Téléphone principal */}
            <div className="space-y-1.5">
              <label
                htmlFor="user_phone"
                className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-slate-400" />
                <span>4. Téléphone principal</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="user_phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +237 670 12 34 56"
                  className="w-full px-4 py-3 rounded-xl text-sm font-mono bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 shadow-2xs"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">Pour alertes SMS & connexion.</p>
            </div>

            {/* Ville ou Région */}
            <div className="space-y-1.5">
              <label
                htmlFor="user_city"
                className="block text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>5. Ville de résidence</span>
              </label>
              <input
                id="user_city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Douala, Yaoundé..."
                className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 shadow-2xs"
              />
              <p className="text-[11px] text-slate-500">Localisation au Cameroun (FCFA).</p>
            </div>
          </div>

          {/* ACTION BUTTONS: ENREGISTRER */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Sauvegarde directe et durable dans la base de données.
              </span>
            </div>

            <div>
              {/* Bouton « Enregistrer » */}
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm sm:text-base font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Account Overview Cards (Tontines, Subscription, & Telecom Provider) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Subscription Tier */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Abonnement</span>
            <div className="text-base font-extrabold text-slate-900 capitalize">
              {currentUser.subscription_tier || 'Gratuit'}
            </div>
            <p className="text-[11px] text-slate-500">
              {currentUser.subscription_tier === 'premium'
                ? 'Tontines & membres illimités'
                : currentUser.subscription_tier === 'standard'
                ? 'Jusqu’à 3 tontines & 50 membres'
                : '1 tontine active (Gratuit)'}
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('abonnement')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Gérer
            </button>
          )}
        </div>

        {/* Card 2: Managed Tontines */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tontines Actives</span>
            <div className="text-base font-extrabold text-slate-900">
              {myTontines.length} tontine{myTontines.length > 1 ? 's' : ''}
            </div>
            <p className="text-[11px] text-slate-500">Gérées par votre compte</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Active Payout Provider Badge */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Moyen Actif</span>
            <div className="text-base font-extrabold flex items-center gap-1.5">
              {payoutMethod === 'orange_money' ? (
                <span className="text-[#FF7900]">Orange Money</span>
              ) : (
                <span className="text-amber-700">MTN MoMo</span>
              )}
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              {activeReceivingNumber ? 'Prêt pour encaissement' : 'Numéro à renseigner'}
            </p>
          </div>
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
              payoutMethod === 'orange_money'
                ? 'bg-orange-50 text-[#FF7900]'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {payoutMethod === 'orange_money' ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
          </div>
        </div>
      </div>

      {/* Cameroonian Guide: Orange Money & MTN MoMo */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-slate-700 space-y-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Guide Mobile Money pour le responsable au Cameroun</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
              <span>Orange Money Cameroun (#150#)</span>
            </div>
            <p className="text-slate-600">
              Numéros compatibles : préfixes 69x ou 655 à 659. Le membre compose{' '}
              <span className="font-mono font-bold text-orange-700">#150#</span> pour transférer la
              cotisation et fournit son identifiant de transaction Orange.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>MTN Mobile Money Cameroun (*126#)</span>
            </div>
            <p className="text-slate-600">
              Numéros compatibles : préfixes 67x, 68x ou 650 à 654. Le membre compose{' '}
              <span className="font-mono font-bold text-amber-800">*126#</span> pour transférer la
              cotisation et fournit son ID de transaction MTN.
            </p>
          </div>
        </div>
      </div>

      {/* Export Code Source & Déploiement GitHub / Netlify */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>Prêt pour Déploiement Public Netlify & GitHub</span>
          </div>
          <h3 className="text-lg font-extrabold text-white">
            Télécharger l'intégralité du Code Source (ZIP)
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Exportez tous les fichiers complets de TontinePro Lite (React 19, TypeScript, Tailwind, netlify.toml, package.json, documentation README) en une archive ZIP prête à être publiée sur Internet.
          </p>
        </div>

        <a
          href="/tontinepro-lite.zip"
          download="tontinepro-lite.zip"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Télécharger le projet (ZIP)</span>
        </a>
      </div>
    </div>
  );
};
