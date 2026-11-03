import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Ensure database directory exists
const dbDir = path.resolve(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'paysmart.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK(amount > 0),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('paypal', 'credit_card', 'bank_transfer', 'cash', 'other')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('completed', 'pending', 'failed')),
    paypal_order_id TEXT,
    is_demo INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ai_chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paypal_order_id TEXT NOT NULL UNIQUE,
    capture_id TEXT,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL,
    raw_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category);
  CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(paypal_order_id);
`);

// Seed default demo user and realistic initial transaction records
function seedInitialData() {
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@paysmart.ai') as { id: number } | undefined;

  let userId: number;
  if (!checkUser) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Demo1234!', salt);
    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, currency) VALUES (?, ?, ?, ?)');
    const result = insertUser.run('Alex Rivera', 'demo@paysmart.ai', passwordHash, 'USD');
    userId = Number(result.lastInsertRowid);
  } else {
    userId = checkUser.id;
  }

  // Check if transactions exist for this demo user
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?');
  const countResult = countStmt.get(userId) as { count: number };

  if (countResult.count === 0) {
    const now = new Date();
    const subDays = (d: number) => {
      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };

    const initialTransactions = [
      // Incomes
      { type: 'income', amount: 5400.00, cat: 'Salary', desc: 'Monthly Tech Payroll - Stripe Direct', method: 'bank_transfer', status: 'completed', days: 28, paypalId: null },
      { type: 'income', amount: 1650.00, cat: 'Freelance', desc: 'PayPal Invoice #PAY-9921 - UI/UX Consulting', method: 'paypal', status: 'completed', days: 16, paypalId: 'PAYID-M45893201-SANDBOX' },
      { type: 'income', amount: 480.00, cat: 'Investments', desc: 'Quarterly Index Dividend Payout', method: 'bank_transfer', status: 'completed', days: 8, paypalId: null },

      // Expenses - PayPal & Cards & Bills
      { type: 'expense', amount: 1250.00, cat: 'Bills', desc: 'Apex Modern Loft Rental', method: 'bank_transfer', status: 'completed', days: 27, paypalId: null },
      { type: 'expense', amount: 189.50, cat: 'Shopping', desc: 'PayPal Purchase: Logitech MX Master & Keychron', method: 'paypal', status: 'completed', days: 24, paypalId: 'PAYID-M99182374-SANDBOX' },
      { type: 'expense', amount: 94.20, cat: 'Food', desc: 'Whole Foods Market Organic Groceries', method: 'credit_card', status: 'completed', days: 22, paypalId: null },
      { type: 'expense', amount: 58.00, cat: 'Transport', desc: 'Metro Transit Monthly Card Refill', method: 'credit_card', status: 'completed', days: 20, paypalId: null },
      { type: 'expense', amount: 249.00, cat: 'Education', desc: 'PayPal Purchase: Stanford AI & ML Specialization', method: 'paypal', status: 'completed', days: 18, paypalId: 'PAYID-M33201948-SANDBOX' },
      { type: 'expense', amount: 45.00, cat: 'Entertainment', desc: 'PayPal Recurring: Netflix & Spotify Premium Bundle', method: 'paypal', status: 'completed', days: 15, paypalId: 'PAYID-M11094823-SANDBOX' },
      { type: 'expense', amount: 135.80, cat: 'Food', desc: 'Bistro Lumiere Dining & Team Dinner', method: 'credit_card', status: 'completed', days: 12, paypalId: null },
      { type: 'expense', amount: 85.00, cat: 'Healthcare', desc: 'Optometry Vision Exam & Blue-light Lenses', method: 'credit_card', status: 'completed', days: 10, paypalId: null },
      { type: 'expense', amount: 120.00, cat: 'Bills', desc: 'Gigabit Fiber High-Speed Internet', method: 'bank_transfer', status: 'completed', days: 7, paypalId: null },
      { type: 'expense', amount: 64.50, cat: 'Transport', desc: 'Uber Airport Express Ride', method: 'paypal', status: 'completed', days: 5, paypalId: 'PAYID-M77821903-SANDBOX' },
      { type: 'expense', amount: 112.40, cat: 'Food', desc: 'Artisan Grocery & Market Farm Fresh', method: 'credit_card', status: 'completed', days: 3, paypalId: null },
      { type: 'expense', amount: 39.99, cat: 'Other', desc: 'Cloud Storage & Workspace Backup Pro', method: 'paypal', status: 'completed', days: 1, paypalId: 'PAYID-M55019284-SANDBOX' },
    ];

    const insertTx = db.prepare(`
      INSERT INTO transactions (user_id, transaction_type, amount, category, description, payment_method, status, paypal_order_id, is_demo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT OR IGNORE INTO payments (user_id, paypal_order_id, capture_id, amount, currency, status, raw_response, created_at)
      VALUES (?, ?, ?, ?, 'USD', 'COMPLETED', ?, ?)
    `);

    for (const item of initialTransactions) {
      const createdAt = subDays(item.days);
      insertTx.run(userId, item.type, item.amount, item.cat, item.desc, item.method, item.status, item.paypalId, createdAt);

      if (item.paypalId) {
        const captureId = 'CAP-' + item.paypalId.replace('PAYID-', '');
        insertPayment.run(
          userId,
          item.paypalId,
          captureId,
          item.amount,
          JSON.stringify({ id: item.paypalId, status: 'COMPLETED', simulated: true }),
          createdAt
        );
      }
    }
  }
}

seedInitialData();

export default db;
