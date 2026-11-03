import os
import requests
from config import Config
from models import get_db_connection

def is_gemini_configured():
    return bool(Config.GEMINI_API_KEY and Config.GEMINI_API_KEY != "MY_GEMINI_API_KEY")

def get_user_transaction_summary(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT transaction_type, amount, category, description, payment_method, created_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "No recorded transactions for this user yet."

    total_income = sum(r["amount"] for r in rows if r["transaction_type"] == "income")
    total_expense = sum(r["amount"] for r in rows if r["transaction_type"] == "expense")
    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    recent_lines = [
        f"- {r['created_at'][:10]}: {r['transaction_type'].upper()} ${r['amount']:.2f} | {r['category']} | {r['description']} ({r['payment_method']})"
        for r in rows[:10]
    ]

    return f"""
AUTHENTICATED FINANCIAL DATA:
Total Income: ${total_income:.2f}
Total Expenses: ${total_expense:.2f}
Net Savings: ${net_savings:.2f} (Savings Rate: {savings_rate:.1f}%)
Recent Transactions:
{chr(10).join(recent_lines)}
"""

def generate_financial_advice(user_id: int, user_message: str):
    if not is_gemini_configured():
        return (
            "⚠️ **Gemini API Key Required**\n\n"
            "Please configure your GEMINI_API_KEY in .env to activate live Google Gemini responses."
        )

    context = get_user_transaction_summary(user_id)
    prompt = f"""
You are PaySmart AI, an elite financial advisor created for the PayPal AI Hackathon 2026.
Base your response strictly on the authenticated user transaction ledger data below:

{context}

USER QUESTION:
"{user_message}"

Provide a clear, actionable, structured answer. Never fabricate numbers.
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    response = requests.post(url, json=payload, timeout=20)
    response.raise_for_status()
    data = response.json()
    reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Unable to analyze.")

    # Save to chat history
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ai_chat_history (user_id, message, response) VALUES (?, ?, ?)", (user_id, user_message, reply))
    conn.commit()
    conn.close()

    return reply
