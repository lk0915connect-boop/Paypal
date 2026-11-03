import { GoogleGenAI } from '@google/genai';
import db from './db';
import { calculateCashflow, calculateCategoryBreakdown, calculateFinancialHealthScore } from '../utils/finance';

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

/**
 * Gathers user financial context from SQLite to feed into the prompt context.
 */
function getUserFinancialContext(userId: number) {
  const transactions = db.prepare(`
    SELECT id, transaction_type, amount, category, description, payment_method, status, created_at, paypal_order_id, is_demo
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  if (transactions.length === 0) {
    return {
      hasData: false,
      summaryText: 'User has no recorded transactions yet.',
      transactions: [],
      cashflow: null,
      breakdown: [],
    };
  }

  const cashflow = calculateCashflow(transactions);
  const breakdown = calculateCategoryBreakdown(transactions);
  const health = calculateFinancialHealthScore(
    cashflow.totalIncome,
    cashflow.totalExpenses,
    transactions.length,
    breakdown.length
  );

  const recentList = transactions.slice(0, 12).map((t) => 
    `- [${t.created_at.substring(0, 10)}] ${t.transaction_type.toUpperCase()} $${t.amount.toFixed(2)} | Category: ${t.category} | Method: ${t.payment_method} | Desc: ${t.description}${t.paypal_order_id ? ' (PayPal Verified)' : ''}${t.is_demo ? ' [Sample Data]' : ''}`
  ).join('\n');

  const categoryList = breakdown.map((b) => 
    `- ${b.category}: $${b.amount.toFixed(2)} (${b.percentage}% of total expenses, ${b.count} transactions)`
  ).join('\n');

  const summaryText = `
CURRENT USER FINANCIAL SNAPSHOT (AUTHENTICATED DATA FROM SQLITE):
- Total Income: $${cashflow.totalIncome.toFixed(2)}
- Total Expenses: $${cashflow.totalExpenses.toFixed(2)}
- Net Monthly Savings: $${cashflow.netSavings.toFixed(2)}
- Current Savings Rate: ${cashflow.savingsRate}%
- Financial Health Score: ${health.score}/100 (${health.rating})
- Total Transactions Logged: ${transactions.length}

EXPENSE BREAKDOWN BY CATEGORY:
${categoryList || 'No expenses logged'}

RECENT TRANSACTIONS:
${recentList}
`;

  return {
    hasData: true,
    summaryText,
    transactions,
    cashflow,
    breakdown,
    health,
  };
}

export interface ChatRequest {
  userId: number;
  message: string;
  history?: Array<{ role: 'user' | 'model'; parts: string }>;
}

/**
 * Generates financial assistant response using Google Gemini API.
 */
export async function getAiFinancialAdvice(req: ChatRequest): Promise<string> {
  const { userId, message } = req;
  const context = getUserFinancialContext(userId);
  const ai = getAiClient();

  if (!ai) {
    return (
      `⚠️ **Gemini API Key Required**\n\n` +
      `To activate live AI responses from Google Gemini 3.8 Flash, please set your \`GEMINI_API_KEY\` in your environment or the **Settings > Secrets** panel.\n\n` +
      `Here is your algorithmic financial calculation based on your current SQLite records:\n\n` +
      (context.hasData
        ? `• **Total Income**: $${context.cashflow?.totalIncome.toFixed(2)}\n` +
          `• **Total Expenses**: $${context.cashflow?.totalExpenses.toFixed(2)}\n` +
          `• **Net Savings**: $${context.cashflow?.netSavings.toFixed(2)} (${context.cashflow?.savingsRate}% savings rate)\n` +
          `• **Top Spending Category**: ${context.breakdown[0]?.category || 'N/A'} ($${context.breakdown[0]?.amount.toFixed(2) || '0'})\n` +
          `• **Financial Health Rating**: ${context.health?.rating} (${context.health?.score}/100)\n\n` +
          `*Once you attach your GEMINI_API_KEY, you will receive full conversational financial advisory!*`
        : `*No transaction history found yet. Add an expense or use the demo dataset to analyze.*`)
    );
  }

  const systemInstruction = `
You are PaySmart AI, an elite, friendly, and precise personal financial advisor and spending analyst created for the PayPal AI Hackathon 2026.
You have direct access to the user's authentic financial records from their SQLite ledger.

CRITICAL RULES:
1. Always base your calculations, category breakdowns, and advice on the user's actual transaction data provided in the prompt.
2. If the user asks about their spending, cite specific dollar figures, percentages, and merchant/description names from their actual data.
3. Never fabricate transactions or hallucinate income/expense numbers.
4. If no transactions exist, gently explain that and suggest they add transactions or explore the sample demo data.
5. If demo data is present (tagged [Sample Data]), you may acknowledge it as demonstration data while analyzing the numbers rigorously.
6. Provide clear, actionable advice with bullet points, highlighting opportunities for PayPal payment savings, budget optimization, recurring expense reduction, and 50/30/20 budget allocations.
7. Maintain a professional, encouraging, and financially prudent tone.
`;

  const promptContent = `
${context.summaryText}

USER QUESTION / REQUEST:
"${message}"

Please analyze the user's question in light of their verified transaction data above and provide a clear, structured, and insightful financial response.
`;

  let reply = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction,
      },
    });
    reply = response.text || '';
  } catch (err: any) {
    console.warn('Gemini 3.8 flash primary call encountered error, attempting fallback model:', err?.message);
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: promptContent,
        config: {
          systemInstruction,
        },
      });
      reply = fallbackResponse.text || '';
    } catch (fallbackErr: any) {
      console.warn('Fallback Gemini call also failed, generating authentic structured report:', fallbackErr?.message);
      reply = `### **PaySmart AI Verified Financial Report**\n\n` +
        `*Based on your authenticated SQLite transactions ledger:*\n\n` +
        `• **Total Spending (Outflow):** $${context.cashflow?.totalExpenses.toFixed(2)} across ${context.transactions.filter(t => t.transaction_type === 'expense').length} expense transactions\n` +
        `• **Total Inflow (Income):** $${context.cashflow?.totalIncome.toFixed(2)}\n` +
        `• **Net Monthly Savings:** $${context.cashflow?.netSavings.toFixed(2)} (${context.cashflow?.savingsRate}% savings rate)\n` +
        `• **Financial Health Rating:** ${context.health?.rating} (${context.health?.score}/100)\n\n` +
        `**Spending Distribution by Category:**\n` +
        context.breakdown.map(b => `• **${b.category}:** $${b.amount.toFixed(2)} (${b.percentage}% of total expenses)`).join('\n') + '\n\n' +
        `*Note: Gemini API is experiencing high demand. The calculations above are 100% computed from your authentic SQLite records.*`;
    }
  }

  // Save chat message into SQLite
  try {
    db.prepare('INSERT INTO ai_chat_history (user_id, message, response) VALUES (?, ?, ?)').run(userId, message, reply);
  } catch (dbErr) {
    console.error('Error saving chat history:', dbErr);
  }

  return reply;
}

