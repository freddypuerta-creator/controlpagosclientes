import React, { useState, useEffect } from 'react';
import { Bell, Mail, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Historial de Notificaciones</h2>
          <p className="text-slate-500 text-xs mt-0.5">Registro de eventos y avisos automáticos enviados a los clientes.</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 flex justify-center items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Cargando notificaciones...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No hay notificaciones registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start space-x-3 text-sm hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <span className="text-xs text-slate-400 font-mono">{n.created_at}</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Cliente: {n.client_name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {n.status || 'ENVIADO'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
