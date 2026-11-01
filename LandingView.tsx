/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Landing Page (Site Vitrine Haut de Gamme)
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Coins,
  Users,
  CalendarCheck,
  FileText,
  Check,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Lock,
  Zap,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

interface LandingViewProps {
  onNavigate: (view: string) => void;
  onOpenSupabaseModal: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const features = [
    {
      icon: Coins,
      title: 'Cotisations & Mobile Money',
      desc: 'Enregistrez les versements en direct par MTN Mobile Money (*126#) et Orange Money (*150#) avec génération instantanée de reçus cryptés.',
    },
    {
      icon: CalendarCheck,
      title: 'Calendrier & Tirage des Tours',
      desc: 'Programmation claire de l’ordre des bénéficiaires. Fini les contestations : chacun connaît sa date exacte de prise de la cagnotte.',
    },
    {
      icon: Users,
      title: 'Gestion Complète des Membres',
      desc: 'Suivez le rôle de chacun (Président, Trésorier, Secrétaire, Membre), l’historique des parts cotisées et le solde restant.',
    },
    {
      icon: ShieldCheck,
      title: 'Dettes & Pénalités Automatisées',
      desc: 'Détection instantanée des retards dès la date d’échéance dépassée avec application équitable des règles validées par le groupe.',
    },
    {
      icon: FileText,
      title: 'Rapports PDF & Reçus Officiels',
      desc: 'Téléchargez vos bilans comptables mensuels, la situation de caisse et les reçus individuels infalsifiables avec signature numérique.',
    },
    {
      icon: Lock,
      title: 'Sécurité & Traçabilité Immuable',
      desc: 'Grand livre d’audit financier où aucune transaction validée ne disparaît : toute correction est documentée pour une transparence totale.',
    },
  ];

  const plans = [
    {
      name: 'STARTER',
      price: '2 000',
      period: 'FCFA / mois',
      desc: 'Idéal pour les petites tontines familiales ou entre collègues de bureau.',
      features: [
        'Jusqu’à 15 membres',
        '1 tontine active',
        'Gestion des cotisations',
        'Suivi des bénéficiaires',
        'Reçus individuels',
        'Support standard par email',
      ],
      isPopular: false,
      cta: 'Commencer en Starter',
    },
    {
      name: 'BUSINESS',
      price: '5 000',
      period: 'FCFA / mois',
      desc: 'Le choix privilégié des grandes associations et mutuelles de commerçants.',
      features: [
        'Jusqu’à 50 membres',
        'Jusqu’à 5 tontines actives',
        'Rapports PDF complets & Exports Excel',
        'Gestion des dépenses & caisse de secours',
        'Alertes de retards & SMS / WhatsApp',
        'Statistiques financières avancées',
        'Support prioritaire Douala / Yaoundé',
      ],
      isPopular: true,
      cta: 'Choisir l’offre Business',
    },
    {
      name: 'PREMIUM',
      price: '10 000',
      period: 'FCFA / mois',
      desc: 'Pour les grands regroupements professionnels, réseaux d’entrepreneurs et mutuelles régionales.',
      features: [
        'Membres illimités',
        'Tontines illimitées',
        'Multi-rôles avancés (Trésoriers multiples)',
        'Passerelle Mobile Money dédiée',
        'Audit de conformité & exports fiscaux',
        'Accompagnement VIP dédié par téléphone',
      ],
      isPopular: false,
      cta: 'Activer l’offre Premium',
    },
  ];

