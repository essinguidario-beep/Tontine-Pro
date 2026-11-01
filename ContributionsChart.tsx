/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Monthly Contributions Evolution Chart (Recharts)
 * Connects directly to the real database storage without mock overrides
 */

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Coins,
  Filter,
  Layers,
  ArrowUpRight,
  Smartphone,
  Wallet,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatFCFA } from '../../services/mobileMoney';
import { Contribution, BeneficiaryRound, Tontine } from '../../types';

interface ContributionsChartProps {
  contributions: Contribution[];
  beneficiaries: BeneficiaryRound[];
  tontines?: Tontine[];
}

export const ContributionsChart: React.FC<ContributionsChartProps> = ({
  contributions,
  beneficiaries,
  tontines = [],
}) => {
  const [chartType, setChartType] = useState<'area' | 'breakdown' | 'composed'>('area');
  const [selectedTontineId, setSelectedTontineId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');

  // Month reference definitions for 2026
  const allMonths = useMemo(() => [
    { key: '2026-01', short: 'Jan', label: 'Janvier 2026' },
    { key: '2026-02', short: 'Fév', label: 'Février 2026' },
    { key: '2026-03', short: 'Mar', label: 'Mars 2026' },
    { key: '2026-04', short: 'Avr', label: 'Avril 2026' },
    { key: '2026-05', short: 'Mai', label: 'Mai 2026' },
    { key: '2026-06', short: 'Juin', label: 'Juin 2026' },
    { key: '2026-07', short: 'Juil', label: 'Juillet 2026' },
    { key: '2026-08', short: 'Août', label: 'Août 2026' },
    { key: '2026-09', short: 'Sept', label: 'Septembre 2026' },
    { key: '2026-10', short: 'Oct', label: 'Octobre 2026' },
    { key: '2026-11', short: 'Nov', label: 'Novembre 2026' },
    { key: '2026-12', short: 'Déc', label: 'Décembre 2026' },
  ], []);

  const displayMonths = useMemo(() => {
    return timeRange === '6m' ? allMonths.slice(0, 6) : allMonths;
  }, [timeRange, allMonths]);

  // Aggregate monthly data directly and strictly from the current storage database
  const chartData = useMemo(() => {
    // 1. Filter by tontine if a specific one is selected
    const filteredContributions = selectedTontineId === 'all'
      ? contributions
      : contributions.filter((c) => c.tontine_id === selectedTontineId);

    const filteredBeneficiaries = selectedTontineId === 'all'
      ? beneficiaries
      : beneficiaries.filter((b) => b.tontine_id === selectedTontineId);

    return displayMonths.map((m) => {
      // Confirmed contributions matching this month
      const monthContribs = filteredContributions.filter((c) => {
        return c.payment_date && c.payment_date.startsWith(m.key) && c.status === 'confirmed';
      });

      const totalCotisations = monthContribs.reduce((acc, c) => acc + c.amount, 0);

      // Payment method breakdown using actual storage records
      const momoTotal = monthContribs
        .filter((c) => c.payment_method === 'mtn_momo')
        .reduce((acc, c) => acc + c.amount, 0);

      const omTotal = monthContribs
        .filter((c) => c.payment_method === 'orange_money')
        .reduce((acc, c) => acc + c.amount, 0);

      const cashBankTotal = monthContribs
        .filter((c) => c.payment_method === 'cash' || c.payment_method === 'bank_transfer')
        .reduce((acc, c) => acc + c.amount, 0);

      // Actual payouts for this month
      const monthPayouts = filteredBeneficiaries.filter((b) => {
        return b.status === 'paid' && b.payout_date && b.payout_date.startsWith(m.key);
      });
      const totalPayouts = monthPayouts.reduce((acc, b) => acc + b.pot_amount, 0);

      return {
        month: m.short,
        fullLabel: m.label,
        cotisations: totalCotisations,
        momo: momoTotal,
        orange: omTotal,
        especes: cashBankTotal,
        cagnottes: totalPayouts,
        soldeNet: totalCotisations - totalPayouts,
        count: monthContribs.length,
      };
    });
  }, [displayMonths, contributions, beneficiaries, selectedTontineId]);

  // Aggregated KPIs across the selected timeframe
  const summary = useMemo(() => {
    const totalCollected = chartData.reduce((acc, d) => acc + d.cotisations, 0);
    const totalPayouts = chartData.reduce((acc, d) => acc + d.cagnottes, 0);
    const totalMomo = chartData.reduce((acc, d) => acc + d.momo, 0);
    const totalOrange = chartData.reduce((acc, d) => acc + d.orange, 0);
    const totalCash = chartData.reduce((acc, d) => acc + d.especes, 0);
    const activeMonthsCount = chartData.filter((d) => d.cotisations > 0).length || 1;
    const monthlyAverage = Math.round(totalCollected / activeMonthsCount);

    // Peak month
    const peak = [...chartData].sort((a, b) => b.cotisations - a.cotisations)[0];

    const momoPct = totalCollected > 0 ? Math.round((totalMomo / totalCollected) * 100) : 0;
    const omPct = totalCollected > 0 ? Math.round((totalOrange / totalCollected) * 100) : 0;
    const cashPct = totalCollected > 0 ? Math.round((totalCash / totalCollected) * 100) : 0;

    return {
      totalCollected,
      totalPayouts,
      monthlyAverage,
      peakMonth: peak?.cotisations > 0 ? `${peak.fullLabel} (${formatFCFA(peak.cotisations)})` : 'Aucun',
      momoPct,
      omPct,
      cashPct,
      activeMonthsCount,
    };
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs text-left min-w-[230px] space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200">{data.fullLabel}</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">
              {data.count} versement(s)
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Total collecté :</span>
              </span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {formatFCFA(data.cotisations)}
              </span>
            </div>

            {chartType === 'composed' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  <span>Cagnottes versées :</span>
                </span>
                <span className="font-mono font-bold text-blue-400 tabular-nums">
                  {formatFCFA(data.cagnottes)}
                </span>
              </div>
            )}

            {/* Breakdown per payment channel */}
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>MTN MoMo (*126#) :</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">{formatFCFA(data.momo)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>Orange Money (*150#) :</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">{formatFCFA(data.orange)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Espèces & Banque :</span>
                </span>
                <span className="font-mono text-slate-200 tabular-nums">{formatFCFA(data.especes)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-left">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Évolution Mensuelle des Cotisations Collectées
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Recharts · Données réelles
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Suivi direct de la trésorerie issu du grand livre · Total période :{' '}
            <strong className="text-slate-900 font-mono tabular-nums">
              {formatFCFA(summary.totalCollected)}
            </strong>
          </p>
        </div>

        {/* Action Controls: Tontine Filter + Timeframe + View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tontine Filter */}
          {tontines.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={selectedTontineId}
                onChange={(e) => setSelectedTontineId(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 py-1 pr-2 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Toutes les tontines</option>
                {tontines.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timeframe Selector (6M vs 12M) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                timeRange === '6m'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Mois
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('12m')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                timeRange === '12m'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Mois
            </button>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Courbe d'évolution"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Courbe
            </button>
            <button
              type="button"
              onClick={() => setChartType('breakdown')}
              title="Répartition par mode de paiement"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                chartType === 'breakdown'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MoMo / OM
            </button>
            <button
              type="button"
              onClick={() => setChartType('composed')}
              title="Comparaison Cotisations vs Cagnottes"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                chartType === 'composed'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flux vs Cagnottes
            </button>
          </div>
        </div>
      </div>

      {/* Main Recharts Area Container */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCotisationsReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cotisations"
                name="Cotisations Collectées"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCotisationsReal)"
                activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : chartType === 'breakdown' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
              />
              <Bar
                dataKey="momo"
                name="MTN Mobile Money (*126#)"
                stackId="a"
                fill="#eab308"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="orange"
                name="Orange Money (*150#)"
                stackId="a"
                fill="#f97316"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="especes"
                name="Espèces / Virement"
                stackId="a"
                fill="#059669"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
              />
              <Bar
                dataKey="cotisations"
                name="Cotisations Collectées (Entrées)"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Area
                type="monotone"
                dataKey="cagnottes"
                name="Cagnottes Versées (Sorties)"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="#dbeafe"
                fillOpacity={0.4}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Financial Health & Insights Derived Directly from Database */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-500 font-medium">Moyenne mensuelle</div>
          <div className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {formatFCFA(summary.monthlyAverage)}
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-500 font-medium">Mois record</div>
          <div className="text-xs font-bold text-emerald-700 font-mono tabular-nums mt-0.5 truncate">
            {summary.peakMonth}
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-500 font-medium">Part Mobile Money</div>
          <div className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {summary.momoPct + summary.omPct}% <span className="text-[10px] font-normal text-slate-500">({summary.momoPct}% MoMo · {summary.omPct}% OM)</span>
          </div>
        </div>

        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-500 font-medium">Flux net de trésorerie</div>
          <div className="text-xs font-bold text-emerald-800 font-mono tabular-nums mt-0.5">
            {formatFCFA(summary.totalCollected - summary.totalPayouts)}
          </div>
        </div>
      </div>
    </div>
  );
};
