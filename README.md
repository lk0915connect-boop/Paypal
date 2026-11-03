# PaySmart AI: AI-Powered Smart Payment & Financial Platform

> **Official Project Submission for the PayPal AI Hackathon 2026**  
> *Transforming PayPal payment operations into automated, real-time financial intelligence powered by Google Gemini and SQLite.*

---

## 1. Project Introduction & Problem Statement

Modern individuals, freelancers, and small businesses process dozens of digital payments every week through digital wallets and payment gateways like PayPal. However:
- Payments are historically **disconnected from intelligent budgeting and forecasting**.
- Users must manually categorize receipts, copy totals into disparate spreadsheets, or guess their end-of-month cashflow.
- Financial advice from generic AI chatbots suffers from severe hallucination because the AI lacks real, authentic access to verified transaction records and payment proofs.

**PaySmart AI bridges this divide.** By integrating the official **PayPal Developer REST API v2** with **Google Gemini 3.8 Flash** atop a high-performance SQLite persistent ledger, PaySmart AI gives every user an instant, automated CFO and spending auditor directly connected to their payments.

---

## 2. Main Features

- 💳 **Official PayPal REST API v2 Sandbox Integration**:
  - Server-authoritative order creation (`/v2/checkout/orders`).
  - Interactive PayPal Sandbox checkout and authorization.
  - Cryptographic server-side capture verification (`/v2/checkout/orders/{id}/capture`).
  - Duplicate capture prevention and SQLite payment auditing.
  - Digital verified receipt generation.

- 🤖 **Google Gemini 3.8 Flash AI Financial Assistant**:
  - Context-grounded analysis: Gemini is supplied with the user's authentic SQLite transaction records.
  - Zero hallucination: Exact figures, category breakdown percentages, and merchant names.
  - Conversational chat with suggested quick prompt pills and persistent chat history.
  - Automated proactive spending diagnosis and personalized recommendations.

- 📊 **Dynamic FinTech Dashboard & Recharts Analytics**:
  - Real-time balance, income, expenses, and savings rate calculations.
  - Monthly spending and cashflow velocity curves.
  - Expense distribution donut charts by category.
  - **Proprietary Financial Health Score (0-100)** evaluating savings rate, expense coverage, and transaction continuity.
  - **50/30/20 Budget Framework Gauge** (Needs, Wants, Savings).

- 📝 **Expense Tracker & Ledger Management**:
  - Add, edit, and delete income and expense records.
  - Categorization: Bills, Food, Transport, Education, Shopping, Healthcare, Entertainment, Other.
  - Distinct badges for verified PayPal payments vs. manual entries.
  - Search, filtering by payment channel and category, sorting, and CSV export.

- ⚙️ **Production-Grade Architecture**:
  - Bcrypt password hashing and JWT authentication.
  - Dark mode and light mode support with seamless toggle.
  - Multi-currency support (USD, EUR, GBP, CAD, AUD, JPY).
  - Responsive layout for desktop, tablet, and mobile.
  - Unified Full-Stack Node/Express server + pre-packaged exportable Python Flask backend in `/backend`.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts |
| **Full-Stack Runtime** | Node.js, Express, tsx, Better-SQLite3, JsonWebToken, Bcrypt.js |
| **Exportable Backend** | Python 3, Flask, Requests, PyJWT, Bcrypt, SQLite3 |
| **Payment Gateway** | PayPal Developer REST API v2 (Orders & Captures), Sandbox |
| **Artificial Intelligence** | Google Gemini 3.8 Flash via `@google/genai` TypeScript SDK |
| **Database** | SQLite3 with WAL mode and foreign key constraints |

---

## 4. Architecture & Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 SPA (Client)                    │
│   Dashboard • Recharts • AI Chat • PayPal Checkout Modal    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST (JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Full-Stack Server (Express / Flask)            │
│  - Never exposes PayPal Secret or Gemini Key to browser     │
│  - Input validation, rate limiting & Bcrypt auth            │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   PayPal REST API Sandbox    │ │   Google Gemini 3.8 Flash  │
│  - POST /v2/checkout/orders  │ │  - Context-grounded audit  │
│  - POST /capture             │ │  - 50/30/20 recommendations│
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│             SQLite Persistent Database (WAL Mode)           │
│     users • transactions • payments • ai_chat_history       │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Environment Variables & Setup

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Gemini AI API Key (Injected automatically in AI Studio or from Google AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Self-referential App URL
APP_URL="http://localhost:3000"

# PayPal Sandbox Credentials (from developer.paypal.com)
PAYPAL_CLIENT_ID="your_paypal_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_sandbox_client_secret"
PAYPAL_MODE="sandbox"

# JWT Secret
JWT_SECRET="paysmart-ai-super-secret-key-2026"
```

### Obtaining PayPal Sandbox Credentials:
1. Navigate to [developer.paypal.com](https://developer.paypal.com) and log in.
2. In the Dashboard, go to **Apps & Credentials** and select **Sandbox**.
3. Click **Create App**, select **Merchant**, and obtain your **Client ID** and **Secret Key**.
4. Paste them into your `.env` file.
*Note: If credentials are not yet configured, PaySmart AI includes an interactive built-in Sandbox Simulator so all payment capture workflows run immediately!*

---

## 6. How to Run

### Running the Live Full-Stack App:
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (logic verification)
npm test

# 3. Start full-stack dev server (Express + Vite on Port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the Python Flask Backend (Optional Export):
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The Flask REST API will start on `http://localhost:5000`.

---

## 7. Fast Evaluator Access (Demo Dataset)

For instant hackathon evaluation without filling forms:
- Click **"Instant Demo"** or **"Launch Instant Demo"** on the landing page or login modal.
- Credentials:
  - **Email**: `demo@paysmart.ai`
  - **Password**: `Demo1234!`
- Pre-seeded with 15 realistic transactions across all categories, including verified PayPal payments, pre-configured savings ratios, and instant AI analytics.

---

## 8. License

This project is licensed under the Apache License 2.0. Built for the PayPal AI Hackathon 2026.
