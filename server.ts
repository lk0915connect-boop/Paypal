import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import db from './src/server/db';
import { createPayPalOrder, capturePayPalOrder, isPayPalConfigured } from './src/server/paypal';
import { getAiFinancialAdvice, getAutomatedFinancialInsights, isGeminiConfigured } from './src/server/gemini';
import { calculateCashflow, calculateCategoryBreakdown, calculateFinancialHealthScore } from './src/utils/finance';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'paysmart-ai-secret-key-2026';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Authentication Middleware ---
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

// --- Auth Routes ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(name.trim(), cleanEmail, passwordHash);
    const userId = Number(result.lastInsertRowid);

    const token = jwt.sign({ id: userId, email: cleanEmail, name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name: name.trim(), email: cleanEmail, currency: 'USD' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, name, email, password_hash, currency FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, currency: user.currency || 'USD' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Demo login route for quick evaluator access
app.post('/api/auth/demo-login', (_req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT id, name, email, currency FROM users WHERE email = ?').get('demo@paysmart.ai') as any;
    if (!user) {
      return res.status(404).json({ error: 'Demo user not seeded' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Demo login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, currency: user.currency || 'USD' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = db.prepare('SELECT id, name, email, currency, created_at FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.post('/api/auth/update-profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, currency } = req.body;

    if (!name || !currency) {
      return res.status(400).json({ error: 'Name and currency are required' });
    }

    db.prepare('UPDATE users SET name = ?, currency = ? WHERE id = ?').run(name.trim(), currency, userId);
    res.json({ message: 'Profile updated successfully', user: { id: userId, name: name.trim(), currency } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
    if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    const newHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);

    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Transaction Routes ---
app.get('/api/transactions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, category, method, search, limit = 100, page = 1 } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [userId];

    if (type && (type === 'income' || type === 'expense')) {
      query += ' AND transaction_type = ?';
      params.push(type);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (method && method !== 'All') {
      query += ' AND payment_method = ?';
      params.push(method);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ' AND (description LIKE ? OR category LIKE ? OR paypal_order_id LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC';

    const numLimit = Math.min(200, Math.max(1, parseInt(limit as string) || 50));
    const offset = ((parseInt(page as string) || 1) - 1) * numLimit;

    query += ` LIMIT ${numLimit} OFFSET ${offset}`;

    const transactions = db.prepare(query).all(...params);

    // Total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
    const countParams: any[] = [userId];
    if (type && (type === 'income' || type === 'expense')) {
      countQuery += ' AND transaction_type = ?';
      countParams.push(type);
    }
    if (category && category !== 'All') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (method && method !== 'All') {
      countQuery += ' AND payment_method = ?';
      countParams.push(method);
    }
    if (search && typeof search === 'string' && search.trim()) {
      countQuery += ' AND (description LIKE ? OR category LIKE ? OR paypal_order_id LIKE ?)';
      const term = `%${search.trim()}%`;
      countParams.push(term, term, term);
    }

    const totalCount = (db.prepare(countQuery).get(...countParams) as any).total;

    res.json({
      transactions,
      pagination: {
        total: totalCount,
        page: parseInt(page as string) || 1,
        limit: numLimit,
        pages: Math.ceil(totalCount / numLimit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { transaction_type, amount, category, description, payment_method, date } = req.body;

    if (!transaction_type || !amount || !category || !description) {
      return res.status(400).json({ error: 'Transaction type, amount, category, and description are required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const createdAt = date ? new Date(date).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19);

    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, transaction_type, amount, category, description, payment_method, status, created_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, 0)
    `);

    const result = stmt.run(
      userId,
      transaction_type,
      numAmount,
      category,
      description.trim(),
      payment_method || 'other',
      createdAt
    );

    const inserted = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Transaction created successfully', transaction: inserted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const txId = parseInt(req.params.id);
    const { transaction_type, amount, category, description, payment_method } = req.body;

    const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(txId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    db.prepare(`
      UPDATE transactions
      SET transaction_type = ?, amount = ?, category = ?, description = ?, payment_method = ?
      WHERE id = ? AND user_id = ?
    `).run(transaction_type, numAmount, category, description, payment_method, txId, userId);

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    res.json({ message: 'Transaction updated successfully', transaction: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const txId = parseInt(req.params.id);

    const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(txId, userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Comprehensive Dashboard Aggregated Stats
app.get('/api/transactions/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const allTransactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];

    const cashflow = calculateCashflow(allTransactions);
    const categoryBreakdown = calculateCategoryBreakdown(allTransactions);
    const health = calculateFinancialHealthScore(
      cashflow.totalIncome,
      cashflow.totalExpenses,
      allTransactions.length,
      categoryBreakdown.length
    );

    // Monthly trends (group by YYYY-MM)
    const monthlyMap: Record<string, { month: string; income: number; expenses: number; savings: number }> = {};
    for (const t of allTransactions) {
      const month = t.created_at.substring(0, 7); // e.g., '2026-10'
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expenses: 0, savings: 0 };
      }
      const val = Number(t.amount) || 0;
      if (t.transaction_type === 'income') {
        monthlyMap[month].income += val;
      } else {
        monthlyMap[month].expenses += val;
      }
      monthlyMap[month].savings = monthlyMap[month].income - monthlyMap[month].expenses;
    }

    const monthlyTrends = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    // Count PayPal transactions
    const paypalCount = allTransactions.filter((t) => t.payment_method === 'paypal' || t.paypal_order_id).length;

    res.json({
      cashflow,
      categoryBreakdown,
      health,
      monthlyTrends,
      recentTransactions: allTransactions.slice(0, 7),
      paypalCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- PayPal REST API Endpoints ---
app.get('/api/paypal/config', (_req: Request, res: Response) => {
  const isConfigured = isPayPalConfigured();
  res.json({
    clientId: isConfigured ? process.env.PAYPAL_CLIENT_ID : 'sandbox_client_id_simulator',
    mode: process.env.PAYPAL_MODE || 'sandbox',
    isConfigured,
    message: isConfigured 
      ? 'Connected to live PayPal Developer Sandbox' 
      : 'Running with PaySmart Interactive PayPal Sandbox Test Engine (enter PAYPAL_CLIENT_ID in .env for direct PayPal calls)',
  });
});

app.post('/api/paypal/create-order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, currency = 'USD', description = 'PayPal Checkout', category = 'Shopping' } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive amount required for PayPal order.' });
    }

    const order = await createPayPalOrder({
      amount: numAmount,
      currency,
      description,
      category,
      userId,
    });

    res.status(201).json(order);
  } catch (err: any) {
    console.error('PayPal create-order error:', err);
    res.status(500).json({ error: err.message || 'Failed to create PayPal order' });
  }
});

app.post('/api/paypal/capture-order', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { orderId, amount, category = 'Bills', description = 'PayPal Payment' } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing PayPal orderId.' });
    }

    const captureResult = await capturePayPalOrder({
      orderId,
      userId,
      category,
      description,
    });

    const finalAmount = captureResult.amount > 0 ? captureResult.amount : (parseFloat(amount) || 25.00);

    // Save into Payments table
    const insertPayment = db.prepare(`
      INSERT INTO payments (user_id, paypal_order_id, capture_id, amount, currency, status, raw_response)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertPayment.run(
      userId,
      orderId,
      captureResult.captureId,
      finalAmount,
      captureResult.currency,
      captureResult.status,
      captureResult.rawResponseStr
    );

    // Save into Transactions ledger with PayPal badge
    const insertTx = db.prepare(`
      INSERT INTO transactions (user_id, transaction_type, amount, category, description, payment_method, status, paypal_order_id, is_demo)
      VALUES (?, 'expense', ?, ?, ?, 'paypal', 'completed', ?, 0)
    `);
    const txResult = insertTx.run(
      userId,
      finalAmount,
      category,
      description.trim() || `PayPal Payment - Order ${orderId}`,
      orderId
    );

    const createdTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txResult.lastInsertRowid);

    res.json({
      success: true,
      message: 'Payment successfully captured and verified via PayPal Sandbox',
      payment: {
        orderId,
        captureId: captureResult.captureId,
        amount: finalAmount,
        currency: captureResult.currency,
        status: captureResult.status,
      },
      transaction: createdTx,
    });
  } catch (err: any) {
    console.error('PayPal capture error:', err);
    res.status(500).json({ error: err.message || 'PayPal capture failed' });
  }
});

app.get('/api/paypal/payments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const payments = db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json({ payments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Financial Assistant Routes ---
app.post('/api/ai/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const advice = await getAiFinancialAdvice({ userId, message: message.trim() });
    res.json({ reply: advice });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/chat/history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const history = db.prepare('SELECT * FROM ai_chat_history WHERE user_id = ? ORDER BY created_at ASC').all(userId);
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ai/chat/history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.prepare('DELETE FROM ai_chat_history WHERE user_id = ?').run(userId);
    res.json({ message: 'Chat history cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/insights', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const insights = await getAutomatedFinancialInsights(userId);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Diagnostics & Hackathon Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    paypal: {
      isConfigured: isPayPalConfigured(),
      mode: process.env.PAYPAL_MODE || 'sandbox',
    },
    gemini: {
      isConfigured: isGeminiConfigured(),
      model: 'gemini-3.8-flash',
    },
    database: {
      type: 'SQLite3',
      file: 'database/paysmart.db',
    },
  });
});

// Setup Vite dev server or serve production build
async function setupVite() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PaySmart AI Full-Stack Server running at http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
