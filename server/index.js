import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `comprobante-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP) o documentos PDF.'));
  }
});

function generateTrackingCode() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${year}-${randomNum}`;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/payments', upload.single('receipt'), async (req, res) => {
  try {
    const {
      client_code,
      client_name,
      concept,
      amount,
      currency,
      payment_method,
      reference_number,
      payment_date,
      contact_email,
      contact_phone
    } = req.body;

    if (!client_code || !client_name || !concept || !amount || !payment_method || !reference_number) {
      return res.status(400).json({ error: 'Por favor complete todos los campos requeridos.' });
    }

    const tracking_code = generateTrackingCode();
    const receipt_url = req.file ? `/uploads/${req.file.filename}` : null;

    const newPayment = await db.addPayment({
      tracking_code,
      client_code: client_code.trim().toUpperCase(),
      client_name: client_name.trim(),
      concept: concept.trim(),
      amount: parseFloat(amount),
      currency: currency === 'Bs' ? 'Bs' : 'USD',
      payment_method,
      reference_number: reference_number.trim(),
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      contact_email: contact_email ? contact_email.trim() : null,
      contact_phone: contact_phone ? contact_phone.trim() : null,
      receipt_url,
      status: 'Pendiente',
      admin_notes: null
    });

    res.status(201).json({
      success: true,
      message: 'Reporte de pago recibido exitosamente.',
      data: newPayment
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el reporte de pago.' });
  }
});

app.get('/api/payments/status/:query', async (req, res) => {
  try {
    const query = req.params.query.trim();
    const payments = await db.getPayments({ search: query });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('Error al consultar estatus:', error);
    res.status(500).json({ error: 'Error al buscar la información de pagos.' });
  }
});

app.get('/api/admin/payments', async (req, res) => {
  try {
    const { status, search, startDate, endDate, currency } = req.query;
    const payments = await db.getPayments({ status, search, startDate, endDate, currency });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('Error al obtener pagos admin:', error);
    res.status(500).json({ error: 'Error al consultar lista de pagos.' });
  }
});

app.patch('/api/admin/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['Aprobado', 'Rechazado', 'Pendiente'].includes(status)) {
      return res.status(400).json({ error: 'Estatus inválido.' });
    }

    const updatedPayment = await db.updatePaymentStatus(id, status, admin_notes);
    if (!updatedPayment) {
      return res.status(404).json({ error: 'Pago no encontrado.' });
    }

    res.json({
      success: true,
      message: `Pago actualizado a "${status}" exitosamente.`,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar el pago.' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al generar estadísticas.' });
  }
});

app.get('/api/admin/export', async (req, res) => {
  try {
    const { status, search, currency } = req.query;
    const payments = await db.getPayments({ status, search, currency });

    const headers = ['Codigo Seguimiento', 'Codigo Cliente', 'Cliente', 'Concepto', 'Monto', 'Moneda', 'Metodo Pago', 'Referencia', 'Fecha Pago', 'Estado', 'Notas Admin'];
    let csv = headers.join(',') + '\n';

    payments.forEach(p => {
      const row = [
        `"${p.tracking_code}"`,
        `"${p.client_code}"`,
        `"${(p.client_name || '').replace(/"/g, '""')}"`,
        `"${(p.concept || '').replace(/"/g, '""')}"`,
        p.amount,
        `"${p.currency || 'USD'}"`,
        `"${p.payment_method}"`,
        `"${p.reference_number}"`,
        `"${p.payment_date}"`,
        `"${p.status}"`,
        `"${(p.admin_notes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_pagos_clientes.csv"');
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).json({ error: 'Error al generar el reporte CSV.' });
  }
});

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.getClients();
    res.json({ success: true, clients });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al consultar lista de clientes.' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { client_code, name, email, phone } = req.body;
    if (!client_code || !name) {
      return res.status(400).json({ error: 'Código de cliente y Nombre son obligatorios.' });
    }

    const newClient = await db.addClient({ client_code, name, email, phone });
    res.status(201).json({ success: true, message: 'Cliente registrado exitosamente.', client: newClient });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error al guardar el cliente.' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await db.getNotifications();
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
});

if (fs.existsSync(distDir)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Servidor Backend corriendo en puerto ${PORT}`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
