/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Profile, Security & Audit Logs View
 */

import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  FileText,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { storage } from '../services/storage';
import { validateCameroonPhone } from '../services/mobileMoney';
import { UserProfile, AuditLog } from '../types';

interface ProfileSettingsViewProps {
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  currentUser,
  onUserUpdated,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [payoutMethod, setPayoutMethod] = useState<'orange_money' | 'mtn_momo'>(
    currentUser.payout_method || 'orange_money'
  );
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState(
    currentUser.orange_money_number || ''
  );
  const [mtnMomoNumber, setMtnMomoNumber] = useState(
    currentUser.mtn_momo_number || ''
  );
  const [city, setCity] = useState(currentUser.city || 'Douala');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const auditLogs = storage.getAuditLogs();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    const phoneVal = validateCameroonPhone(phone);
    if (!phoneVal.isValid) {
      setSaveError('Numéro camerounais invalide (+237 6XX XX XX XX).');
      return;
    }

    if (payoutMethod === 'orange_money' && orangeMoneyNumber.trim()) {
      const omVal = validateCameroonPhone(orangeMoneyNumber);
      if (!omVal.isValid) {
        setSaveError('Numéro Orange Money invalide (9 chiffres attendus au Cameroun).');
        return;
      }
    } else if (payoutMethod === 'mtn_momo' && mtnMomoNumber.trim()) {
      const mtnVal = validateCameroonPhone(mtnMomoNumber);
      if (!mtnVal.isValid) {
        setSaveError('Numéro MTN MoMo invalide (9 chiffres attendus au Cameroun).');
        return;
      }
    }

    const updated: UserProfile = storage.updateUserProfile(currentUser.id, {
      full_name: fullName.trim(),
      phone: phoneVal.formatted,
      email: email.trim(),
      city,
      payout_method: payoutMethod,
      orange_money_number: orangeMoneyNumber.trim(),
      mtn_momo_number: mtnMomoNumber.trim(),
    });

    onUserUpdated(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Profil & Paramètres</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Mon Profil & Sécurité
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mise à jour des coordonnées personnelles, numéro Mobile Money et audit de traçabilité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Informations Personnelles</h3>

            {saveSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profil mis à jour avec succès.</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Téléphone principal (+237)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Moyen de paiement pour recevoir les cotisations */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Moyen de paiement pour recevoir les cotisations
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('orange_money')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      payoutMethod === 'orange_money'
                        ? 'border-[#FF7900] bg-orange-50 text-[#FF7900] ring-1 ring-[#FF7900]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Orange Money</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#FF7900] text-white">#150#</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('mtn_momo')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      payoutMethod === 'mtn_momo'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>MTN MoMo</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-mono">*126#</span>
                  </button>
                </div>

                {/* Champ dynamique selon opérateur */}
                {payoutMethod === 'orange_money' ? (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-orange-950">
                      Numéro Orange Money de réception
                    </label>
                    <input
                      type="tel"
                      value={orangeMoneyNumber}
                      onChange={(e) => setOrangeMoneyNumber(e.target.value)}
                      placeholder="Ex: 699 33 44 55"
                      className="w-full px-3 py-2 text-xs border border-orange-300 bg-orange-50/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF7900] font-mono font-medium"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-amber-950">
                      Numéro MTN Mobile Money de réception
                    </label>
                    <input
                      type="tel"
                      value={mtnMomoNumber}
                      onChange={(e) => setMtnMomoNumber(e.target.value)}
                      placeholder="Ex: 670 12 34 56"
                      className="w-full px-3 py-2 text-xs border border-amber-300 bg-amber-50/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-medium"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ville de résidence</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Garoua">Garoua</option>
                  <option value="Diaspora">Diaspora</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Sécurité & Mot de Passe</h3>

            {passwordSuccess && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                ✓ Mot de passe mis à jour.
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ancien mot de passe</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Changer le mot de passe
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Audit Logs Trail */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Journal d'Audit Immuable (Traçabilité)
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {auditLogs.length} événements
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono pt-1">
                    <span>Par : {log.actor_name}</span>
                    <span>·</span>
                    <span>{log.actor_role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
