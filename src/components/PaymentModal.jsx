import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, ExternalLink, User, DollarSign, Calendar, Hash, Mail, Phone, Tag, Coins } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentModal({ payment, onClose, onPaymentUpdated }) {
  if (!payment) return null;

  const [adminNotes, setAdminNotes] = useState(payment.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStatusUpdate = async (newStatus) => {
    setErrorMsg('');
    setIsUpdating(true);
    try {
      await api.updatePaymentStatus(payment.id, newStatus, adminNotes);
      if (onPaymentUpdated) onPaymentUpdated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error al actualizar el estado del pago.');
    } finally {
      setIsUpdating(false);
    }
  };

  const currencySymbol = payment.currency === 'Bs' ? 'Bs.' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 block">{payment.tracking_code}</span>
              <h2 className="text-lg font-bold text-slate-900">Detalles del Reporte de Pago</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Monto Reportado</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-emerald-600">
                  {currencySymbol} {payment.amount?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md uppercase">
                  {payment.currency || 'USD'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">Estado Actual</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  payment.status === 'Aprobado'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : payment.status === 'Rechazado'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {payment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos del Cliente</h3>
              <div className="space-y-2">
                <div className="flex items-center text-slate-700">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span className="font-semibold text-slate-900">{payment.client_name}</span>
                </div>
                <div className="flex items-center text-slate-600 text-xs">
                  <Tag className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>Código: <strong className="font-mono text-blue-700">{payment.client_code}</strong></span>
                </div>
                {payment.contact_email && (
                  <div className="flex items-center text-slate-600 text-xs">
                    <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <span>{payment.contact_email}</span>
                  </div>
                )}
                {payment.contact_phone && (
                  <div className="flex items-center text-slate-600 text-xs">
                    <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <span>{payment.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detalles de Transferencia</h3>
              <div className="space-y-2">
                <div className="flex items-center text-slate-700">
                  <Coins className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>Método: <strong>{payment.payment_method}</strong> ({payment.currency || 'USD'})</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Hash className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>Referencia: <strong className="font-mono">{payment.reference_number}</strong></span>
                </div>
                <div className="flex items-center text-slate-600 text-xs">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>Fecha: {payment.payment_date}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Concepto / Servicio Reportado</span>
            <p className="text-slate-800 text-sm font-medium">{payment.concept}</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase block">Comprobante Adjunto</span>
            {payment.receipt_url ? (
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                {payment.receipt_url.endsWith('.pdf') ? (
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 font-semibold hover:underline"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Ver Documento PDF Adjunto</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <div className="space-y-2">
                    <img
                      src={payment.receipt_url}
                      alt="Comprobante"
                      className="max-h-64 mx-auto rounded-lg shadow border"
                    />
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 font-medium hover:underline"
                    >
                      <span>Abrir imagen completa en nueva pestaña</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-slate-400 text-xs">
                No se adjuntó archivo de comprobante en este reporte.
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase block">
              Notas / Observaciones del Administrador
            </label>
            <textarea
              rows={3}
              placeholder="Escribe comentarios o razón del rechazo/aprobación..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium text-sm hover:text-slate-900"
          >
            Cerrar
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => handleStatusUpdate('Rechazado')}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center space-x-1.5 shadow-md shadow-red-500/20 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Rechazar Pago</span>
            </button>
            <button
              onClick={() => handleStatusUpdate('Aprobado')}
              disabled={isUpdating}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Aprobar Pago</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
