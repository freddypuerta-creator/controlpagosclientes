import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Eye, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import PaymentModal from './PaymentModal';

export default function PaymentsTable({ initialStatusFilter = 'Todos' }) {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [currencyFilter, setCurrencyFilter] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminPayments({
        status: statusFilter,
        currency: currencyFilter,
        search: searchTerm,
      });
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error cargando pagos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, currencyFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleExportCSV = () => {
    const url = api.getExportUrl({ status: statusFilter, currency: currencyFilter, search: searchTerm });
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden space-y-4 p-6">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestión de Pagos de Clientes</h2>
          <p className="text-slate-500 text-xs mt-0.5">Revisa, aprueba o rechaza reportes de pago en Bolívares (Bs.) y Dólares ($ USD).</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['Todos', 'Pendiente', 'Aprobado', 'Rechazado'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'Todos' && 'Todos'}
                {status === 'Pendiente' && '⏳ Pendientes'}
                {status === 'Aprobado' && '✅ Aprobados'}
                {status === 'Rechazado' && '❌ Rechazados'}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['Todas', 'USD', 'Bs'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currencyFilter === curr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {curr === 'Todas' ? 'Todas Monedas' : curr === 'USD' ? '$ USD' : 'Bs. Bolívares'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar & Export Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, código, ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchPayments}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Actualizar tabla"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar a Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Datatable */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Código / Fecha</th>
              <th className="py-3.5 px-4">Cliente</th>
              <th className="py-3.5 px-4">Concepto</th>
              <th className="py-3.5 px-4">Monto & Moneda</th>
              <th className="py-3.5 px-4">Método & Referencia</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Cargando reportes de pago...</span>
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No se encontraron pagos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const isBs = p.currency === 'Bs';
                const symbol = isBs ? 'Bs.' : '$';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 block text-xs">{p.tracking_code}</span>
                      <span className="text-[11px] text-slate-400">{p.payment_date}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{p.client_name}</span>
                      <span className="text-[11px] font-mono text-slate-500">({p.client_code})</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-700" title={p.concept}>
                      {p.concept}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-600 block">
                        {symbol} {p.amount?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isBs ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.currency || 'USD'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-medium text-slate-800 block">{p.payment_method}</span>
                      <span className="font-mono text-slate-500">Ref: {p.reference_number}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.status === 'Aprobado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : p.status === 'Rechazado'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {p.status === 'Aprobado' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {p.status === 'Rechazado' && <XCircle className="w-3 h-3 text-red-600" />}
                        {p.status === 'Pendiente' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Revisar</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onPaymentUpdated={() => {
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}
