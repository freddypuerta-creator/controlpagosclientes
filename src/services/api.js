const BASE_URL = '/api';

export const api = {
  // Public Client APIs
  async reportPayment(formData) {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      body: formData, // FormData containing fields + receipt file
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al reportar pago');
    return data;
  },

  async checkStatus(query) {
    const res = await fetch(`${BASE_URL}/payments/status/${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al consultar estatus');
    return data;
  },

  // Admin APIs
  async getAdminPayments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const res = await fetch(`${BASE_URL}/admin/payments?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar lista de pagos');
    return data;
  },

  async updatePaymentStatus(id, status, admin_notes) {
    const res = await fetch(`${BASE_URL}/admin/payments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar pago');
    return data;
  },

  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar estadísticas');
    return data;
  },

  getExportUrl(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    return `${BASE_URL}/admin/export?${params.toString()}`;
  },

  // Clients
  async getClients() {
    const res = await fetch(`${BASE_URL}/clients`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener clientes');
    return data;
  },

  async addClient(clientData) {
    const res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrar cliente');
    return data;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener notificaciones');
    return data;
  }
};
