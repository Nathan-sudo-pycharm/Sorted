from fastapi import FastAPI, Request, Query
from dotenv import load_dotenv
from db.client import supabase
from services.parser import parse_order
import os

load_dotenv()

app = FastAPI()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "mysecrettoken")

@app.get("/webhook")
def verify(
    hub_mode: str = Query(alias="hub.mode"),
    hub_challenge: str = Query(alias="hub.challenge"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    return {"error": "Forbidden"}

@app.post("/webhook")
async def receive(request: Request):
    body = await request.json()

    try:
        message = body["entry"][0]["changes"][0]["value"]["messages"][0]
        phone = message["from"]
        text = message["text"]["body"]
        print(f"📱 From: {phone}")
        print(f"💬 Message: {text}")

        # Upsert customer
        customer = supabase.table("customers").upsert(
            {"phone_number": phone},
            on_conflict="phone_number"
        ).execute()
        customer_id = customer.data[0]["id"]

        # Save message
        supabase.table("messages").insert({
            "customer_id": customer_id,
            "direction": "inbound",
            "body": text
        }).execute()

        # Parse the order
        parsed = parse_order(text)
        print(f"🧠 Parsed: {parsed}")

        if parsed.get("is_order"):
            # Save order to Supabase
            order = supabase.table("orders").insert({
                "customer_id": customer_id,
                "raw_message": text,
                "items": parsed.get("items", []),
                "delivery_date": parsed.get("delivery_date"),
                "is_price_query": parsed.get("is_price_query", False),
                "suggested_reply": parsed.get("suggested_reply"),
                "status": "new"
            }).execute()

            order_id = order.data[0]["id"]
            print(f"✅ Order saved! ID: {order_id}")
            print(f"📦 Items: {parsed.get('items')}")
            print(f"📅 Delivery: {parsed.get('delivery_date')}")
            print(f"💬 Suggested reply: {parsed.get('suggested_reply')}")
        else:
            print("ℹ️ Not an order, ignoring")

    except (KeyError, IndexError):
        print("Not a message event, ignoring")

    return {"status": "ok"}