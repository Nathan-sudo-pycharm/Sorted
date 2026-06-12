from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from db.client import supabase
from services.parser import parse_order
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

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

        customer = supabase.table("customers").upsert(
            {"phone_number": phone},
            on_conflict="phone_number"
        ).execute()
        customer_id = customer.data[0]["id"]

        supabase.table("messages").insert({
            "customer_id": customer_id,
            "direction": "inbound",
            "body": text
        }).execute()

        parsed = parse_order(text)
        print(f"🧠 Parsed: {parsed}")

        if parsed.get("is_order"):
            order = supabase.table("orders").insert({
                "customer_id": customer_id,
                "raw_message": text,
                "items": parsed.get("items", []),
                "delivery_date": parsed.get("delivery_date"),
                "is_price_query": parsed.get("is_price_query", False),
                "suggested_reply": parsed.get("suggested_reply"),
                "status": "new"
            }).execute()
            print(f"✅ Order saved! ID: {order.data[0]['id']}")
        else:
            print("ℹ️ Not an order, ignoring")

    except (KeyError, IndexError):
        print("Not a message event, ignoring")

    return {"status": "ok"}

@app.get("/orders/{order_id}")
def get_order(order_id: str):
    order = supabase.table("orders").select("*").eq("id", order_id).execute()
    if not order.data:
        return {"error": "Order not found"}
    order_data = order.data[0]
    messages = supabase.table("messages").select("*").eq("customer_id", order_data["customer_id"]).order("created_at").execute()
    return {"order": order_data, "messages": messages.data}

@app.patch("/orders/{order_id}")
async def update_order(order_id: str, request: Request):
    body = await request.json()
    allowed = ["status", "total_amount", "advance_paid", "notes", "confirmation_sent"]
    update_data = {k: v for k, v in body.items() if k in allowed}
    result = supabase.table("orders").update(update_data).eq("id", order_id).execute()
    return {"order": result.data[0]}

@app.post("/orders/{order_id}/reply")
async def send_reply(order_id: str, request: Request):
    body = await request.json()
    message_text = body.get("message")
    order = supabase.table("orders").select("customer_id").eq("id", order_id).execute()
    customer_id = order.data[0]["customer_id"]
    supabase.table("messages").insert({
        "customer_id": customer_id,
        "order_id": order_id,
        "direction": "outbound",
        "body": message_text
    }).execute()
    print(f"📤 Reply saved: {message_text}")
    return {"status": "sent"}

# --- Menu endpoints ---

@app.get("/menu")
def get_menu():
    result = supabase.table("menu_items").select("*").order("created_at").execute()
    return {"items": result.data}

@app.post("/menu")
async def add_menu_item(request: Request):
    body = await request.json()
    result = supabase.table("menu_items").insert({
        "name": body.get("name"),
        "aliases": body.get("aliases", []),
        "base_price": body.get("base_price"),
        "unit": body.get("unit", "piece"),
        "active": True
    }).execute()
    return {"item": result.data[0]}

@app.patch("/menu/{item_id}")
async def update_menu_item(item_id: str, request: Request):
    body = await request.json()
    allowed = ["name", "aliases", "base_price", "unit", "active"]
    update_data = {k: v for k, v in body.items() if k in allowed}
    result = supabase.table("menu_items").update(update_data).eq("id", item_id).execute()
    return {"item": result.data[0]}

# --- Customer endpoints ---

@app.get("/customers")
def get_customers():
    result = supabase.table("customers").select("*").order("created_at", desc=True).execute()
    return {"customers": result.data}

@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    customer = supabase.table("customers").select("*").eq("id", customer_id).execute()
    if not customer.data:
        return {"error": "Customer not found"}
    orders = supabase.table("orders").select("*").eq("customer_id", customer_id).order("created_at", desc=True).execute()
    return {"customer": customer.data[0], "orders": orders.data}