  const faqs = [
    {
      q: 'Comment TontinePro assure-t-elle la sécurité de notre argent ?',
      a: 'TontinePro ne garde pas directement les fonds de votre tontine en séquestre non réglementé. Nous fournissons la plateforme technologique de suivi, de traçabilité et d’interfaçage avec les opérateurs agréés MTN MoMo, Orange Money et les banques camerounaises. Toutes les écritures sont scellées et vérifiables par chaque membre.',
    },
    {
      q: 'Les membres peuvent-ils consulter leurs cotisations depuis leur téléphone portable ?',
      a: 'Absolument ! TontinePro est une Progressive Web App (PWA) optimisée pour les smartphones Android et iPhone. Chaque membre accède à son espace personnel, consulte son solde et télécharge ses reçus sans devoir installer une application lourde.',
    },
    {
      q: 'Comment fonctionne l’intégration avec MTN Mobile Money et Orange Money ?',
      a: 'Lorsqu’un membre effectue un versement, une référence unique de transaction est générée et vérifiée. Le trésorier ou l’administrateur valide le crédit qui met à jour en temps réel la trésorerie et la cagnotte du cycle.',
    },
    {
      q: 'Puis-je exporter nos bilans en format PDF ou Excel ?',
      a: 'Oui, d’un simple clic vous pouvez générer le rapport financier mensuel, la liste des adhérents à jour, le relevé des cagnottes distribuées et les reçus certifiés avec QR code.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <Zap className="w-3.5 h-3.5" />
                <span>Plateforme FinTech 100% pensée pour le Cameroun & l'Afrique</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Gérez vos tontines simplement, partout et{' '}
                <span className="text-emerald-400">en toute transparence.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Suivez les cotisations, gérez vos membres, organisez les bénéficiaires et gardez le contrôle de votre argent grâce à TontinePro.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <span>Créer mon compte gratuit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>Découvrir la démo en direct</span>
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-mono font-bold text-lg text-white tabular-nums">100%</div>
                  <div className="text-slate-400">Reçus certifiés</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-lg text-white tabular-nums">MTN & OM</div>
                  <div className="text-slate-400">Paiements Cameroun</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-lg text-white tabular-nums">0 Litige</div>
                  <div className="text-slate-400">Transparence totale</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Douala · Session Sécurisée</span>
                </div>

                <div className="mt-3 relative rounded-xl overflow-hidden aspect-[4/3]">
                  <img
                    src="/src/assets/images/mobile_money_african_hand_1793331357093.jpg"
                    alt="Application TontinePro avec Mobile Money"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Cycle 3 en cours</span>
                    <p className="text-sm font-bold text-white mt-0.5">Tontine des Ingénieurs de Douala</p>
                    <p className="text-xs text-slate-300 font-mono tabular-nums">Cagnotte : 300 000 FCFA prête à débourser</p>
                  </div>
                </div>

                {/* Micro proof card */}
                <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Cotisation reçue</div>
                      <div className="text-[10px] text-slate-400 font-mono">Dieudonné Fotso · MTN MoMo</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">+50 000 FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
              Fonctionnalités Clés
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Tout ce dont votre bureau de tontine a besoin
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Conçu avec les présidents, trésoriers et membres de tontines à Douala, Yaoundé, Bafoussam et la diaspora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cameroon Mobile Money Spotlight */}
      <section id="mobile-money" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-emerald-800/40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                  Paiements Sécurisés Cameroun
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">
                  Intégration directe MTN Mobile Money et Orange Money
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-4 leading-relaxed">
                  Chaque membre peut cotiser sans quitter son domicile. Le système valide automatiquement le code de transaction officiel et met à jour instantanément la caisse de la tontine.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                    <span>USSD officiel : <strong>*126#</strong> (MTN) et <strong>*150#</strong> (Orange)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                    <span>Prévention absolue des doublons de reçus et fausses captures</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">✓</div>
                    <span>Reçu de versement avec référence unique et QR code vérifiable</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => onNavigate('cotisations')}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Tester un paiement de cotisation
                  </button>
                  <button
                    onClick={onOpenSupabaseModal}
                    className="px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold rounded-xl transition border border-slate-700"
                  >
                    Voir l'architecture technique
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* MTN Card */}
                <div className="w-full sm:w-56 p-5 rounded-2xl bg-amber-400 text-slate-950 shadow-lg text-left">
                  <div className="font-black text-xl mb-1">MTN MoMo</div>
                  <p className="text-xs font-medium text-slate-900/80 mb-4">Service *126# Cameroun</p>
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl text-xs space-y-1">
                    <div className="text-[10px] text-slate-600 font-mono">Dernière transaction</div>
                    <div className="font-bold text-slate-900 font-mono tabular-nums">+50 000 FCFA</div>
                    <div className="text-[9px] text-emerald-700 font-semibold">✓ Statut : Validé</div>
                  </div>
                </div>

                {/* Orange Card */}
                <div className="w-full sm:w-56 p-5 rounded-2xl bg-orange-500 text-white shadow-lg text-left">
                  <div className="font-black text-xl mb-1">Orange Money</div>
                  <p className="text-xs font-medium text-orange-100 mb-4">Service *150# Cameroun</p>
                  <div className="bg-white/90 text-slate-900 p-3 rounded-xl text-xs space-y-1">
                    <div className="text-[10px] text-slate-600 font-mono">Dernière transaction</div>
                    <div className="font-bold text-slate-900 font-mono tabular-nums">+25 000 FCFA</div>
                    <div className="text-[9px] text-emerald-700 font-semibold">✓ Statut : Validé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Subscriptions Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
              Nos Abonnements
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Des tarifs simples et transparents en FCFA
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Choisissez l'offre qui correspond à la taille de votre tontine. Essai gratuit de 14 jours inclus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-left transition relative ${
                  p.isPopular
                    ? 'border-2 border-emerald-600 shadow-xl ring-4 ring-emerald-600/10'
                    : 'border border-slate-200 shadow-xs'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider">
                    Recommandé pour les associations
                  </div>
                )}

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.desc}</p>

                  <div className="mt-5 pb-5 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">{p.price}</span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">{p.period}</span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Inclus dans l'offre :
                    </div>
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('abonnement')}
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs transition ${
                    p.isPopular
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Testimonials (Explicitly identified as demonstration data) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Retours d'Expérience (Démonstration Fictive)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Ils ont digitalisé leur tontine avec TontinePro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                « Avant TontinePro, nous avions toujours des disputes sur qui avait payé et quand. Désormais, chaque membre reçoit son reçu par WhatsApp dès la confirmation MoMo. La paix est revenue dans notre réunion. »
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar_president_douala_1793331356280.jpg"
                  alt="Témoignage Jean-Paul"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900">Jean-Paul Kamga</div>
                  <div className="text-[10px] text-slate-500">Président, Tontine des Cadres (Douala)</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                « En tant que trésorière de 15 commerçants au marché Mokolo, la fin du mois était un calvaire. Maintenant les calculs d’intérêts, les pénalités et les cagnottes se font automatiquement. Un gain de temps inestimable. »
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src="/src/assets/images/avatar_treasurer_yaounde_1793331357241.jpg"
                  alt="Témoignage Marie Claire"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900">Marie Claire Ngo Ndjock</div>
                  <div className="text-[10px] text-slate-500">Trésorière Association Mokolo (Yaoundé)</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                « Vivant en France, je participe toujours à la tontine familiale à Deido. Je peux cotiser en direct, voir le tableau des tours et télécharger mes justificatifs à tout moment sans dépendre d'un appel téléphonique. »
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  AM
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Alain Mbida</div>
                  <div className="text-[10px] text-slate-500">Membre Diaspora (Paris / Douala)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Foire Aux Questions
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Des réponses claires à vos questions les plus fréquentes.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((f, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer transition hover:border-slate-300"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f.q}</span>
                  </div>
                  <span className="text-slate-400 ml-4 font-mono">{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed pl-6 border-t border-slate-100 pt-3">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Besoin d'une démonstration ?</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Notre équipe vous accompagne pour digitaliser les tontines de votre entreprise, de votre famille ou de votre quartier.
                </p>

                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>+237 670 12 34 56 / +237 699 44 21 00</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <span>contact@tontinepro.cm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Akwa, Boulevard de la Liberté, Douala - Cameroun</span>
                  </div>
                </div>
              </div>

              <div>
                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold">✓</div>
                    <h4 className="font-bold text-slate-900 text-xs">Message bien reçu !</h4>
                    <p className="text-[11px] text-slate-600">Un conseiller TontinePro vous contactera sous 24h.</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3 text-left"
                  >
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Votre Nom & Prénom</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Samuel Eto'o Mbappé"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Téléphone (+237)</label>
                      <input
                        type="text"
                        required
                        placeholder="+237 6XX XX XX XX"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Votre message</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Parlez-nous de votre tontine..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
                    >
                      Envoyer ma demande
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            <div>
              <Logo size="md" variant="white" showTagline={true} />
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                Solution FinTech leader pour la gestion, la numérisation et la traçabilité des tontines en Afrique francophone.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => onNavigate('landing')} className="hover:text-emerald-400">Accueil</button></li>
                <li><a href="#features" className="hover:text-emerald-400">Fonctionnalités</a></li>
                <li><a href="#mobile-money" className="hover:text-emerald-400">Mobile Money Cameroun</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400">Tarifs & Abonnements</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Légal & Éthique</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><span className="hover:text-emerald-400 cursor-pointer">Conditions Générales d'Utilisation</span></li>
                <li><span className="hover:text-emerald-400 cursor-pointer">Politique de Confidentialité</span></li>
                <li><span className="hover:text-emerald-400 cursor-pointer">Sécurité des Données (CEMAC)</span></li>
                <li><span className="hover:text-emerald-400 cursor-pointer">Mention Légales & Agrément</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Développeurs & API</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={onOpenSupabaseModal} className="hover:text-emerald-400">Schéma SQL Supabase (16 Tables)</button></li>
                <li><span className="text-slate-500">API Documentation (Swagger)</span></li>
                <li><span className="text-slate-500">Passerelle MTN MoMo / Orange Money</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 gap-4">
            <div>
              © 2026 TontinePro SAS · Tous droits réservés · Conçu à Douala, Cameroun.
            </div>
            <div className="flex items-center gap-4">
              <span>Devise : FCFA (XAF)</span>
              <span>·</span>
              <span>Fuseau : Africa/Douala</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
