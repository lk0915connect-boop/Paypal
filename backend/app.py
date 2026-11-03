import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import init_db, get_db_connection
from auth import hash_password, check_password, generate_token, token_required
from paypal_service import create_order, capture_order, is_paypal_configured
from ai_service import generate_financial_advice, is_gemini_configured

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize SQLite database on startup
init_db()

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "backend": "Python Flask",
        "paypal_configured": is_paypal_configured(),
        "gemini_configured": is_gemini_configured(),
        "database": "SQLite3"
    })

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "User with this email already exists"}), 409

    pwd_hash = hash_password(password)
    cursor.execute("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", (name, email, pwd_hash))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = generate_token(user_id, email, name)
    return jsonify({"token": token, "user": {"id": user_id, "name": name, "email": email}}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password_hash, currency FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["id"], user["email"], user["name"])
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "currency": user["currency"]}
    })

@app.route("/api/transactions", methods=["GET"])
@token_required
def get_transactions(current_user):
    user_id = current_user["id"]
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    transactions = [dict(r) for r in rows]
    return jsonify({"transactions": transactions, "total": len(transactions)})

@app.route("/api/paypal/create-order", methods=["POST"])
@token_required
def api_create_order(current_user):
    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    currency = data.get("currency", "USD")
    description = data.get("description", "PayPal Payment")

    if amount <= 0:
        return jsonify({"error": "Amount must be positive"}), 400

    try:
        order = create_order(amount, currency, description)
        return jsonify(order), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/paypal/capture-order", methods=["POST"])
@token_required
def api_capture_order(current_user):
    data = request.get_json() or {}
    order_id = data.get("orderId")
    amount = float(data.get("amount", 25.0))
    category = data.get("category", "Bills")
    description = data.get("description", "PayPal Payment")

    if not order_id:
        return jsonify({"error": "Order ID required"}), 400

    try:
        result = capture_order(order_id, current_user["id"], amount, category, description)
        return jsonify({"success": True, "payment": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ai/chat", methods=["POST"])
@token_required
def api_ai_chat(current_user):
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Message required"}), 400

    try:
        reply = generate_financial_advice(current_user["id"], message)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