/**
 * Generates automated proactive spending insights and recommendations.
 */
export async function getAutomatedFinancialInsights(userId: number) {
  const context = getUserFinancialContext(userId);

  if (!context.hasData) {
    return {
      score: 50,
      rating: 'New Account',
      summary: 'Start by logging your daily expenses or making a PayPal payment to unlock customized AI spending intelligence.',
      recommendations: [
        { title: 'Add your regular monthly income', impact: 'High', category: 'Income' },
        { title: 'Track recurring subscription bills', impact: 'Medium', category: 'Bills' },
        { title: 'Test PayPal Sandbox checkout', impact: 'High', category: 'Payments' },
      ],
    };
  }

  const ai = getAiClient();
  if (!ai) {
    // Algorithmic fallback when Gemini key is not injected
    const topCat = context.breakdown[0];
    return {
      score: context.health?.score || 75,
      rating: context.health?.rating || 'Good',
      summary: `Your total income is $${context.cashflow?.totalIncome.toFixed(2)} with expenses of $${context.cashflow?.totalExpenses.toFixed(2)}, leaving a net positive savings of $${context.cashflow?.netSavings.toFixed(2)}. Your largest expense category is ${topCat?.category || 'Bills'} taking up ${topCat?.percentage || 0}% of your outgoing cashflow.`,
      recommendations: [
        {
          title: `Optimize ${topCat?.category || 'Top'} Spending`,
          description: `You spent $${topCat?.amount.toFixed(2)} on ${topCat?.category}. Review recurring charges to save 10-15%.`,
          impact: 'High',
          category: topCat?.category || 'General',
        },
        {
          title: 'Automate PayPal Bill Pay',
          description: 'Consolidate recurring utility and software subscriptions through PayPal for centralized tracking and fraud protection.',
          impact: 'Medium',
          category: 'Payments',
        },
        {
          title: 'Emergency Fund Target',
          description: `Maintain at least 3 months of expenses ($${((context.cashflow?.totalExpenses || 2000) * 3).toFixed(2)}) in a high-yield reserve.`,
          impact: 'High',
          category: 'Savings',
        },
      ],
    };
  }

  const prompt = `
Generate a quick 3-bullet executive financial diagnostic for this user based on their numbers:
Income: $${context.cashflow?.totalIncome}
Expenses: $${context.cashflow?.totalExpenses}
Savings Rate: ${context.cashflow?.savingsRate}%
Category breakdown: ${JSON.stringify(context.breakdown)}

Return a concise summary and 3 distinct recommendations (High/Medium impact).
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an automated financial insights generator. Be concise, direct, and data-driven.",
      },
    });

    return {
      score: context.health?.score,
      rating: context.health?.rating,
      summary: response.text || 'Spending analysis generated.',
      recommendations: [
        {
          title: `Review ${context.breakdown[0]?.category || 'Major'} Expenses`,
          description: `This category accounts for ${context.breakdown[0]?.percentage || 0}% of your total outflow.`,
          impact: 'High',
          category: context.breakdown[0]?.category || 'Budget',
        },
        {
          title: 'Strengthen Savings Buffer',
          description: `Your current savings rate is ${context.cashflow?.savingsRate}%. Target at least 20% consistent monthly savings.`,
          impact: 'Medium',
          category: 'Savings',
        },
        {
          title: 'Track Verified PayPal Outlays',
          description: 'Leverage PayPal digital receipts for automated tax and business expense documentation.',
          impact: 'Medium',
          category: 'Payments',
        },
      ],
    };
  } catch (err) {
    console.warn('Gemini automatic insights fallback:', err);
    return {
      score: context.health?.score,
      rating: context.health?.rating,
      summary: `Your net savings this period is $${context.cashflow?.netSavings.toFixed(2)} with a ${context.cashflow?.savingsRate}% savings rate.`,
      recommendations: [],
    };
  }
}
