/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Mobile Money Cameroon Integration Module
 * Real architectural patterns for MTN MoMo & Orange Money Cameroun
 */

export interface MobileMoneyConfig {
  mtnApiUser: string;
  mtnApiKey: string;
  mtnSubscriptionKey: string;
  mtnMerchantId: string;
  orangeClientId: string;
  orangeClientSecret: string;
  orangeMerchantKey: string;
  webhookCallbackUrl: string;
  environment: 'sandbox' | 'production';
}

export const DEFAULT_MOMO_CONFIG: MobileMoneyConfig = {
  mtnApiUser: 'cm_momo_user_prod',
  mtnApiKey: '••••••••••••••••••••••••••••••••',
  mtnSubscriptionKey: 'sub_key_cameroon_mtn_2026',
  mtnMerchantId: '23790482',
  orangeClientId: 'cm_orange_client_092',
  orangeClientSecret: '••••••••••••••••••••••••••••••••',
  orangeMerchantKey: 'cm_om_key_9921',
  webhookCallbackUrl: 'https://api.tontinepro.cm/v1/webhooks/mobile-money',
  environment: 'production',
};

export function validateCameroonPhone(phone: string): { isValid: boolean; operator?: 'MTN' | 'ORANGE' | 'OTHER'; formatted: string } {
  // Clean string
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  let standard = clean;

  if (standard.startsWith('+237')) {
    standard = standard.slice(4);
  } else if (standard.startsWith('00237')) {
    standard = standard.slice(5);
  } else if (standard.startsWith('237')) {
    standard = standard.slice(3);
  }

  // Cameroon mobile numbers are 9 digits and start with 6
  if (!/^6[0-9]{8}$/.test(standard)) {
    return { isValid: false, formatted: phone };
  }

  // Operator detection
  // MTN Cameroon: 67x, 68x, 650-654
  // Orange Cameroon: 69x, 655-659
  let operator: 'MTN' | 'ORANGE' | 'OTHER' = 'OTHER';
  const prefix2 = standard.slice(0, 2);
  const prefix3 = standard.slice(0, 3);

  if (prefix2 === '67' || prefix2 === '68' || ['650', '651', '652', '653', '654'].includes(prefix3)) {
    operator = 'MTN';
  } else if (prefix2 === '69' || ['655', '656', '657', '658', '659'].includes(prefix3)) {
    operator = 'ORANGE';
  }

  const formatted = `+237 ${standard.slice(0, 3)} ${standard.slice(3, 5)} ${standard.slice(5, 7)} ${standard.slice(7, 9)}`;
  return { isValid: true, operator, formatted };
}

export function generateTransactionReference(prefix: 'COT' | 'PAY' | 'SUB' | 'DEP' = 'COT'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${randomHex}`;
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export interface PaymentInitiationResult {
  success: boolean;
  transactionRef: string;
  provider: 'mtn_momo' | 'orange_money' | 'cash' | 'bank_transfer';
  status: 'confirmed' | 'pending' | 'failed';
  ussdPromptCode?: string;
  message: string;
}

export async function initiateMobileMoneyPayment(params: {
  amount: number;
  phone: string;
  provider: 'mtn_momo' | 'orange_money';
  description: string;
}): Promise<PaymentInitiationResult> {
  const phoneValidation = validateCameroonPhone(params.phone);
  const txRef = generateTransactionReference(params.description.includes('Abonnement') ? 'SUB' : 'COT');

  if (!phoneValidation.isValid) {
    return {
      success: false,
      transactionRef: txRef,
      provider: params.provider,
      status: 'failed',
      message: 'Numéro de téléphone camerounais non valide (+237 6XX XX XX XX requis).',
    };
  }

  const ussdCode = params.provider === 'mtn_momo' 
    ? `*126#`
    : `*150#`;

  // Realistic mock API response latency
  await new Promise((r) => setTimeout(r, 900));

  return {
    success: true,
    transactionRef: txRef,
    provider: params.provider,
    status: 'confirmed',
    ussdPromptCode: ussdCode,
    message: `Paiement de ${formatFCFA(params.amount)} validé avec succès par ${params.provider === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}.`,
  };
}
