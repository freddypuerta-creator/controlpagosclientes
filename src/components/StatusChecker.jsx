import React, { useState } from 'react';
import { Search, CheckCircle, Clock, XCircle, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function StatusChecker() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setErrorMsg('');
    setIsLoading(true);
    try {
      const data = await api.checkStatus(query.trim());
      setResults(data.payments || []);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudieron recuperar los pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprobado':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aprobado</span>
          </span>
        );
      case 'Rechazado':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rechazado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Pendiente de Revisión</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-6 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Consulta el Estado de tus Pagos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ingresa tu código de seguimiento (Ej: PAY-2026-1001), tu código de cliente o número de referencia.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Código PAY-, Cédula/Código o Referencia..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Buscar</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {results !== null && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-semibold text-slate-600">
              Resultados de la búsqueda ({results.length})
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-medium">No se encontraron pagos con ese código o referencia.</p>
              <p className="text-xs text-slate-400">Verifica haber escrito correctamente tu código o número de referencia.</p>
            </div>
          ) : (
            results.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código Seguimiento</span>
                    <h3 className="text-lg font-mono font-bold text-blue-700">{payment.tracking_code}</h3>
                  </div>
                  <div>{getStatusBadge(payment.status)}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Cliente</span>
                    <span className="font-semibold text-slate-800">{payment.client_name}</span>
                    <span className="text-xs text-slate-500 block">({payment.client_code})</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Monto Reportado</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {payment.currency === 'Bs' ? 'Bs.' : '$'} {payment.amount?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 block uppercase">
                      ({payment.currency || 'USD'})
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Método & Ref</span>
                    <span className="font-medium text-slate-700 block">{payment.payment_method}</span>
                    <span className="text-xs font-mono text-slate-500">Ref: {payment.reference_number}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Fecha Reporte</span>
                    <span className="font-medium text-slate-700">{payment.payment_date}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Concepto:</span>
                  <p className="text-slate-600 font-medium">{payment.concept}</p>
                </div>

                {payment.admin_notes && (
                  <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-blue-900 block">Nota del Administrador:</span>
                    <p className="text-blue-800 leading-relaxed">{payment.admin_notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
