# Sorted — Developer Log
## Day 3: Groq Order Parser + Next.js Dashboard + Supabase Realtime
**Nathan Ivor Sequeira | June 2026**

---

## What I Was Trying to Build

Two big things today:
1. **The order parser** — the core feature of Sorted. Take a raw, messy WhatsApp message and extract a structured order using Groq + Llama 3.1.
2. **The dashboard** — a live Kanban board in Next.js that shows orders in real-time as they come in.

---

## Part 1 — The Order Parser

### What I built

Created `backend/services/parser.py` — a function that takes a raw message string and returns a structured JSON order.

The parser is powered by **Groq API** running **Llama 3.1 8B Instant**. I send the message to the model with a carefully written system prompt that tells it exactly what to extract: item name, quantity, unit, customisation, delivery date, whether it's a price query, and a suggested reply.

The model responds with a JSON object. I parse it with `json.loads()` and return it to the webhook handler.

One key thing I learned — the system prompt needs to include today's date so the model can resolve relative dates like "Sunday" or "tomorrow" to actual `YYYY-MM-DD` values. Without this, the model was guessing dates from 2024.

```python
prompt = SYSTEM_PROMPT.format(today=date.today().isoformat())
```

### Hooking the parser into the webhook

Updated `main.py` to call `parse_order()` after saving the message. If `is_order` is true, the parsed order gets saved to the `orders` table in Supabase with all extracted fields.

### Testing the parser

Tested 6 different message types via Thunder Client:

<img src="assets/parser-terminal-output.png" alt="Terminal showing parser output for multiple test messages" width="600"/>

| Test | Input | Result |
|---|---|---|
| Standard English | "1kg black forest for Sunday with fondant" | ✅ Pass |
| Hinglish | "bhaiya ek red velvet cake chaiye sunday ke lie" | ✅ Pass |
| Price query | "how much for a 2kg butterscotch cake?" | ⚠️ Partial |
| Vague question | "hi do you make sugar free cakes?" | ✅ Pass |
| Off-topic | "I have a crush on your waitress" | ✅ Pass 😂 |
| Kannada-English | "anna 1kg black forest bekku Sunday ge" | ⚠️ Partial |

Full test details in `PARSER_TESTS.md`.

---

## Part 2 — The Next.js Dashboard

### Setting up the frontend

Created a new Next.js 15 project inside `frontend/` with TypeScript, Tailwind CSS v4, and App Router.

Installed and configured:
- **shadcn/ui** — base components (Card, Badge, Button, Dialog, Input, Skeleton etc.)
- **Supabase JS client** — to fetch orders and subscribe to Realtime
- **Framer Motion** — for animations later
- **lucide-react** — for icons

### The Kanban board

Built three components:

**`lib/types.ts`** — TypeScript types for `Order`, `OrderItem`, `OrderStatus`. This means the entire frontend is type-safe — TypeScript will catch mistakes before they reach the browser.

**`components/OrderCard.tsx`** — a single order card showing customer ID, items with customisations, delivery date, status badge, and price query flag.

**`components/KanbanColumn.tsx`** — a single Kanban column. Takes a status, label, and list of orders as props. Renders skeletons while loading, a dashed empty state when no orders, or the order cards.

**`app/page.tsx`** — the main page. Fetches all orders from Supabase on load, then subscribes to Realtime for live updates. Passes orders filtered by status to each `KanbanColumn`.


<img src="assets/dashboard-with-orders.png" alt="Kanban board showing real orders from Supabase" width="600"/>

### Supabase Realtime

This was the trickiest part. The first implementation required a hard refresh to see new orders. Two fixes were needed:

1. Enable the `orders` table in Supabase's Realtime publication (via Database → Publications → supabase_realtime)
2. Add a status callback to the channel subscription to confirm it was actually connected:

```typescript
.subscribe((status) => {
  console.log('📡 Realtime status:', status)
})
```

Once the console showed `SUBSCRIBED`, new orders started appearing instantly without any refresh.


### Refactor — KanbanColumn as its own component

After getting the board working, I refactored the column rendering out of `page.tsx` into its own `KanbanColumn.tsx` component. This makes `page.tsx` much cleaner — it only handles data fetching and state, and delegates all rendering to components.

**Before:** `page.tsx` had the column JSX inline  
**After:** `page.tsx` just maps over columns and calls `<KanbanColumn />` for each

---

## Current Project Structure

```
sorted/
├── backend/
│   ├── db/
│   │   └── client.py              # Supabase client singleton
│   ├── services/
│   │   └── parser.py              # Groq order parser — core logic
│   ├── main.py                    # FastAPI webhook handlers
│   └── .env
│
├── frontend/
│   ├── app/
│   │   └── page.tsx               # Kanban board — fetches + renders orders
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── KanbanColumn.tsx       # Single Kanban column
│   │   └── OrderCard.tsx          # Single order card
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── types.ts               # TypeScript types
│   │   └── utils.ts               # cn() utility
│   └── .env.local
│
├── DEVLOG.md
├── DEVLOG_DAY3.md
├── PARSER_TESTS.md
└── README.md
```

---

## What's Working

- Groq + Llama 3.1 parses raw WhatsApp messages into structured JSON ✅
- Parser handles English, Hinglish, and partial Kannada ✅
- Parsed orders are saved to Supabase `orders` table ✅
- Next.js Kanban board fetches and displays all orders ✅
- New orders appear in real-time via Supabase Realtime — no page refresh needed ✅
- Components are properly separated — `KanbanColumn`, `OrderCard`, `page.tsx` each have one job ✅

## What's Next

**Week 4 — Order Detail + Reply**
- Click an order card to open a detail view
- See the full conversation history
- Type and send a reply directly from the dashboard
- Mark advance payment received
- One-click status updates

---

## Key Lessons

- Always inject the current date into LLM prompts when date parsing is involved — otherwise the model will guess dates from its training data.
- LLMs handle mixed-language input surprisingly well, but language-specific action words (Kannada verbs like `bekku`, `haaki`) can confuse item extraction. These need explicit examples in the prompt.
- Supabase Realtime requires two things: the table must be added to the `supabase_realtime` publication, AND the channel subscription needs a status callback to confirm it connected. Without both, it silently fails.
- React component separation isn't just about aesthetics — separating data logic (`page.tsx`) from rendering (`KanbanColumn`, `OrderCard`) makes each piece easier to debug and extend.

---

## Screenshots to Add

Save these screenshots and place them in the `assets/` folder:

| Filename | What to screenshot |
|---|---|
| `parser-terminal-output.png` | Terminal showing parser output — the lines with 📱 From, 💬 Message, 🧠 Parsed, ✅ Order saved |
| `dashboard-empty.png` | The Kanban board on first load before RLS policy was added — all columns showing "No orders" |
| `dashboard-with-orders.png` | The Kanban board showing the 3 real orders in the New column |
| `realtime-working.png` | The dashboard after a new order appeared without a page refresh |

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*