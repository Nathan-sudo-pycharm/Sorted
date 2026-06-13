# Sorted — Developer Log
## Day 4: Order Detail Page, Status Updates & Reply System
**Nathan Ivor Sequeira | June 2026**

---

## What I Was Trying to Build

With the Kanban board live from Day 3, today's goal was to make orders actually actionable. A baker needs to be able to:
- Click an order and see its full details
- Update the order status with one click
- Send a reply back to the customer
- See the full conversation history

This is the difference between a read-only dashboard and a real tool.

---

## Part 1 — Backend API Endpoints

### New endpoints added to `main.py`

Before building any frontend, I needed three new backend routes:

**`GET /orders/{order_id}`** — fetches a single order with its full message history. Returns both the order data and all messages from that customer.

**`PATCH /orders/{order_id}`** — updates an order's fields. Only allows safe fields: `status`, `total_amount`, `advance_paid`, `notes`, `confirmation_sent`. This whitelist approach means random fields can't be accidentally overwritten.

**`POST /orders/{order_id}/reply`** — saves an outbound reply message to the `messages` table linked to the order.

### Challenges

**Duplicate route bug** — I accidentally defined `get_order` twice in `main.py` while editing. FastAPI registered the first one and silently ignored the second. The PATCH and POST routes were never being registered at all, which is why they were returning `405 Method Not Allowed` and `404 Not Found`. The fix was rewriting the entire `main.py` cleanly from scratch.

**Reading the error:**
```
405 Method Not Allowed → route exists but wrong HTTP method
404 Not Found → route doesn't exist at all
```
This distinction is useful — 405 means FastAPI found the path but not the method, 404 means the path itself isn't registered.

**CORS blocking frontend requests** — the browser blocked all requests from `localhost:3000` to `localhost:8000` because FastAPI wasn't sending CORS headers. Fixed by adding `CORSMiddleware`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)
```

**Schema cache error for `order_id` column** — after adding the `order_id` column to the `messages` table via SQL, Supabase's PostgREST schema cache hadn't refreshed yet. The fix was opening the API section in the Supabase dashboard to force a cache reload.

---

## Part 2 — Order Detail Frontend Page

### Dynamic routing in Next.js

Created `frontend/app/orders/[id]/page.tsx` — the `[id]` in the folder name is Next.js's file-based dynamic routing. When you navigate to `/orders/abc-123`, Next.js automatically passes `abc-123` as the `id` param to the page.

### What the page shows

- **Original message** — the raw WhatsApp text exactly as the customer sent it
- **Parsed items** — structured list with qty, unit, name, customisation
- **Delivery date** — formatted as "14 June 2026"
- **Suggested reply** — highlighted in amber with a "Use this →" button that auto-fills the reply box
- **Status updater** — pill buttons for each status, active one highlighted
- **Conversation history** — inbound messages left-aligned, outbound right-aligned in blue
- **Reply box** — textarea with Send button

<img src="assets/order-detail-page.png" alt="Order detail page showing all sections" width="600"/>

### Making order cards clickable

The `OrderCard` component originally had `cursor-pointer` styling but no click handler. Added `useRouter` from Next.js and an `onClick` that navigates to `/orders/${order.id}`. One line of change, cards are now fully clickable.

---

## Part 3 — Status Updates Working

After fixing the duplicate route bug, clicking status pills on the detail page correctly sends a PATCH request and updates the order in Supabase. The badge at the top of the page updates instantly in the UI without a page refresh — React state update on the frontend, database write in the background.

<img src="assets/kanban-status-updated.png" alt="Kanban board showing orders in multiple columns after status updates" width="600"/>

The Kanban board now shows orders distributed across columns — Confirmed, Ready, New — reflecting real status changes made from the detail page.

---

## Part 4 — Reply System

Sending a reply from the detail page:
1. Types a message in the textarea (or clicks "Use this →" to fill the suggested reply)
2. Hits Send
3. Frontend POSTs to `/orders/{id}/reply`
4. Backend saves it to `messages` table with `direction: outbound`
5. Message appears in the conversation history immediately (optimistic UI update — added to state before waiting for server confirmation)

---

## Current Project Structure

```
sorted/
├── backend/
│   ├── db/
│   │   └── client.py
│   ├── services/
│   │   └── parser.py
│   └── main.py                    # Now has GET, PATCH, POST order endpoints
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Kanban board
│   │   └── orders/
│   │       └── [id]/
│   │           └── page.tsx       # Order detail page
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── KanbanColumn.tsx
│   │   └── OrderCard.tsx          # Now clickable with useRouter
│   └── lib/
│       ├── supabase.ts
│       ├── types.ts
│       └── utils.ts
```

---

## What's Working

- Clicking an order card navigates to the detail page ✅
- Order detail shows raw message, parsed items, delivery date ✅
- Suggested reply auto-fills the reply box on "Use this →" click ✅
- Status update pills update the order in Supabase and reflect in UI instantly ✅
- Kanban board shows orders distributed across correct status columns ✅
- Reply saves to messages table as outbound and appears in conversation ✅
- CORS configured so frontend and backend talk correctly ✅


## Key Lessons

- **405 vs 404** — 405 means the path exists but wrong method. 404 means the path doesn't exist. These two error codes tell you exactly where the problem is.
- **Duplicate function definitions in Python** — Python won't throw an error if you define the same function twice. The second one silently overwrites the first. FastAPI registers routes at startup, so duplicates caused entire route blocks to be missing.
- **CORS is always the culprit** when a frontend can reach an API in Thunder Client but not from the browser. The browser enforces CORS, Thunder Client doesn't.
- **Next.js dynamic routing** is as simple as naming a folder `[id]` — the bracket syntax tells Next.js this segment is a variable, not a literal path.
- **Optimistic UI updates** — updating React state immediately on user action (before the server responds) makes the UI feel instant. If the server fails, you roll back. For a dashboard tool, this is the right default.

---

## Screenshots to Add

| Filename | What to screenshot |
|---|---|
| `order-detail-page.png` | The full order detail page with all sections visible |
| `kanban-status-updated.png` | Kanban board with orders spread across multiple columns |

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*