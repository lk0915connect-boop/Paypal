import React from 'react';
import { 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  LineChart, 
  Bot, 
  Lock, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Receipt,
  Cpu,
  Layers,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  onViewArchitecture: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreFeatures,
  onViewArchitecture,
}) => {
  const { demoLogin } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B192C] to-[#1E3E62] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/20 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-5xl text-center">
          
          {/* Hackathon Ribbon */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex h-2 w-2 rounded-full bg-[#0070BA] animate-pulse" />
            <span>Official Submission: PayPal AI Hackathon 2026</span>
            <span className="text-blue-400/60">•</span>
            <span className="text-amber-300">PayPal REST v2 + Google Gemini</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-[1.15]">
            Manage Your Money <br />
            <span className="bg-gradient-to-r from-blue-300 via-[#38bdf8] to-amber-300 bg-clip-text text-transparent">
              Smarter with AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Experience intelligent financial management with secure PayPal payments and AI-powered financial insights.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0070BA] to-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-[#005ea6] hover:to-blue-600 transition-all transform active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => demoLogin()}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all transform active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Explore Instant Demo</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Zero client secrets exposed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              PayPal Sandbox ready
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-300" />
              Gemini 3.8 Flash engine
            </span>
          </div>

          {/* Interactive Preview Mockup Card */}
          <div className="mt-16 rounded-2xl border border-white/15 bg-slate-900/80 p-3 sm:p-5 shadow-2xl backdrop-blur-xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-2 font-mono text-xs text-slate-400">paysmart.ai/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-300 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Financial Intelligence Active
              </div>
            </div>

            {/* Dashboard Teaser Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <span className="text-xs text-slate-400 font-medium">Net Monthly Cashflow</span>
                <p className="text-2xl font-black text-white mt-1">$4,970.50</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+68% Savings Rate</span>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <span className="text-xs text-slate-400 font-medium">PayPal Verified Volume</span>
                <p className="text-2xl font-black text-[#38bdf8] mt-1">$2,173.49</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span>Server-captured Sandbox v2</span>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border border-purple-500/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-200 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    AI Advisor Live Tip
                  </span>
                  <span className="text-[10px] bg-purple-400/20 px-1.5 py-0.5 rounded text-purple-300">Gemini</span>
                </div>
                <p className="text-xs text-slate-200 mt-2 line-clamp-2">
                  "Bills account for 38% of your outflows. Consolidating subscriptions through PayPal recurring saves $42/mo."
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070BA] dark:text-blue-400">
              Complete FinTech Platform
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Why PaySmart AI Stands Apart
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              A unified bridge connecting official PayPal payment operations directly with Google Gemini financial reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800/80 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0070BA] dark:bg-blue-950/80 dark:text-blue-300 mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official PayPal REST v2 Engine
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full lifecycle order creation, client authorization, server-side capture verification, and duplicate payment prevention.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Order capture verification
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  PayPal Sandbox ready
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800/80 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300 mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Google Gemini AI Financial Advisor
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by Gemini 3.8 Flash with direct access to user ledger data. Never hallucinates numbers or invents transactions.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Context-grounded spending audits
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  50/30/20 budget recommendations
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800/80 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 mb-4">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Recharts Analytics
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamic category distribution donut charts, monthly cashflow curves, and proprietary Financial Health Score metrics.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Cashflow velocity indicators
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Category breakdown & trends
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 border-t border-slate-200/70 dark:border-slate-800">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070BA] dark:text-blue-400">
              Streamlined Architecture
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              How PaySmart AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="relative text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0070BA] text-white font-black text-lg mb-4">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Create & Authorize Order</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                User initiates a payment. Server calls PayPal REST API v2 to create order tokens with strict server authorization.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#003087] text-white font-black text-lg mb-4">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure Server Capture</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Backend captures payment, verifies status ('COMPLETED'), logs capture IDs, and inserts verified records into SQLite.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white font-black text-lg mb-4">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Financial Intelligence</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Google Gemini analyzes the updated financial snapshot, categorizes habits, and surfaces instant personalized recommendations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SAMPLE TESTIMONIALS (CLEARLY MARKED) */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-full bg-slate-200/80 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-6">
            Demonstration Reviews • Sample Content for Prototype Evaluation
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                "Connecting PayPal checkouts with Google Gemini gives small business owners an instant CFO on demand without manual bookkeeping."
              </p>
              <div className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                Jordan Vance <span className="font-normal text-slate-500">— Freelance Agency Lead (Sample Persona)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800">
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                "The PayPal sandbox checkout is super crisp, and the AI chatbot actually understands my real balances instead of giving generic advice."
              </p>
              <div className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                Elena Rostova <span className="font-normal text-slate-500">— FinTech Analyst (Sample Persona)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0070BA] text-white font-extrabold text-xs">
              P
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              PaySmart AI <span className="font-normal text-slate-400 text-xs">| PayPal AI Hackathon 2026</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>SQLite Database</span>
            <span>PayPal Sandbox REST v2</span>
            <span>Google Gemini 3.8 Flash</span>
            <button onClick={onViewArchitecture} className="hover:text-[#0070BA] font-semibold transition-colors">
              Architecture Docs
            </button>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 PaySmart AI. Built for the PayPal AI Hackathon.
          </p>
        </div>
      </footer>

    </div>
  );
};
