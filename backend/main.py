from fastapi import FastAPI, Request, Query
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "mysecrettoken")

# Meta calls this once to verify your webhook URL
@app.get("/webhook")
def verify(
    hub_mode: str = Query(alias="hub.mode"),
    hub_challenge: str = Query(alias="hub.challenge"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    return {"error": "Forbidden"}

# Meta calls this every time a customer sends a message
@app.post("/webhook")
async def receive(request: Request):
    body = await request.json()
    
    try:
        message = body["entry"][0]["changes"][0]["value"]["messages"][0]
        phone = message["from"]
        text = message["text"]["body"]
        print(f"📱 From: {phone}")
        print(f"💬 Message: {text}")
    except (KeyError, IndexError):
        print("Not a message event, ignoring")
    
    return {"status": "ok"}