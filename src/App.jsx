import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ClientForm from './components/ClientForm';
import StatusChecker from './components/StatusChecker';
import StatsCards from './components/StatsCards';
import PaymentsTable from './components/PaymentsTable';
import ClientManager from './components/ClientManager';
import NotificationCenter from './components/NotificationCenter';
import { api } from './services/api';

export default function App() {
  const [activeMode, setActiveMode] = useState('client'); // 'client' | 'admin'
  const [activeTab, setActiveTab] = useState('report');   // 'report' | 'status' | 'dashboard' | 'payments' | 'clients' | 'notifications'
  
  const [stats, setStats] = useState(null);
  const [clientsList, setClientsList] = useState([]);

  const loadInitialData = async () => {
    try {
      const statsRes = await api.getAdminStats();
      setStats(statsRes.stats);

      const clientsRes = await api.getClients();
      setClientsList(clientsRes.clients || []);
    } catch (err) {
      console.error('Error cargando estadísticas iniciales:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={stats?.countPending || 0}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeMode === 'client' && (
          <>
            {activeTab === 'report' && (
              <ClientForm
                clientsList={clientsList}
                onPaymentSubmitted={() => {
                  loadInitialData();
                }}
              />
            )}
            {activeTab === 'status' && <StatusChecker />}
          </>
        )}

        {activeMode === 'admin' && (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <StatsCards
                  stats={stats}
                  onNavigateToPending={() => {
                    setActiveTab('payments');
                  }}
                />
                <PaymentsTable initialStatusFilter="Todos" />
              </div>
            )}

            {activeTab === 'payments' && <PaymentsTable initialStatusFilter="Pendiente" />}

            {activeTab === 'clients' && <ClientManager />}

            {activeTab === 'notifications' && <NotificationCenter />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} ControlPagos Clientes - Sistema de Gestión e Ingresos.</p>
        </div>
      </footer>
    </div>
  );
}
