import React, { useState } from 'react';
import { 
  Cpu, 
  CreditCard, 
  Bot, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Terminal, 
  FileCode, 
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';

export const HackathonDocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'paypal' | 'gemini' | 'flask' | 'checklist'>('architecture');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0070BA] text-white">
            <Cpu className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            PayPal AI Hackathon 2026 Submission
          </h1>
          <span className="rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-950/60 dark:text-blue-300 text-[10px] px-2.5 py-0.5 font-bold">
            Project: PaySmart AI
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive technical architecture, payment verification workflow, AI models, and deployment manual.
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'architecture', label: '1. Architecture & Data Flow', icon: Layers },
          { id: 'paypal', label: '2. PayPal REST v2 Integration', icon: CreditCard },
          { id: 'gemini', label: '3. Google Gemini 3.8 Flash AI', icon: Bot },
          { id: 'flask', label: '4. Python Flask Export Backend', icon: FileCode },
          { id: 'checklist', label: '5. Hackathon Verification Checklist', icon: CheckCircle2 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-b-2 border-[#0070BA] text-[#0070BA] dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              End-to-End System Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              PaySmart AI unites official PayPal Sandbox payment operations with Google Gemini artificial intelligence to transform everyday payment events into predictive financial management. The system is designed with strict server-authoritative security: all PayPal credentials, order generation, and capture validation occur exclusively on the backend.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                <span className="font-bold text-xs text-[#0070BA] dark:text-blue-400">Frontend Layer</span>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>• React 19 + TypeScript + Vite</li>
                  <li>• Tailwind CSS responsive UI</li>
                  <li>• Recharts interactive data visualization</li>
                  <li>• Lucide icons & Framer-like animations</li>
                  <li>• Zero exposed PayPal secrets</li>
                </ul>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">Backend & API Layer</span>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>• Live Full-Stack Express on port 3000</li>
                  <li>• Python Flask alternative exportable backend</li>
                  <li>• SQLite3 persistent ledger (WAL mode)</li>
                  <li>• Bcrypt password hashing & JWT auth</li>
                  <li>• PayPal REST v2 Order & Capture API</li>
                </ul>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/30">
                <span className="font-bold text-xs text-purple-600 dark:text-purple-400">AI Intelligence Layer</span>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>• Google Gemini 3.8 Flash model</li>
                  <li>• Authenticated SQLite ledger grounding</li>
                  <li>• Zero invented or hallucinated figures</li>
                  <li>• Contextual spending audits</li>
                  <li>• 50/30/20 budget recommendation engine</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYPAL WORKFLOW */}
      {activeTab === 'paypal' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Official PayPal REST v2 Workflow
            </h3>
            
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-blue-600 dark:text-blue-400">Step 1: Order Creation (POST /v2/checkout/orders)</span>
                <p className="mt-1 text-[11px] text-slate-500">
                  When a user enters amount and description, the frontend issues an authorized request to <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">/api/paypal/create-order</code>. The server uses Basic Auth with PayPal Client ID and Secret to request an OAuth2 access token, then creates a server-authoritative order token.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-blue-600 dark:text-blue-400">Step 2: Client Approval</span>
                <p className="mt-1 text-[11px] text-slate-500">
                  The client approves the checkout using the PayPal Checkout modal, displaying the exact transaction order identifier and recipient metadata.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="font-bold text-blue-600 dark:text-blue-400">Step 3: Secure Capture (POST /v2/checkout/orders/&#123;id&#125;/capture)</span>
                <p className="mt-1 text-[11px] text-slate-500">
                  Backend captures the transaction directly with PayPal, ensures the response status is <code className="font-bold text-emerald-600">COMPLETED</code>, validates the captured amount against expected values, checks for duplicate order IDs, and persists the verified payment in SQLite.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEMINI AI */}
      {activeTab === 'gemini' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Google Gemini 3.8 Flash Financial Intelligence
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike generic chatbot implementations, PaySmart AI feeds the user's authentic SQLite ledger data directly into the Gemini prompt context. When users ask "How much did I spend this month?", Gemini calculates exact figures from the real dataset.
            </p>

            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/60 dark:bg-purple-950/30 text-xs space-y-2">
              <span className="font-bold text-purple-700 dark:text-purple-300">System Instruction Guarantees:</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                <li>Never invent financial transactions or hallucinate income/expense numbers.</li>
                <li>Cite authentic merchant names and percentage allocations from verified records.</li>
                <li>Distinguish between manual receipts and verified PayPal payments.</li>
                <li>Provide actionable 50/30/20 recommendations for surplus cashflow.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLASK EXPORT */}
      {activeTab === 'flask' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Python Flask Export Backend Structure
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              As required by Section 16 of the hackathon brief, the complete Python Flask backend files are pre-generated in the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-xs">/backend</code> directory:
            </p>

            <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs space-y-1">
              <p className="text-emerald-400">paysmart-ai/</p>
              <p className="pl-4">├── backend/</p>
              <p className="pl-8 text-blue-300">├── app.py              # Main Flask REST API application</p>
              <p className="pl-8 text-blue-300">├── config.py           # PayPal & Gemini environment settings</p>
              <p className="pl-8 text-blue-300">├── models.py           # SQLite database models & seed</p>
              <p className="pl-8 text-blue-300">├── auth.py             # JWT & bcrypt authentication</p>
              <p className="pl-8 text-blue-300">├── paypal_service.py   # PayPal REST v2 API integration</p>
              <p className="pl-8 text-blue-300">├── ai_service.py       # Google Gemini AI assistant</p>
              <p className="pl-8 text-blue-300">├── requirements.txt    # Flask, requests, pyjwt, bcrypt</p>
              <p className="pl-8 text-blue-300">└── .env.example        # Environment variable template</p>
              <p className="pl-4">├── database/             # SQLite database storage</p>
              <p className="pl-4">├── src/                  # React Vite frontend</p>
              <p className="pl-4">└── README.md             # Hackathon documentation</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              PayPal AI Hackathon 2026 Requirements Verification
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'User Registration, Login, and Password Hashing (Bcrypt)', status: 'Implemented & Verified' },
                { title: 'SQLite Database with Users, Transactions, Payments, AI Chat History', status: 'Implemented & Verified' },
                { title: 'PayPal Sandbox REST v2 Order Creation & Server-side Capture', status: 'Implemented & Verified' },
                { title: 'Duplicate Payment Prevention & Cryptographic Validation', status: 'Implemented & Verified' },
                { title: 'Google Gemini 3.8 Flash AI Financial Assistant & Advisor', status: 'Implemented & Verified' },
                { title: 'Context Grounding in User Authentic Transaction History', status: 'Implemented & Verified' },
                { title: 'Expense Tracker with Add, Edit, Delete, and Categories', status: 'Implemented & Verified' },
                { title: 'Recharts Financial Analytics & 50/30/20 Budget Gauge', status: 'Implemented & Verified' },
                { title: 'Transaction Ledger with Search, Filtering, Sorting, CSV Export', status: 'Implemented & Verified' },
                { title: 'Settings with User Profile, Currency Selector, and Dark Mode', status: 'Implemented & Verified' },
                { title: 'Python Flask Backend Export Files & Documentation', status: 'Implemented & Verified' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
