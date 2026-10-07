import React from 'react';
import { Wallet, CreditCard, ShieldCheck, Search, Users, Bell, FileText, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeMode, setActiveMode, activeTab, setActiveTab, pendingCount }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveMode('client')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                ControlPagos
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                Clientes
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveMode('client');
                setActiveTab('report');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeMode === 'client'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Portal Clientes</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('admin');
                setActiveTab('dashboard');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Admin</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-400 text-amber-950 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex space-x-1 border-t border-slate-100 pt-2 pb-2">
          {activeMode === 'client' ? (
            <>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === 'report'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reportar Nuevo Pago</span>
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === 'status'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Consultar Estado de Pago</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resumen & Métricas</span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === 'payments'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Gestión de Pagos</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-bold">
                    {pendingCount} pendientes
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === 'clients'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Directorio de Clientes</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Historial Notificaciones</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
