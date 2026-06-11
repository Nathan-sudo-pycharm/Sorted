# Sorted — Order Parser Test Log
## Testing the Groq + Llama 3.1 Order Parsing Pipeline
**Nathan Ivor Sequeira | June 2026**

---

## How We Tested

- **Tool used:** Thunder Client (VS Code extension)
- **Endpoint:** `POST http://127.0.0.1:8000/webhook`
- **Method:** Sent mocked WhatsApp payloads with different message types
- **Model:** Groq API — `llama-3.1-8b-instant`
- **Observed:** Terminal output + Supabase `orders` table

Each test changed only the `body` field in the JSON payload:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919876543210",
          "text": {
            "body": "<message here>"
          },
          "type": "text"
        }]
      }
    }]
  }]
}
```

---

## Test Results

---

### Test 1 — Standard English Order

**Input:**
```
hey can I get a 1kg black forest for Sunday with fondant please
```

**Output:**
```json
{
  "is_order": true,
  "items": [{"name": "Black Forest", "qty": 1, "unit": "kg", "customisation": "fondant"}],
  "delivery_date": "2026-06-12",
  "delivery_date_confidence": "high",
  "is_price_query": false,
  "missing_info": [],
  "suggested_reply": "Order confirmed! Black Forest with fondant for Sunday. We'll deliver it fresh on 12th June."
}
```

**Result:** ✅ Pass  
**Notes:** Correctly extracted item, quantity, unit, customisation, and resolved "Sunday" to the correct date.

---

### Test 2 — Hinglish Mixed Order

**Input:**
```
bhaiya ek red velvet cake chaiye sunday ke lie, 2kg, egless and extra decoration ke saath please
```

**Output:**
```json
{
  "is_order": true,
  "items": [{"name": "Red Velvet Cake", "qty": 1, "unit": "kg", "customisation": "eggless, extra decoration"}],
  "delivery_date": "2026-06-12",
  "delivery_date_confidence": "high",
  "is_price_query": false,
  "missing_info": [],
  "suggested_reply": "Your Red Velvet Cake will be eggless and extra decorated. We'll deliver it to you on Sunday. Would you like to place the order?"
}
```

**Result:** ✅ Pass (with minor issue)  
**Notes:** Correctly handled Hinglish (`chaiye`, `ke lie`, `ke saath`). Extracted both customisations correctly. Minor issue — extracted `qty: 1` but message said `2kg`. The weight is correct in the unit but the quantity field should reflect `2`. Flagged for prompt improvement.

---

### Test 3 — Price Query Only

**Input:**
```
how much for a 2kg butterscotch cake?
```

**Output:**
```json
{
  "is_order": false,
  "items": [],
  "delivery_date": null,
  "delivery_date_confidence": null,
  "is_price_query": true,
  "missing_info": ["item", "quantity"],
  "suggested_reply": "Our butterscotch cake is a bestseller! Would you like to place an order?"
}
```

**Result:** ⚠️ Partial Pass  
**Notes:** Correctly detected `is_price_query: true`. However marked `is_order: false` — a price query is order intent and should be saved to the orders table. This is a known bug to fix in the next prompt iteration. The item (`butterscotch cake, 2kg`) was also not extracted despite being clearly mentioned.

---

### Test 4 — Vague / Non-Order Message

**Input:**
```
hi do you make sugar free cakes?
```

**Output:**
```json
{
  "is_order": false,
  "items": [],
  "delivery_date": null,
  "delivery_date_confidence": null,
  "is_price_query": false,
  "missing_info": ["item"],
  "suggested_reply": "Yes, we make sugar free cakes! Would you like to place an order?"
}
```

**Result:** ✅ Pass  
**Notes:** Correctly identified as not an order. Suggested reply is appropriate and steers the customer toward placing an order.

---

### Test 5 — Completely Off-Topic Message

**Input:**
```
HI, I have a crush on your waitress, what is her name?
```

**Output:**
```json
{
  "is_order": false,
  "items": [],
  "delivery_date": null,
  "delivery_date_confidence": null,
  "is_price_query": false,
  "missing_info": [],
  "suggested_reply": "Sorry to hear that, but we're a home bakery, not a restaurant. We don't have a waitress. Would you like to place an order?"
}
```

**Result:** ✅ Pass  
**Notes:** Correctly identified as not an order. The suggested reply was unexpectedly good — correctly clarified it's a home bakery and redirected to ordering.

---

### Test 6 — Kannada-English Mixed Order

**Input:**
```
anna 1kg black forest bekku Sunday ge, fondant haaki, price eshtu?
```

**Output:**
```json
{
  "is_order": true,
  "items": [
    {"name": "Black Forest Cake", "qty": 1, "unit": "kg", "customisation": "Bekku"},
    {"name": "Fondant", "qty": null, "unit": null, "customisation": "Haaki"}
  ],
  "delivery_date": null,
  "delivery_date_confidence": "low",
  "is_price_query": true,
  "missing_info": ["delivery_date", "quantity for fondant"],
  "suggested_reply": "Hi Anna, thanks for the order! I'll check the price for you. Would you like to pick up or have it delivered?"
}
```

**Result:** ⚠️ Partial Pass  
**Notes:** Correctly detected order intent and `is_price_query: true`. However the model got confused by Kannada action words — `Bekku` (means "want") and `Haaki` (means "put/apply") were treated as item names/customisations instead of verbs. Also `delivery_date` was not extracted despite "Sunday ge" being present. Also called the customer "Anna" (the Kannada word for brother/elder) as if it were a name. These are known Kannada-specific prompt improvements needed.

---

## Summary

| Test | Input Type | is_order | Items Extracted | Date Extracted | Result |
|---|---|---|---|---|---|
| 1 | Standard English | ✅ | ✅ | ✅ | ✅ Pass |
| 2 | Hinglish | ✅ | ✅ | ✅ | ✅ Pass (minor qty issue) |
| 3 | Price query only | ❌ | ❌ | ❌ | ⚠️ Partial |
| 4 | Vague question | ✅ | N/A | N/A | ✅ Pass |
| 5 | Off-topic | ✅ | N/A | N/A | ✅ Pass |
| 6 | Kannada-English | ✅ | ⚠️ | ❌ | ⚠️ Partial |

---

## Known Issues to Fix

| Issue | Affected Tests | Fix |
|---|---|---|
| Price queries not saved as orders | Test 3 | Update prompt: if `is_price_query` is true, also set `is_order` to true |
| Kannada action words extracted as item names | Test 6 | Add Kannada common verbs/words to exclude list in prompt |
| qty field doesn't reflect weight when unit is kg | Test 2 | Clarify in prompt: qty should be the number before the unit |
| Kannada date expressions not resolved | Test 6 | Add examples of Kannada date expressions to prompt |

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*