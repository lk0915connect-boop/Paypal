import requests
import base64
import uuid
from config import Config
from models import get_db_connection

def is_paypal_configured():
    return (
        bool(Config.PAYPAL_CLIENT_ID) and 
        bool(Config.PAYPAL_CLIENT_SECRET) and 
        Config.PAYPAL_CLIENT_ID != "your_paypal_sandbox_client_id"
    )

def get_paypal_access_token():
    auth_str = f"{Config.PAYPAL_CLIENT_ID}:{Config.PAYPAL_CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
    
    url = f"{Config.PAYPAL_API_BASE}/v1/oauth2/token"
    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    
    response = requests.post(url, headers=headers, data=data, timeout=10)
    response.raise_for_status()
    return response.json().get("access_token")

def create_order(amount: float, currency: str = "USD", description: str = "PaySmart AI Payment"):
    if is_paypal_configured():
        token = get_paypal_access_token()
        url = f"{Config.PAYPAL_API_BASE}/v2/checkout/orders"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": currency,
                    "value": f"{amount:.2f}"
                },
                "description": description
            }]
        }
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        res_data = response.json()
        return {
            "orderId": res_data.get("id"),
            "status": res_data.get("status"),
            "isSimulated": False
        }
    else:
        # Sandbox Test Simulator
        simulated_id = f"PAYID-SANDBOX-{uuid.uuid4().hex[:8].upper()}"
        return {
            "orderId": simulated_id,
            "status": "CREATED",
            "isSimulated": True
        }

def capture_order(order_id: str, user_id: int, amount: float, category: str = "Bills", description: str = "PayPal Checkout"):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check duplicate
    cursor.execute("SELECT id FROM payments WHERE paypal_order_id = ?", (order_id,))
    if cursor.fetchone():
        conn.close()
        raise ValueError(f"Order {order_id} has already been captured.")

    if is_paypal_configured():
        token = get_paypal_access_token()
        url = f"{Config.PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        response = requests.post(url, headers=headers, timeout=10)
        response.raise_for_status()
        res_data = response.json()
        
        status = res_data.get("status", "COMPLETED")
        captures = res_data.get("purchase_units", [{}])[0].get("payments", {}).get("captures", [{}])
        capture_id = captures[0].get("id", f"CAP-{order_id}")
        captured_val = float(captures[0].get("amount", {}).get("value", amount))
        currency = captures[0].get("amount", {}).get("currency_code", "USD")
    else:
        status = "COMPLETED"
        capture_id = f"CAP-SANDBOX-{uuid.uuid4().hex[:8].upper()}"
        captured_val = amount
        currency = "USD"
        res_data = {"simulated": True, "status": "COMPLETED"}

    # Insert into payments
    cursor.execute("""
    INSERT INTO payments (user_id, paypal_order_id, capture_id, amount, currency, status, raw_response)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, order_id, capture_id, captured_val, currency, status, str(res_data)))

    # Insert into transactions
    cursor.execute("""
    INSERT INTO transactions (user_id, transaction_type, amount, category, description, payment_method, status, paypal_order_id)
    VALUES (?, 'expense', ?, ?, ?, 'paypal', 'completed', ?)
    """, (user_id, captured_val, category, description, order_id))

    conn.commit()
    conn.close()

    return {
        "orderId": order_id,
        "captureId": capture_id,
        "amount": captured_val,
        "currency": currency,
        "status": status
    }
