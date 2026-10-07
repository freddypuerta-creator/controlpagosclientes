import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, Send, AlertCircle, Copy, Check, Info, DollarSign, Coins } from 'lucide-react';
import { api } from '../services/api';

export default function ClientForm({ onPaymentSubmitted, clientsList = [] }) {
  const [formData, setFormData] = useState({
    client_code: '',
    client_name: '',
    concept: '',
    amount: '',
    currency: 'USD',
    payment_method: 'Transferencia Bancaria',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    contact_email: '',
    contact_phone: '',
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleClientCodeChange = (e) => {
    const code = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, client_code: code }));

    const found = clientsList.find((c) => c.client_code.toUpperCase() === code);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        client_code: code,
        client_name: found.name || prev.client_name,
        contact_email: found.email || prev.contact_email,
        contact_phone: found.phone || prev.contact_phone,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('El archivo supera el límite máximo de 10 MB.');
        return;
      }
      setReceiptFile(file);
      setErrorMsg('');

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.client_code || !formData.client_name || !formData.concept || !formData.amount || !formData.reference_number) {
      setErrorMsg('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setErrorMsg('El monto debe ser un valor positivo mayor a 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (receiptFile) {
        data.append('receipt', receiptFile);
      }

      const res = await api.reportPayment(data);
      setSuccessResult(res.data);
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (successResult?.tracking_code) {
      navigator.clipboard.writeText(successResult.tracking_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetForm = () => {
    setFormData({
      client_code: '',
      client_name: '',
      concept: '',
      amount: '',
      currency: 'USD',
      payment_method: 'Transferencia Bancaria',
      reference_number: '',
      payment_date: new Date().toISOString().split('T')[0],
      contact_email: '',
      contact_phone: '',
    });
    setReceiptFile(null);
    setFilePreview(null);
    setSuccessResult(null);
    setErrorMsg('');
  };

  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">¡Reporte de Pago Recibido!</h2>
          <p className="text-slate-600 mt-2">
            Hemos registrado tu pago exitosamente. Nuestro equipo lo revisará en breve.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Código de Seguimiento</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {successResult.status || 'Pendiente'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
            <span className="text-lg font-mono font-bold text-blue-700">{successResult.tracking_code}</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-start space-x-1.5 pt-1">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>Guarda este código para consultar el estatus de tu pago en la pestaña "Consultar Estado".</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center space-x-4">
          <button
            onClick={resetForm}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            Reportar Otro Pago
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-6 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Formulario de Reporte de Pago</h1>
            <p className="text-blue-100 text-sm mt-0.5">Ingresa los detalles de tu transferencia o pago en la moneda correspondiente</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Datos del Cliente */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">1. Datos de Identificación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Código / Cédula de Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. CLI-001 o V-12345678"
                value={formData.client_code}
                onChange={handleClientCodeChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre Completo o Razón Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez / TechSol C.A."
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico (Notificación)</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                placeholder="+58 412 0000000"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Detalles del Pago y Seleccion de Moneda */}
        <div className="pt-2 border-t border-slate-100">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">2. Información del Pago y Moneda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Concepto del Pago / Servicio / Factura <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Pago de Mensualidad Octubre / Factura #1042"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Currency Selector */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selecciona la Moneda del Pago <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: 'USD' })}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                    formData.currency === 'USD'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Dólares ($ USD)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: 'Bs' })}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                    formData.currency === 'Bs'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <span>Bolívares (Bs.)</span>
                </button>
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Monto Transferido ({formData.currency === 'Bs' ? 'Bs. Bolívares' : '$ USD Dólares'}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">
                  {formData.currency === 'Bs' ? 'Bs.' : '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              >
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Zelle">Zelle</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Depósito">Depósito Bancario</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Número de Referencia / Comprobante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. 98421004"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fecha de Realización</label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Adjuntar Comprobante */}
        <div className="pt-2 border-t border-slate-100">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">3. Adjuntar Comprobante (Opcional)</h2>
          
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors rounded-2xl p-6 text-center bg-slate-50 relative cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {filePreview ? (
              <div className="space-y-2">
                <img src={filePreview} alt="Comprobante" className="max-h-40 mx-auto rounded-lg shadow border" />
                <p className="text-xs text-slate-600 font-medium">{receiptFile.name}</p>
                <span className="text-xs text-blue-600 font-semibold underline">Haz clic para cambiar imagen</span>
              </div>
            ) : receiptFile ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-800">{receiptFile.name}</p>
                <span className="text-xs text-blue-600 font-semibold underline">Haz clic para cambiar archivo</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Haz clic o arrastra tu capture o PDF aquí</p>
                  <p className="text-xs text-slate-500 mt-0.5">Formatos permitidos: JPG, PNG, WEBP o PDF (Máx 10 MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando Reporte...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar Reporte de Pago ({formData.currency === 'Bs' ? 'Bs.' : '$ USD'})</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
