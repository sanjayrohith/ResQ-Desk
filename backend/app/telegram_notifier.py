import requests

BOT_TOKEN = "8595727693:AAH7ElOWvr54-grvapco2z16-6Mj_rtLC5Y"
VOLUNTEER_CHAT_ID = "1940917226"

def send_telegram_alert(incident):
    message = f"""
🚨 *NEW EMERGENCY ALERT*

🔥 Type: {incident.analysis.emergency_type}
⚠️ Severity: {incident.analysis.severity}
📍 Location: {incident.analysis.location}

🧠 Reasoning:
{incident.analysis.reasoning}

🚑 Suggested Unit:
{incident.suggested_unit}

— ResQ Dispatch System
"""

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": VOLUNTEER_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print("Telegram notification failed:", e)
