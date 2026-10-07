import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'database.json');

const DATABASE_URL = process.env.DATABASE_URL;

let pgPool = null;

if (DATABASE_URL) {
  console.log('⚡ Conectando a Base de Datos PostgreSQL Externa (Nube)...');
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  });

  const initPgSchema = async () => {
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          client_code VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          tracking_code VARCHAR(100) UNIQUE NOT NULL,
          client_code VARCHAR(100) NOT NULL,
          client_name VARCHAR(255) NOT NULL,
          concept TEXT NOT NULL,
          amount NUMERIC(12, 2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'USD',
          payment_method VARCHAR(100) NOT NULL,
          reference_number VARCHAR(100) NOT NULL,
          payment_date VARCHAR(50) NOT NULL,
          contact_email VARCHAR(255),
          contact_phone VARCHAR(100),
          receipt_url TEXT,
          status VARCHAR(50) DEFAULT 'Pendiente',
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          payment_id INTEGER,
          client_name VARCHAR(255),
          type VARCHAR(50) DEFAULT 'EMAIL',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'ENVIADO',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tablas PostgreSQL inicializadas correctamente.');
    } catch (err) {
      console.error('❌ Error inicializando esquema PostgreSQL:', err.message);
    }
  };

  initPgSchema();
} else {
  console.log('📁 Usando Base de Datos local persistente (database.json)...');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

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
      admin_notes: 'Pago verificado exitosamente.',
      created_at: '2026-10-05 10:30:00',
      updated_at: '2026-10-05 11:00:00'
    }
  ],
  notifications: []
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
    saveDB(initialData);
    return initialData;
  }
}

