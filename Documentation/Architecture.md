# Sorted — Architecture Document
**Nathan Ivor Sequeira | June 2026**

---

## Overview

Sorted is a two-service architecture: a **FastAPI backend** handling all business logic, webhook processing, and LLM calls; and a **Next.js frontend** serving the baker's dashboard. Both services connect to **Supabase** as the single source of truth for data.

```
┌─────────────────────────────────────────────────────────────┐
│                        SORTED SYSTEM                         │
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │   WhatsApp   │    │   FastAPI    │    │  Next.js    │  │
│   │  (Customer)  │───▶│   Backend   │    │  Dashboard  │  │
│   └──────────────┘    └──────┬───────┘    └──────┬──────┘  │
│                              │                    │         │
│                              ▼                    ▼         │
│                       ┌──────────────────────────────────┐  │
│                       │           Supabase               │  │
│                       │   PostgreSQL + Realtime + Auth   │  │
│                       └──────────────────────────────────┘  │
│                                                             │
│                              │                              │
│                              ▼                              │
│                       ┌──────────────┐                      │
│                       │   Groq API   │                      │
│                       │ Llama 3.1 8B │                      │
│                       └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Inbound Message (Customer → Dashboard)

```
Customer sends WhatsApp message
        │
        │  POST /webhook  (Meta Cloud API)
        ▼
FastAPI Backend
        ├── 1. Validate HMAC-SHA256 signature
        ├── 2. Extract phone number + message text from payload
        ├── 3. Upsert customer in Supabase (create if new)
        ├── 4. Save raw message to messages table
        ├── 5. Call Groq API (Llama 3.1 8B)
        │       └── Returns structured JSON order
        ├── 6. Save parsed order to orders table
        │
        └── Supabase Realtime fires INSERT event
                │
                ▼
        Next.js Dashboard
                └── New order card appears instantly
```

### Baker Action (Dashboard → Customer)

```
Baker clicks "Send Reply" on dashboard
        │
        │  POST /orders/{id}/reply
        ▼
FastAPI Backend
        ├── Save outbound message to messages table
        └── (WhatsApp send — coming in v1.1)
```

---

## Backend Architecture

### `main.py` — Route Registry

All API endpoints live in `main.py`. FastAPI handles routing, request parsing, and response serialisation automatically.

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/webhook` | Meta verification handshake |
| POST | `/webhook` | Receive inbound WhatsApp messages |
| GET | `/orders/{id}` | Fetch single order with messages |
| PATCH | `/orders/{id}` | Update status, amount, notes |
| POST | `/orders/{id}/reply` | Save outbound reply |
| GET | `/menu` | List all menu items |
| POST | `/menu` | Add a menu item |
| PATCH | `/menu/{id}` | Update item price or availability |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Customer detail + order history |

### `services/parser.py` — The Core Feature

The order parser is what makes Sorted different from every other WhatsApp tool. It takes a raw messy message and returns structured JSON.

```
Input:  "anna 1kg black forest bekku Sunday ge, fondant haaki, price eshtu?"

Output: {
  "is_order": true,
  "items": [{"name": "Black Forest Cake", "qty": 1, "unit": "kg", "customisation": "fondant"}],
  "delivery_date": "2026-06-15",
  "delivery_date_confidence": "high",
  "is_price_query": true,
  "missing_info": [],
  "suggested_reply": "Hi! Got your order for 1kg Black Forest with fondant for Sunday..."
}
```

**How it works:**
1. Today's date is injected into the system prompt so the model can resolve "Sunday" to a real date
2. The baker's menu items and aliases are available for item matching
3. Temperature is set to `0.1` — low randomness, consistent structured output
4. Response is parsed with `json.loads()` — if it fails, an error object is returned

### `db/client.py` — Supabase Singleton

A single Supabase client instance is created at startup and reused across all requests. Uses the `service_role` key which bypasses RLS — appropriate for server-side operations.

---

## Frontend Architecture

### Page Structure (Next.js App Router)

```
app/
├── page.tsx                    # / — Kanban board (home)
├── orders/
│   └── [id]/
│       └── page.tsx            # /orders/:id — Order detail
├── customers/
│   ├── page.tsx                # /customers — Customer grid
│   └── [id]/
│       └── page.tsx            # /customers/:id — Customer detail
└── menu/
    └── page.tsx                # /menu — Menu manager
```

### Component Hierarchy

```
page.tsx (Home)
├── StatsBar
│   └── Derived from orders array — no extra fetch
└── KanbanColumn (×5)
    └── OrderCard (×N)

orders/[id]/page.tsx
├── Left panel
│   ├── Original message
│   ├── Items list
│   ├── Suggested reply
│   └── Status updater
└── Right panel
    ├── Conversation history
    └── ReplyBox

customers/page.tsx
└── Customer cards grid (4 per row)

customers/[id]/page.tsx
├── Customer info card
└── Order history list
    └── Order cards (clickable → order detail)

menu/page.tsx
├── Add item form
└── Menu items list
    └── Item cards with alias tags + active toggle
```

