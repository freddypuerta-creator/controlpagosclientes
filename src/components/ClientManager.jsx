import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Shield, Search, X, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ClientManager() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newClient, setNewClient] = useState({
    client_code: '',
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await api.getClients();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newClient.client_code || !newClient.name) {
      setErrorMsg('El Código de cliente y el Nombre son requeridos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addClient(newClient);
      setShowAddModal(false);
      setNewClient({ client_code: '', name: '', email: '', phone: '' });
      fetchClients();
    } catch (err) {
      setErrorMsg(err.message || 'Error al agregar el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Directorio de Clientes</h2>
          <p className="text-slate-500 text-xs mt-0.5">Administra los códigos de identificación y consulta los totales pagados en Dólares ($) y Bolívares (Bs.).</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button
          onClick={fetchClients}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 flex justify-center items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Cargando lista de clientes...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No hay clientes registrados o coincidentes con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {client.client_code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{client.name}</h3>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                {client.email && (
                  <div className="flex items-center text-slate-600">
                    <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center text-slate-600">
                    <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/60 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Aprobado ($ USD)</span>
                  <span className="text-sm font-bold text-emerald-600">${(client.total_paid_usd || 0).toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Aprobado (Bs)</span>
                  <span className="text-sm font-bold text-emerald-700">Bs. {(client.total_paid_bs || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Registrar Nuevo Cliente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Cliente (Único) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. CLI-005 o V-25123456"
                  value={newClient.client_code}
                  onChange={(e) => setNewClient({ ...newClient, client_code: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre o Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Comercializadora La Estrella C.A."
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+58 412 0000000"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-medium text-xs hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
