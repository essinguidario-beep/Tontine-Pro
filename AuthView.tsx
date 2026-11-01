/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Authentication View (Inscription, Connexion, Mot de passe oublié)
 */

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { storage } from '../services/storage';
import { validateCameroonPhone } from '../services/mobileMoney';
import { UserProfile } from '../types';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'forgot_password';
  onSuccess: (user: UserProfile) => void;
  onNavigateLanding: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateLanding,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'reset_sent'>(initialMode);
  
  // Registration fields
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('+237 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [city, setCity] = useState('Douala');
  const [showPassword, setShowPassword] = useState(false);

  // Status & errors
  const [error, setError] = useState('');

  const profiles = storage.getProfiles();

  const handleQuickDemoLogin = (profile: UserProfile) => {
    storage.setCurrentUser(profile);
    onSuccess(profile);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      storage.setCurrentUser(found);
      onSuccess(found);
    } else {
      setError('Identifiants non reconnus. Vous pouvez utiliser les profils de démonstration ci-dessous ou vous inscrire.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!lastName.trim() || !firstName.trim()) {
      setError('Veuillez renseigner votre nom et prénom.');
      return;
    }

    const phoneVal = validateCameroonPhone(phone);
    if (!phoneVal.isValid) {
      setError('Le numéro de téléphone doit être un numéro camerounais valide (+237 6XX XX XX XX).');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez fournir une adresse e-mail valide.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    // Check duplicate
    if (profiles.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Cette adresse e-mail est déjà enregistrée. Veuillez vous connecter.');
      return;
    }

    const newUser = storage.registerUser({
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phone: phoneVal.formatted,
      email: email.trim(),
      city,
    });

    onSuccess(newUser);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    setMode('reset_sent');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Return button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site vitrine</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-slate-950 text-white text-center border-b border-slate-800">
          <div className="flex justify-center mb-2">
            <Logo size="md" variant="white" showTagline={false} />
          </div>
          <h2 className="text-base font-bold text-white">
            {mode === 'login' && 'Connexion à votre espace sécurisé'}
            {mode === 'register' && 'Création de votre compte TontinePro'}
            {(mode === 'forgot_password' || mode === 'reset_sent') && 'Récupération de mot de passe'}
          </h2>
          <p className="text-xs text-emerald-300 mt-1">
            Gérez vos tontines en toute sérénité
          </p>
        </div>

        {/* Content area */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Selector */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-left">
            <div className="text-[11px] font-bold text-emerald-950 mb-1 flex items-center justify-between">
              <span>Connexion Rapide Démo (1 Clic)</span>
              <span className="text-[9px] font-mono text-emerald-800 uppercase">Cameroun</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {profiles.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(p)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-100/60 border border-emerald-200 text-left text-[11px] transition shadow-2xs truncate"
                >
                  <div className="font-bold text-slate-900 truncate">{p.full_name.split(' ')[0]}</div>
                  <div className="text-[9px] text-slate-500 capitalize">{p.role === 'super_admin' ? 'Super Admin' : p.city}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jeanpaul.kamga@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot_password')}
                    className="text-[11px] text-emerald-700 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-9 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Se connecter
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Vous n'avez pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('register');
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  S'inscrire gratuitement
                </button>
              </div>
            </form>
          )}

          {/* Form Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kamga"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean-Paul"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Téléphone Cameroun (+237)
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 699 44 21 00"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ville</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Garoua">Garoua</option>
                  <option value="Bamenda">Bamenda</option>
                  <option value="Kribi">Kribi</option>
                  <option value="Diaspora">Diaspora / Étranger</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.cm"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Confirmer</label>
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Répéter"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm mt-2"
              >
                Créer mon compte
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}

          {/* Form Forgot Password */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
              <p className="text-xs text-slate-600">
                Entrez votre adresse e-mail pour recevoir un lien sécurisé de réinitialisation de votre mot de passe.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.cm"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                Envoyer le lien de réinitialisation
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Retour à la connexion
              </button>
            </form>
          )}

          {mode === 'reset_sent' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Lien envoyé avec succès</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Un e-mail contenant les instructions de réinitialisation sécurisée a été envoyé à <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="mt-3 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