function saveDB(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export const db = {
  async getClients() {
    if (pgPool) {
      try {
        const res = await pgPool.query(`
          SELECT c.*, 
            COUNT(p.id)::int as total_payments,
            COALESCE(SUM(CASE WHEN p.status = 'Aprobado' AND (p.currency = 'USD' OR p.currency IS NULL) THEN p.amount ELSE 0 END), 0)::float as total_paid_usd,
            COALESCE(SUM(CASE WHEN p.status = 'Aprobado' AND p.currency = 'Bs' THEN p.amount ELSE 0 END), 0)::float as total_paid_bs,
            COALESCE(SUM(CASE WHEN p.status = 'Pendiente' AND (p.currency = 'USD' OR p.currency IS NULL) THEN p.amount ELSE 0 END), 0)::float as total_pending_usd,
            COALESCE(SUM(CASE WHEN p.status = 'Pendiente' AND p.currency = 'Bs' THEN p.amount ELSE 0 END), 0)::float as total_pending_bs
          FROM clients c
          LEFT JOIN payments p ON c.client_code = p.client_code
          GROUP BY c.id
          ORDER BY c.name ASC
        `);
        return res.rows;
      } catch (err) {
        console.error('Error DB getClients:', err.message);
        return [];
      }
    }

    const data = loadDB();
    const payments = data.payments || [];
    return (data.clients || []).map(client => {
      const clientPayments = payments.filter(p => p.client_code === client.client_code);
      return {
        ...client,
        total_payments: clientPayments.length,
        total_paid_usd: clientPayments.filter(p => p.status === 'Aprobado' && (p.currency === 'USD' || !p.currency)).reduce((sum, p) => sum + p.amount, 0),
        total_paid_bs: clientPayments.filter(p => p.status === 'Aprobado' && p.currency === 'Bs').reduce((sum, p) => sum + p.amount, 0),
        total_pending_usd: clientPayments.filter(p => p.status === 'Pendiente' && (p.currency === 'USD' || !p.currency)).reduce((sum, p) => sum + p.amount, 0),
        total_pending_bs: clientPayments.filter(p => p.status === 'Pendiente' && p.currency === 'Bs').reduce((sum, p) => sum + p.amount, 0)
      };
    });
  },

  async addClient(client) {
    const code = client.client_code.trim().toUpperCase();
    const name = client.name.trim();
    const email = client.email || '';
    const phone = client.phone || '';

    if (pgPool) {
      const check = await pgPool.query('SELECT * FROM clients WHERE client_code = $1', [code]);
      if (check.rows.length > 0) throw new Error('Ya existe un cliente con ese código.');
      
      const res = await pgPool.query(
        'INSERT INTO clients (client_code, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [code, name, email, phone]
      );
      return res.rows[0];
    }

    const data = loadDB();
    const existing = data.clients.find(c => c.client_code.toUpperCase() === code);
    if (existing) throw new Error('Ya existe un cliente con ese código.');
    
    const newClient = { id: Date.now(), client_code: code, name, email, phone, created_at: new Date().toISOString() };
    data.clients.push(newClient);
    saveDB(data);
    return newClient;
  },

  async getPayments(filters = {}) {
    const { status, search, startDate, endDate, currency } = filters;

    if (pgPool) {
      try {
        let query = 'SELECT * FROM payments WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (status && status !== 'Todos') {
          query += ` AND status = $${paramIndex++}`;
          params.push(status);
        }

        if (currency && currency !== 'Todas') {
          query += ` AND currency = $${paramIndex++}`;
          params.push(currency);
        }

        if (search) {
          query += ` AND (LOWER(client_name) LIKE $${paramIndex} OR LOWER(client_code) LIKE $${paramIndex} OR LOWER(tracking_code) LIKE $${paramIndex} OR LOWER(reference_number) LIKE $${paramIndex} OR LOWER(concept) LIKE $${paramIndex})`;
          params.push(`%${search.toLowerCase()}%`);
          paramIndex++;
        }

        if (startDate) {
          query += ` AND payment_date >= $${paramIndex++}`;
          params.push(startDate);
        }

        if (endDate) {
          query += ` AND payment_date <= $${paramIndex++}`;
          params.push(endDate);
        }

        query += ' ORDER BY id DESC';
        const res = await pgPool.query(query, params);
        return res.rows.map(r => ({ ...r, amount: parseFloat(r.amount) }));
      } catch (err) {
        console.error('Error DB getPayments:', err.message);
        return [];
      }
    }

    const data = loadDB();
    let list = [...(data.payments || [])];

    if (status && status !== 'Todos') list = list.filter(p => p.status === status);
    if (currency && currency !== 'Todas') list = list.filter(p => (p.currency || 'USD') === currency);
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
    if (startDate) list = list.filter(p => p.payment_date >= startDate);
    if (endDate) list = list.filter(p => p.payment_date <= endDate);

    return list.sort((a, b) => b.id - a.id);
  },

  async addPayment(paymentData) {
    const currency = paymentData.currency || 'USD';
    const currencySymbol = currency === 'Bs' ? 'Bs.' : '$';

    if (pgPool) {
      await pgPool.query(
        `INSERT INTO clients (client_code, name, email, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (client_code) DO NOTHING`,
        [paymentData.client_code, paymentData.client_name, paymentData.contact_email || '', paymentData.contact_phone || '']
      );

      const res = await pgPool.query(
        `INSERT INTO payments (
          tracking_code, client_code, client_name, concept, amount, currency,
          payment_method, reference_number, payment_date, contact_email,
          contact_phone, receipt_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Pendiente') RETURNING *`,
        [
          paymentData.tracking_code, paymentData.client_code, paymentData.client_name,
          paymentData.concept, paymentData.amount, currency, paymentData.payment_method,
          paymentData.reference_number, paymentData.payment_date, paymentData.contact_email,
          paymentData.contact_phone, paymentData.receipt_url
        ]
      );

      const newPayment = { ...res.rows[0], amount: parseFloat(res.rows[0].amount) };

      await pgPool.query(
        `INSERT INTO notifications (payment_id, client_name, type, title, message) VALUES ($1, $2, 'EMAIL', $3, $4)`,
        [
          newPayment.id,
          newPayment.client_name,
          `Nuevo Pago Registrado: ${newPayment.tracking_code}`,
          `Se recibió reporte de pago por ${currencySymbol} ${newPayment.amount} (${currency}) de ${newPayment.client_name} (Ref: ${newPayment.reference_number}). Estado: Pendiente.`
        ]
      );

      return newPayment;
    }

    const data = loadDB();
    const newPayment = {
      id: Date.now(),
      ...paymentData,
      currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingClient = data.clients.find(c => c.client_code === paymentData.client_code);
    if (!existingClient) {
      data.clients.push({
        id: Date.now() + 1,
        client_code: paymentData.client_code,
        name: paymentData.client_name,
        email: paymentData.contact_email || '',
        phone: paymentData.contact_phone || '',
        created_at: new Date().toISOString()
      });
    }

    data.payments.push(newPayment);
    data.notifications.push({
      id: Date.now() + 2,
      payment_id: newPayment.id,
      client_name: newPayment.client_name,
      type: 'EMAIL',
      title: `Nuevo Pago Registrado: ${newPayment.tracking_code}`,
      message: `Se recibió reporte de pago por ${currencySymbol} ${newPayment.amount} (${currency}) de ${newPayment.client_name} (Ref: ${newPayment.reference_number}). Estado: Pendiente.`,
      created_at: new Date().toISOString()
    });

    saveDB(data);
    return newPayment;
  },

  async updatePaymentStatus(id, status, admin_notes) {
    if (pgPool) {
      const res = await pgPool.query(
        `UPDATE payments SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [status, admin_notes || null, id]
      );
      if (res.rows.length === 0) return null;
      const payment = { ...res.rows[0], amount: parseFloat(res.rows[0].amount) };
      const currencySymbol = payment.currency === 'Bs' ? 'Bs.' : '$';

      await pgPool.query(
        `INSERT INTO notifications (payment_id, client_name, type, title, message) VALUES ($1, $2, 'EMAIL', $3, $4)`,
        [
          payment.id,
          payment.client_name,
          `Pago ${status}: ${payment.tracking_code}`,
          status === 'Aprobado'
            ? `El pago ${payment.tracking_code} por ${currencySymbol} ${payment.amount} (${payment.currency || 'USD'}) de ${payment.client_name} ha sido APROBADO.`
            : `El pago ${payment.tracking_code} por ${currencySymbol} ${payment.amount} (${payment.currency || 'USD'}) de ${payment.client_name} ha sido RECHAZADO. Motivo: ${admin_notes || 'No especificado'}.`
        ]
      );

      return payment;
    }

    const data = loadDB();
    const payment = data.payments.find(p => p.id === Number(id));
    if (!payment) return null;

    payment.status = status;
    payment.admin_notes = admin_notes || null;
    payment.updated_at = new Date().toISOString();

    const currencySymbol = payment.currency === 'Bs' ? 'Bs.' : '$';
    data.notifications.push({
      id: Date.now(),
      payment_id: payment.id,
      client_name: payment.client_name,
      type: 'EMAIL',
      title: `Pago ${status}: ${payment.tracking_code}`,
      message: status === 'Aprobado'
        ? `El pago ${payment.tracking_code} por ${currencySymbol} ${payment.amount} (${payment.currency || 'USD'}) de ${payment.client_name} ha sido APROBADO.`
        : `El pago ${payment.tracking_code} por ${currencySymbol} ${payment.amount} (${payment.currency || 'USD'}) de ${payment.client_name} ha sido RECHAZADO. Motivo: ${admin_notes || 'No especificado'}.`,
      created_at: new Date().toISOString()
    });

    saveDB(data);
    return payment;
  },

  async getStats() {
    if (pgPool) {
      try {
        const approvedUSDRes = await pgPool.query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE status = 'Aprobado' AND (currency = 'USD' OR currency IS NULL)`);
        const approvedBsRes = await pgPool.query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE status = 'Aprobado' AND currency = 'Bs'`);

        const pendingUSDRes = await pgPool.query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE status = 'Pendiente' AND (currency = 'USD' OR currency IS NULL)`);
        const pendingBsRes = await pgPool.query(`SELECT COALESCE(SUM(amount), 0)::float as total FROM payments WHERE status = 'Pendiente' AND currency = 'Bs'`);

        const countPendingRes = await pgPool.query(`SELECT COUNT(*)::int as count FROM payments WHERE status = 'Pendiente'`);
        const countApprovedRes = await pgPool.query(`SELECT COUNT(*)::int as count FROM payments WHERE status = 'Aprobado'`);
        const countRejectedRes = await pgPool.query(`SELECT COUNT(*)::int as count FROM payments WHERE status = 'Rechazado'`);

        const methodRes = await pgPool.query(`
          SELECT payment_method, currency, COUNT(*)::int as count, SUM(amount)::float as total 
          FROM payments 
          WHERE status = 'Aprobado' 
          GROUP BY payment_method, currency
        `);

        const recentRes = await pgPool.query(`SELECT * FROM payments ORDER BY id DESC LIMIT 5`);

        const methodStats = methodRes.rows.map(r => ({
          payment_method: `${r.payment_method} (${r.currency || 'USD'})`,
          count: r.count,
          total: r.total,
          currency: r.currency || 'USD'
        }));

        return {
          totalApprovedUSD: approvedUSDRes.rows[0]?.total || 0,
          totalApprovedBs: approvedBsRes.rows[0]?.total || 0,
          totalPendingUSD: pendingUSDRes.rows[0]?.total || 0,
          totalPendingBs: pendingBsRes.rows[0]?.total || 0,
          countPending: countPendingRes.rows[0]?.count || 0,
          countApproved: countApprovedRes.rows[0]?.count || 0,
          countRejected: countRejectedRes.rows[0]?.count || 0,
          methodStats,
          recentPayments: recentRes.rows.map(r => ({ ...r, amount: parseFloat(r.amount) }))
        };
      } catch (err) {
        console.error('Error DB getStats:', err.message);
        return {
          totalApprovedUSD: 0, totalApprovedBs: 0, totalPendingUSD: 0, totalPendingBs: 0,
          countPending: 0, countApproved: 0, countRejected: 0, methodStats: [], recentPayments: []
        };
      }
    }

    const data = loadDB();
    const payments = data.payments || [];
    const approved = payments.filter(p => p.status === 'Aprobado');
    const pending = payments.filter(p => p.status === 'Pendiente');
    const rejected = payments.filter(p => p.status === 'Rechazado');

    const methodMap = {};
    approved.forEach(p => {
      const key = `${p.payment_method} (${p.currency || 'USD'})`;
      if (!methodMap[key]) methodMap[key] = { payment_method: key, count: 0, total: 0, currency: p.currency || 'USD' };
      methodMap[key].count += 1;
      methodMap[key].total += p.amount;
    });

    return {
      totalApprovedUSD: approved.filter(p => (p.currency || 'USD') === 'USD').reduce((sum, p) => sum + p.amount, 0),
      totalApprovedBs: approved.filter(p => p.currency === 'Bs').reduce((sum, p) => sum + p.amount, 0),
      totalPendingUSD: pending.filter(p => (p.currency || 'USD') === 'USD').reduce((sum, p) => sum + p.amount, 0),
      totalPendingBs: pending.filter(p => p.currency === 'Bs').reduce((sum, p) => sum + p.amount, 0),
      countPending: pending.length,
      countApproved: approved.length,
      countRejected: rejected.length,
      methodStats: Object.values(methodMap),
      recentPayments: [...payments].sort((a, b) => b.id - a.id).slice(0, 5)
    };
  },

  async getNotifications() {
    if (pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 20');
        return res.rows;
      } catch (err) {
        console.error('Error DB getNotifications:', err.message);
        return [];
      }
    }
    const data = loadDB();
    return (data.notifications || []).sort((a, b) => b.id - a.id).slice(0, 20);
  }
};
