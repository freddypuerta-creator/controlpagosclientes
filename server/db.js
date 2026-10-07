import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'database.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial Database Structure with Seed Data
const initialData = {
  clients: [
    {
      id: 1,
      client_code: 'CLI-001',
      name: 'Empresa TechSol C.A.',
      email: 'contacto@techsol.com',
      phone: '+58 412 1234567',
      created_at: '2026-09-15 08:00:00'
    },
    {
      id: 2,
      client_code: 'CLI-002',
      name: 'Distribuidora San José',
      email: 'ventas@sanjose.com',
      phone: '+58 414 7654321',
      created_at: '2026-09-20 10:30:00'
    },
    {
      id: 3,
      client_code: 'CLI-003',
      name: 'Carlos Eduardo Mendoza',
      email: 'carlos.mendoza@gmail.com',
      phone: '+58 424 9876543',
      created_at: '2026-09-25 14:15:00'
    },
    {
      id: 4,
      client_code: 'CLI-004',
      name: 'Inversiones Globales R&M',
      email: 'admin@inversionesrm.com',
      phone: '+58 416 5554433',
      created_at: '2026-10-01 11:00:00'
    }
  ],
  payments: [
    {
      id: 1,
      tracking_code: 'PAY-2026-1001',
      client_code: 'CLI-001',
      client_name: 'Empresa TechSol C.A.',
      concept: 'Servicio de Mantenimiento Web - Octubre',
      amount: 450.00,
      currency: 'USD',
      payment_method: 'Transferencia Bancaria',
      reference_number: 'REF-984210',
      payment_date: '2026-10-05',
      contact_email: 'contacto@techsol.com',
      contact_phone: '+58 412 1234567',
      receipt_url: null,
      status: 'Aprobado',
      admin_notes: 'Pago verificado exitosamente en la cuenta bancaria principal.',
      created_at: '2026-10-05 10:30:00',
      updated_at: '2026-10-05 11:00:00'
    },
    {
      id: 2,
      tracking_code: 'PAY-2026-1002',
      client_code: 'CLI-002',
      client_name: 'Distribuidora San José',
      concept: 'Factura Nro #1042 - Licencias de Software',
      amount: 45000.00,
      currency: 'Bs',
      payment_method: 'Pago Móvil',
      reference_number: 'PM-554192',
      payment_date: '2026-10-06',
      contact_email: 'ventas@sanjose.com',
      contact_phone: '+58 414 7654321',
      receipt_url: null,
      status: 'Pendiente',
      admin_notes: null,
      created_at: '2026-10-06 09:15:00',
      updated_at: '2026-10-06 09:15:00'
    },
    {
      id: 3,
      tracking_code: 'PAY-2026-1003',
      client_code: 'CLI-003',
      client_name: 'Carlos Eduardo Mendoza',
      concept: 'Suscripción Mensual VIP',
      amount: 85.00,
      currency: 'USD',
      payment_method: 'Zelle',
      reference_number: 'ZEL-883019',
      payment_date: '2026-10-04',
      contact_email: 'carlos.mendoza@gmail.com',
      contact_phone: '+58 424 9876543',
      receipt_url: null,
      status: 'Aprobado',
      admin_notes: 'Verificación bancaria confirmada.',
      created_at: '2026-10-04 16:45:00',
      updated_at: '2026-10-04 17:10:00'
    },
    {
      id: 4,
      tracking_code: 'PAY-2026-1004',
      client_code: 'CLI-004',
      client_name: 'Inversiones Globales R&M',
      concept: 'Consultoría de Negocios Q3',
      amount: 28500.00,
      currency: 'Bs',
      payment_method: 'Transferencia Bancaria',
      reference_number: 'REF-003912',
      payment_date: '2026-10-03',
      contact_email: 'admin@inversionesrm.com',
      contact_phone: '+58 416 5554433',
      receipt_url: null,
      status: 'Rechazado',
      admin_notes: 'Número de referencia no encontrado en los movimientos bancarios.',
      created_at: '2026-10-03 14:20:00',
      updated_at: '2026-10-03 15:00:00'
    },
    {
      id: 5,
      tracking_code: 'PAY-2026-1005',
      client_code: 'CLI-001',
      client_name: 'Empresa TechSol C.A.',
      concept: 'Servidor Dedicado Mensual',
      amount: 8250.00,
      currency: 'Bs',
      payment_method: 'Pago Móvil',
      reference_number: 'PM-991204',
      payment_date: '2026-10-06',
      contact_email: 'contacto@techsol.com',
      contact_phone: '+58 412 1234567',
      receipt_url: null,
      status: 'Pendiente',
      admin_notes: null,
      created_at: '2026-10-06 14:00:00',
      updated_at: '2026-10-06 14:00:00'
    }
  ],
  notifications: [
    {
      id: 1,
      payment_id: 1,
      client_name: 'Empresa TechSol C.A.',
      type: 'EMAIL',
      title: 'Pago Aprobado: PAY-2026-1001',
      message: 'El pago PAY-2026-1001 por $450.00 USD ha sido aprobado exitosamente.',
      created_at: '2026-10-05 11:00:00'
    },
    {
      id: 2,
      payment_id: 2,
      client_name: 'Distribuidora San José',
      type: 'EMAIL',
      title: 'Nuevo Pago Registrado: PAY-2026-1002',
      message: 'Se registró reporte de pago por Bs. 45,000.00 (Ref: PM-554192). Estatus: Pendiente.',
      created_at: '2026-10-06 09:15:00'
    }
  ]
};

