/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro Lite - WhatsApp Messaging & Share Module
 * Complies with Section 8 & 12 of specifications
 */

/**
 * Cleans phone number to international Cameroon format (2376XXXXXXXX)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('237') && digits.length >= 12) {
    return digits;
  }
  if (digits.length === 9 && digits.startsWith('6')) {
    return `237${digits}`;
  }
  return digits;
}

/**
 * Builds the official WhatsApp reminder message strictly matching Section 8:
 *
 * Bonjour [Nom du membre],
 *
 * Votre cotisation de [Montant] FCFA pour la tontine [Nom de la tontine] est en attente.
 *
 * Merci de régulariser votre situation auprès du responsable.
 *
 * TontinePro Lite.
 */
export function buildWhatsAppReminderMessage(params: {
  memberName: string;
  amount: number;
  tontineName: string;
}): string {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(params.amount);

  return `Bonjour ${params.memberName},\n\nVotre cotisation de ${formattedAmount} FCFA pour la tontine ${params.tontineName} est en attente.\n\nMerci de régulariser votre situation auprès du responsable.\n\nTontinePro Lite.`;
}

/**
 * Generates direct wa.me URL for payment reminders
 */
export function getWhatsAppReminderUrl(params: {
  phone: string;
  memberName: string;
  amount: number;
  tontineName: string;
}): string {
  const cleanPhone = formatPhoneForWhatsApp(params.phone);
  const text = buildWhatsAppReminderMessage({
    memberName: params.memberName,
    amount: params.amount,
    tontineName: params.tontineName,
  });

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generates direct wa.me invitation URL for tontine members (Section 12)
 */
export function getWhatsAppTontineInviteUrl(params: {
  tontineName: string;
  contributionAmount: number;
  frequency: string;
}): string {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(params.contributionAmount);

  const text = `Bonjour ! Je vous invite à rejoindre notre tontine "${params.tontineName}" sur TontinePro Lite.\n\nCotisation : ${formattedAmount} FCFA (${params.frequency})\nSuivi en direct, historique transparent et reçus instantanés.\n\nRejoignez-nous sur TontinePro Lite : https://tontinepro.codunk.com`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generates direct wa.me viral invitation for another tontine manager (Section 12)
 */
export function getWhatsAppManagerReferralUrl(managerName: string): string {
  const text = `Salut confrère/consœur responsable de tontine ! C'est ${managerName}.\n\nJe te recommande TontinePro Lite pour gérer facilement nos tontines au Cameroun (suivi des cotisations en FCFA, rappels WhatsApp en 1 clic et bilans financiers automatiques sans papier).\n\nDécouvre la plateforme ici : https://tontinepro.codunk.com`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
