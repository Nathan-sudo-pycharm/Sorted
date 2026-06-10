from groq import Groq
from dotenv import load_dotenv
import os
import json
from datetime import date

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = SYSTEM_PROMPT = """
You are an order parser for an Indian home bakery.
Your job is to extract structured order details from casual WhatsApp messages.
Customers may write in English, Hinglish, or Kannada-English mix.

Always respond with ONLY a valid JSON object, no explanation, no markdown, no extra text.

Today's date is {today}. Use this to resolve relative dates like "Sunday", "tomorrow", "next week".

Extract these fields:
- is_order (boolean): true if the message contains an order or order intent
- items (array): list of items ordered, each with:
    - name (string): item name
    - qty (number): quantity
    - unit (string): kg / piece / dozen / box
    - customisation (string or null): any special requests
- delivery_date (string or null): in YYYY-MM-DD format if mentioned
- delivery_date_confidence (string): "high", "medium", or "low"
- is_price_query (boolean): true if customer is asking for price
- missing_info (array): list of things missing e.g. ["delivery_date", "quantity"]
- suggested_reply (string): a short friendly WhatsApp reply in ENGLISH only, regardless of what language the customer used

If the message is not an order, set is_order to false and leave items empty.
"""

def parse_order(message_text: str) -> dict:
    prompt = SYSTEM_PROMPT.format(today=date.today().isoformat())
    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": message_text}
        ],
        temperature=0.1
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"is_order": False, "error": "Failed to parse LLM response", "raw": raw}