### Data Flow

```
Supabase
    │
    ├── Initial fetch (useEffect on mount)
    │       └── supabase.from('orders').select('*')
    │
    └── Realtime subscription
            └── supabase.channel('realtime-orders')
                    .on('postgres_changes', INSERT → orders)
                    └── setOrders(prev => [newOrder, ...prev])
```

No Redux, no Zustand, no complex state management. React's built-in `useState` + Supabase Realtime handles everything.

---

## Database Schema

### Entity Relationship

```
customers
    │
    ├──< messages (customer_id)
    │
    └──< orders (customer_id)
            │
            └──< messages (order_id)

menu_items (standalone — no FK relationships yet)
```

### Tables

**`customers`**
```sql
id            UUID PRIMARY KEY
phone_number  TEXT UNIQUE
display_name  TEXT
total_orders  INTEGER          -- auto-updated by trigger
last_order_at TIMESTAMPTZ      -- auto-updated by trigger
notes         TEXT
created_at    TIMESTAMPTZ
```

**`orders`**
```sql
id               UUID PRIMARY KEY
customer_id      UUID → customers.id
raw_message      TEXT
items            JSONB           -- array of {name, qty, unit, customisation}
delivery_date    DATE
delivery_type    TEXT
total_amount     NUMERIC
advance_paid     NUMERIC
status           TEXT            -- new|confirmed|in_progress|ready|delivered|cancelled
confirmation_sent BOOLEAN
is_price_query   BOOLEAN
suggested_reply  TEXT
notes            TEXT
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

**`messages`**
```sql
id            UUID PRIMARY KEY
customer_id   UUID → customers.id
order_id      UUID → orders.id (nullable)
wa_message_id TEXT UNIQUE
direction     TEXT              -- inbound | outbound
body          TEXT
created_at    TIMESTAMPTZ
```

**`menu_items`**
```sql
id          UUID PRIMARY KEY
name        TEXT
aliases     TEXT[]              -- e.g. ["BF cake", "black forest", "chocolate wala"]
base_price  NUMERIC
unit        TEXT                -- kg | piece | dozen | box
active      BOOLEAN
created_at  TIMESTAMPTZ
```

### Trigger

```sql
-- Auto-updates total_orders and last_order_at on every INSERT to orders
CREATE TRIGGER on_order_insert
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_order_count();
```

---

## Technology Decisions

### Why FastAPI over Django/Flask?

FastAPI is async-native, has automatic API documentation at `/docs`, and uses Python type hints for request/response validation. For a webhook-heavy API with background LLM calls, it's the right choice. Django is too heavy; Flask lacks async support.

### Why Supabase over raw PostgreSQL?

Supabase gives us PostgreSQL + Realtime + Auth + a REST API out of the box. The Realtime feature (live order updates without WebSockets code) alone justifies it. At the scale of a home baker (30–60 orders/day), the free tier is more than enough.

### Why Groq + Llama 3.1 8B over GPT-4?

Llama 3.1 8B on Groq responds in under 500ms — critical because the webhook must respond to Meta in under 1 second. GPT-4 is slower and costs money. For constrained order parsing (not open-ended generation), 8B parameters is sufficient. Groq's free tier allows ~14,400 requests/day.

### Why Next.js 15 over React SPA?

Next.js App Router gives us file-based routing (no React Router config), server components where useful, and seamless Vercel deployment. The `[id]` folder convention for dynamic routes is clean and intuitive.

### Why No Message Queue (Kafka/Celery)?

A home baker processes 30–60 orders/day. FastAPI's built-in `BackgroundTasks` handles async LLM calls without needing a separate queue. Kafka and Celery would be significant operational overhead for no benefit at this scale.

---

## Security

### HMAC-SHA256 Webhook Validation
Every POST from Meta is signed with a secret key. The backend validates the signature before processing any payload. This prevents fake messages from being injected.

### Row Level Security (RLS)
All Supabase tables have RLS enabled. The backend uses `service_role` key (bypasses RLS) — appropriate for server-side. The frontend uses the `publishable` key — restricted by RLS policies to read-only access.

### Environment Variables
All secrets live in `.env` files that are never committed to git (listed in `.gitignore`). `.env.example` files document what's needed without exposing values.

---

## Deployment

### Development
```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

### Docker (Recommended)
```bash
docker compose up --build
```

### Production (Planned)
- Backend → Render.com (free tier, supports FastAPI)
- Frontend → Vercel (free tier, native Next.js support)
- Database → Supabase (already cloud-hosted)

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*