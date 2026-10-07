import React from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, ArrowUpRight, PieChart as PieIcon, Coins } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function StatsCards({ stats, onNavigateToPending }) {
  if (!stats) return null;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const methodData = (stats.methodStats || []).map((m) => ({
    name: m.payment_method,
    value: m.total || 0,
    count: m.count || 0,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Aprobado (USD & Bs) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Recibido</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900">
                ${(stats.totalApprovedUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-blue-600">USD</span>
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
              <span className="text-lg font-bold text-emerald-700">
                Bs. {(stats.totalApprovedBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-emerald-600">Bs</span>
            </div>
            <span className="text-[11px] text-slate-400 block pt-1">
              {stats.countApproved || 0} pagos aprobados
            </span>
          </div>
        </div>

        {/* Card 2: Pendientes por Revisar */}
        <div
          onClick={onNavigateToPending}
          className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-amber-50/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Por Aprobar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center animate-bounce">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-amber-900">
                ${(stats.totalPendingUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-amber-700">USD</span>
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-amber-100">
              <span className="text-lg font-bold text-amber-900">
                Bs. {(stats.totalPendingBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-amber-700">Bs</span>
            </div>
            <span className="text-[11px] text-amber-800 font-bold block pt-1">
              {stats.countPending || 0} reportes pendientes &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: Total Aprobados Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagos Aprobados</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats.countApproved || 0}</span>
            <span className="text-xs text-slate-500 block mt-1">Verificados en cuenta</span>
          </div>
        </div>

        {/* Card 4: Rechazados Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rechazados</span>
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats.countRejected || 0}</span>
            <span className="text-xs text-red-500 font-medium block mt-1">Inconsistentes o erróneos</span>
          </div>
        </div>
      </div>

      {/* Chart Section & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-blue-600" />
              <span>Distribución por Método y Moneda</span>
            </h3>
          </div>
          {methodData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Sin datos de pagos aprobados aún
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => [
                      `${item.payload.currency === 'Bs' ? 'Bs.' : '$'} ${Number(value).toLocaleString()}`,
                      'Monto Total'
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Payment Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Últimos Pagos Registrados</span>
          </h3>

          <div className="space-y-3">
            {(stats.recentPayments || []).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No hay movimientos recientes.</p>
            ) : (
              stats.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{p.client_name}</span>
                    <span className="text-xs text-slate-500 font-mono">{p.tracking_code} • {p.payment_method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 block">
                      {p.currency === 'Bs' ? 'Bs.' : '$'} {p.amount?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        p.status === 'Aprobado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
