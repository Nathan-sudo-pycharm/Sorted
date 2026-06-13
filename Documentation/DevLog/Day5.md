# Sorted — Developer Log
## Day 5: Menu Manager, Customer View, UI Redesign & Font System
**Nathan Ivor Sequeira | June 2026**

---

## What I Was Trying to Build

Three things today:
1. **UI redesign** — bring the dashboard closer to the v0 design with a stats bar, better card layout, and horizontal scroll
2. **Menu Manager** — let the baker set up their menu items with names, prices, units, and aliases
3. **Customer View** — a grid of all customers with order counts, clickable through to a full order history

---

## Part 1 — UI Redesign

### Stats Bar

Created `components/StatsBar.tsx` — a four-card bar at the top of the dashboard showing:
- **Orders Today** — filters orders by today's date using `created_at.split('T')[0]`
- **Revenue Today** — sums `total_amount` for today's confirmed orders
- **Pending Deliveries** — counts orders in `confirmed`, `in_progress`, or `ready` status
- **Open Follow-ups** — counts `new` orders where `is_price_query` is true

No extra API calls — it derives all four numbers from the same `orders` array already fetched for the Kanban board. Automatically updates when Realtime fires a new order.

<img src="assets/stats-bar.png" alt="Stats bar showing Orders Today, Revenue Today, Pending Deliveries, Open Follow-ups" width="600"/>

### Kanban board layout

Switched from a fixed `grid-cols-5` to `flex gap-6 min-w-max` with `overflow-x-auto` on the parent. This means:
- Each column is a fixed `w-80` width
- The board scrolls horizontally on smaller screens instead of squashing
- Columns never overlap or get too narrow

### Column headers

Redesigned to match v0 style — each column has a bottom border underline. The **New** column gets a special blue glow effect using an absolutely positioned blurred div:

```tsx
{isNew && (
  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 blur-md opacity-50" />
)}
```

### Order cards

Redesigned `OrderCard.tsx` — now shows item name in bold, quantity on its own line, delivery date, and a colored status badge at the bottom. Multiple items show "+N more items" instead of listing everything.

### Navigation

Added **Orders / Customers / Menu** nav links to the header in `page.tsx`. Active page has a white underline, inactive links are slate-400 with hover effect.

<img src="assets/dashboard-redesign.png" alt="Redesigned dashboard with stats bar and new card style" width="600"/>

---

## Part 2 — Menu Manager

### Backend

Added three endpoints to `main.py`:

- `GET /menu` — returns all menu items ordered by creation date
- `POST /menu` — creates a new menu item with name, aliases, price, unit
- `PATCH /menu/{item_id}` — updates any allowed field, used for toggling active/inactive

### Frontend — `app/menu/page.tsx`

The menu page has two sections:

**Add item form** — inputs for name, price, unit (dropdown), and aliases (comma-separated string that gets split into an array before sending to the API).

**Item list** — each item shows name, price per unit, and alias tags as small rounded pills. An Active/Inactive toggle button on each card lets the baker mark items as unavailable without deleting them. Inactive items are shown at 50% opacity.

<img src="assets/menu-page.png" alt="Menu manager showing items with aliases and active toggle" width="600"/>

---

## Part 3 — Customer View

### Backend

Added two endpoints:

- `GET /customers` — returns all customers ordered by creation date
- `GET /customers/{customer_id}` — returns customer details + full order history

### Frontend — `app/customers/page.tsx`

Switched from a list layout to a `grid-cols-4` grid so the page fits many customers without excessive scrolling. Each card shows phone number, order count, and last order date. Clicking a card navigates to the customer detail page.

### Frontend — `app/customers/[id]/page.tsx`

Customer detail page shows:
- Phone number, total orders, first seen date, last order date
- Baker notes (in amber if present)
- Full order history — each order is clickable and navigates to the order detail page

<img src="assets/customers-grid.png" alt="Customer grid showing 4 customers per row" width="600"/>

<img src="assets/customer-detail.png" alt="Customer detail page showing order history" width="600"/>

---

## Part 4 — Order Count Trigger

Noticed that all customers were showing `0 orders` even though they had orders in the `orders` table. The `total_orders` column on `customers` wasn't being updated automatically.

Fixed with a Postgres trigger:

```sql
CREATE OR REPLACE FUNCTION update_customer_order_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET 
    total_orders = (
      SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id
    ),
    last_order_at = NOW()
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_insert
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_order_count();
```

Now every time an order is inserted, Postgres automatically updates that customer's `total_orders` count and `last_order_at`. No application code needed.

---

## Part 5 — Font System

Added Google Fonts via Next.js's built-in font system — no external CDN, fonts are self-hosted automatically.

- **Inter** — body text, data, phone numbers, timestamps. Clean and highly readable at small sizes.
- **Sora** — headings, page titles, column headers. Slightly more personality than Inter.

Both fonts are loaded as CSS variables in `layout.tsx` and applied via Tailwind utility classes (`font-inter`, `font-sora`). Tailwind v4 uses CSS-based configuration via `globals.css` instead of `tailwind.config.ts`.

---

## Current Project Structure

```
sorted/
├── backend/
│   ├── db/client.py
│   ├── services/parser.py
│   └── main.py               # Now has menu + customer endpoints
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Kanban board with stats bar + nav
│   │   ├── orders/[id]/       # Order detail — split layout
│   │   ├── customers/         # Customer grid
│   │   ├── customers/[id]/    # Customer detail + order history
│   │   └── menu/              # Menu manager
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── KanbanColumn.tsx   # Blue glow on New column
│   │   ├── OrderCard.tsx      # Redesigned card
│   │   └── StatsBar.tsx       # Stats bar
│   └── lib/
│       ├── supabase.ts
│       ├── types.ts
│       └── utils.ts
```

---

## What's Working

- Stats bar shows live counts derived from real order data ✅
- Kanban board horizontal scroll with v0-style column headers ✅
- Menu manager — add items with aliases, toggle active/inactive ✅
- Customer grid — 4 per row, clickable through to detail ✅
- Customer detail — order history, clickable through to order detail ✅
- Postgres trigger auto-updates `total_orders` on every insert ✅
- Inter + Sora font system applied across all pages ✅
- Navigation header links between Orders, Customers, Menu ✅


## Key Lessons

- **Postgres triggers** are the right tool for derived data like order counts — keeping it in the database means it's always consistent regardless of which service inserts the data.
- **Tailwind v4 uses CSS config** — no `tailwind.config.ts`. Custom values go in `globals.css` under `@theme`.
- **Next.js built-in font system** is the cleanest way to use Google Fonts — no `<link>` tags, no layout shift, fonts are self-hosted automatically at build time.
- **Grid layouts beat lists** for dense data like customer cards — `grid-cols-4` fits 4x more information in the same vertical space.
- **v0 is best used as visual inspiration**, not code to copy directly. Take the layout ideas and styling decisions, implement them on top of your existing data pipeline.

---

## Screenshots to Add

| Filename | What to screenshot |
|---|---|
| `stats-bar.png` | Stats bar showing all 4 metrics |
| `dashboard-redesign.png` | Full dashboard with new card style and nav |
| `menu-page.png` | Menu page with items and alias tags |
| `customers-grid.png` | Customer grid showing 4 per row |
| `customer-detail.png` | Customer detail page with order history |

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*