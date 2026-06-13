# Sorted 🍰
### WhatsApp Order Manager for Home Bakers & Cloud Kitchens

> *Before Sorted, orders are chaos. After, they're sorted.*

---

## What is Sorted?

Sorted is a free, open-source order management system built specifically for home bakers and small cloud kitchens in India.

When a customer sends a WhatsApp message like:

> *"hey can I get a 1kg black forest for Sunday, with fondant please — how much will it be?"*

Sorted automatically extracts the order details, creates a structured record, sends the customer a confirmation, and adds it to a live dashboard. No manual data entry. No missed orders.

---

## Features

- 🤖 **AI order parsing** — extracts items, quantities, customisations, and delivery dates from messy WhatsApp messages
- 📋 **Live Kanban board** — orders move through New → Confirmed → In Progress → Ready → Delivered in real time
- 💬 **Reply from dashboard** — send replies directly without switching apps
- 👥 **Customer profiles** — full order history per customer, notes for allergies and preferences
- 🍰 **Menu manager** — set up your menu with aliases so the AI can match "BF cake" to "Black Forest Cake"
- 📊 **Stats bar** — orders today, revenue, pending deliveries, open follow-ups at a glance
- 🔄 **Real-time updates** — new orders appear instantly via Supabase Realtime, no page refresh
- 🌐 **Mixed language support** — handles English, Hinglish, and Kannada-English messages

---

## Tech Stack

| Layer | Technology | Status |
|---|---|---|
| Backend | Python 3.11 + FastAPI | ✅ Working |
| AI / Order parsing | Groq API (Llama 3.1 8B) | ✅ Working |
| Database | Supabase (PostgreSQL) | ✅ Working |
| Realtime | Supabase Realtime | ✅ Working |
| Frontend | Next.js 15 + Tailwind CSS v4 | ✅ Working |
| WhatsApp | Meta Business Cloud API | 🚧 In progress |

> **Note:** WhatsApp Cloud API integration is in progress. Currently messages can be tested by sending POST requests to `/webhook` via Thunder Client or any API client. Full WhatsApp integration coming in v1.1.

**Total cost to run: ₹0** — everything runs on free tiers.

---

## Setup Guide

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Groq](https://console.groq.com) account (free)

### 1. Clone the repo

```bash
git clone https://github.com/Nathan-sudo-pycharm/sorted.git
cd sorted
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

Copy the env file and fill in your keys:

```bash
cp .env.example .env
```

```bash
# backend/.env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
VERIFY_TOKEN=any_random_string
```

Run the backend:
```bash
uvicorn main:app --reload
```

### 3. Database setup

Go to your Supabase project → SQL Editor and run the migration file:

```
supabase/migrations/001_initial.sql
```

### 4. Frontend setup

```bash
cd frontend
npm install
```

Copy the env file:
```bash
cp .env.local.example .env.local
```

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```

### 5. Open the dashboard

```
http://localhost:3000
```

### 6. Test with a mock message

Send a POST request to `http://localhost:8000/webhook` with this body:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919876543210",
          "text": {
            "body": "hi I need a 1kg black forest cake for Sunday with fondant"
          },
          "type": "text"
        }]
      }
    }]
  }]
}
```

The order will appear on your dashboard instantly.

---

## One-command setup (Docker)

```bash
git clone https://github.com/Nathan-sudo-pycharm/sorted.git
cd sorted
cp backend/.env.example backend/.env  # fill in your keys
docker-compose up
```

---

## Project Structure

```
sorted/
├── backend/
│   ├── db/              # Supabase client
│   ├── services/        # Order parser (Groq)
│   ├── main.py          # FastAPI app + all endpoints
│   └── requirements.txt
├── frontend/
│   ├── app/             # Next.js pages
│   ├── components/      # UI components
│   └── lib/             # Supabase client, types
├── supabase/
│   └── migrations/      # SQL migration files
├── docker-compose.yml
└── README.md
```

---

## Roadmap

| Feature | Status |
|---|---|
| AI order parsing | ✅ Done |
| Live Kanban dashboard | ✅ Done |
| Order detail + reply | ✅ Done |
| Menu manager | ✅ Done |
| Customer profiles | ✅ Done |

---

## Contributing

Contributions are welcome! Ideas for community contributions:
- Language prompt packs (Tamil, Telugu, Hindi regions)
- Menu templates for bakeries, tiffin services, mithai shops
- WhatsApp Cloud API integration
- Payment integrations

---

## Licence

MIT — free to use, modify, and self-host.

---

*Built by [Nathan Sequeira](https://github.com/Nathan-sudo-pycharm) · Mangalore, India · 2026*