function loadDB() {
  if (!fs.existsSync(dbFilePath)) {
    saveDB(initialData);
    return initialData;
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo base de datos, reiniciando:', err);
    saveDB(initialData);
    return initialData;
  }
}

function saveDB(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export const db = {
  getClients() {
    const data = loadDB();
    const payments = data.payments || [];
    return (data.clients || []).map(client => {
      const clientPayments = payments.filter(p => p.client_code === client.client_code);
      const total_payments = clientPayments.length;
      
      const total_paid_usd = clientPayments
        .filter(p => p.status === 'Aprobado' && (p.currency === 'USD' || !p.currency))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const total_paid_bs = clientPayments
        .filter(p => p.status === 'Aprobado' && p.currency === 'Bs')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const total_pending_usd = clientPayments
        .filter(p => p.status === 'Pendiente' && (p.currency === 'USD' || !p.currency))
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const total_pending_bs = clientPayments
        .filter(p => p.status === 'Pendiente' && p.currency === 'Bs')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return {
        ...client,
        total_payments,
        total_paid_usd,
        total_paid_bs,
        total_pending_usd,
        total_pending_bs
      };
    });
  },

  addClient(client) {
    const data = loadDB();
    const existing = data.clients.find(c => c.client_code.toUpperCase() === client.client_code.toUpperCase());
    if (existing) {
      throw new Error('Ya existe un cliente con ese código.');
    }
    const newClient = {
      id: Date.now(),
      client_code: client.client_code.trim().toUpperCase(),
      name: client.name.trim(),
      email: client.email || '',
      phone: client.phone || '',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    data.clients.push(newClient);
    saveDB(data);
    return newClient;
  },

  getPayments(filters = {}) {
    const data = loadDB();
    let list = [...(data.payments || [])];

    const { status, search, startDate, endDate, currency } = filters;

    if (status && status !== 'Todos') {
      list = list.filter(p => p.status === status);
    }

    if (currency && currency !== 'Todas') {
      list = list.filter(p => (p.currency || 'USD') === currency);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.client_name && p.client_name.toLowerCase().includes(q)) ||
        (p.client_code && p.client_code.toLowerCase().includes(q)) ||
        (p.tracking_code && p.tracking_code.toLowerCase().includes(q)) ||
        (p.reference_number && p.reference_number.toLowerCase().includes(q)) ||
        (p.concept && p.concept.toLowerCase().includes(q))
      );
    }

    if (startDate) {
      list = list.filter(p => p.payment_date >= startDate);
    }

    if (endDate) {
      list = list.filter(p => p.payment_date <= endDate);
    }

    return list.sort((a, b) => b.id - a.id);
  },

  addPayment(paymentData) {
    const data = loadDB();
    const currency = paymentData.currency || 'USD';
    const currencySymbol = currency === 'Bs' ? 'Bs.' : '$';

    const newPayment = {
      id: Date.now(),
      ...paymentData,
      currency,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    // Auto-create client if not exists
    const existingClient = data.clients.find(c => c.client_code === paymentData.client_code);
    if (!existingClient) {
      data.clients.push({
        id: Date.now() + 1,
        client_code: paymentData.client_code,
        name: paymentData.client_name,
        email: paymentData.contact_email || '',
        phone: paymentData.contact_phone || '',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    }

    data.payments.push(newPayment);

    // Notification entry
    data.notifications.push({
      id: Date.now() + 2,
      payment_id: newPayment.id,
      client_name: newPayment.client_name,
      type: 'EMAIL',
      title: `Nuevo Pago Registrado: ${newPayment.tracking_code}`,
      message: `Se recibió reporte de pago por ${currencySymbol} ${newPayment.amount} (${newPayment.currency}) de ${newPayment.client_name} (Ref: ${newPayment.reference_number}). Estado: Pendiente.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    saveDB(data);
    return newPayment;
  },

  updatePaymentStatus(id, status, admin_notes) {
    const data = loadDB();
    const payment = data.payments.find(p => p.id === Number(id));
    if (!payment) return null;

    payment.status = status;
    payment.admin_notes = admin_notes || null;
    payment.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const currencySymbol = (payment.currency === 'Bs') ? 'Bs.' : '$';

    data.notifications.push({
      id: Date.now(),
      payment_id: payment.id,
      client_name: payment.client_name,
      type: 'EMAIL',
      title: `Pago ${status}: ${payment.tracking_code}`,
      message: status === 'Aprobado'
        ? `El pago ${payment.tracking_code} por ${currencySymbol} ${payment.amount} (${payment.currency || 'USD'}) de ${payment.client_name} ha sido APROBADO.`
        : `El pago ${payment.tracking_code} por ${currencySymbol} ${payment.amount} (${payment.currency || 'USD'}) de ${payment.client_name} ha sido RECHAZADO. Motivo: ${admin_notes || 'No especificado'}.`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    saveDB(data);
    return payment;
  },

  getStats() {
    const data = loadDB();
    const payments = data.payments || [];

    const approvedPayments = payments.filter(p => p.status === 'Aprobado');
    const pendingPayments = payments.filter(p => p.status === 'Pendiente');
    const rejectedPayments = payments.filter(p => p.status === 'Rechazado');

    const totalApprovedUSD = approvedPayments
      .filter(p => (p.currency || 'USD') === 'USD')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalApprovedBs = approvedPayments
      .filter(p => p.currency === 'Bs')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPendingUSD = pendingPayments
      .filter(p => (p.currency || 'USD') === 'USD')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPendingBs = pendingPayments
      .filter(p => p.currency === 'Bs')
      .reduce((sum, p) => sum + p.amount, 0);

    // Method breakdown
    const methodMap = {};
    approvedPayments.forEach(p => {
      const key = `${p.payment_method} (${p.currency || 'USD'})`;
      if (!methodMap[key]) {
        methodMap[key] = { payment_method: key, count: 0, total: 0, currency: p.currency || 'USD' };
      }
      methodMap[key].count += 1;
      methodMap[key].total += p.amount;
    });

    return {
      totalApprovedUSD,
      totalApprovedBs,
      totalPendingUSD,
      totalPendingBs,
      countPending: pendingPayments.length,
      countApproved: approvedPayments.length,
      countRejected: rejectedPayments.length,
      methodStats: Object.values(methodMap),
      recentPayments: [...payments].sort((a, b) => b.id - a.id).slice(0, 5)
    };
  },

  getNotifications() {
    const data = loadDB();
    return (data.notifications || []).sort((a, b) => b.id - a.id).slice(0, 20);
  }
};
