# Sorted 
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

## Documentation

| Doc | Description |
|---|---|
| [Architecture](./Documentation/ARCHITECTURE.md) | System design, data flow, technology decisions |
| [Commands Reference](./Documentation/COMMANDS.md) | Every command used in this project, explained for beginners |
| [Dev Log — Day 1 & 2](./Documentation/DevLog/Day1_and_2.md) | Webhook setup, Supabase integration |
| [Dev Log — Day 3](./Documentation/DevLog/Day3.md) | Groq order parser, Next.js dashboard, Realtime |
| [Dev Log — Day 4](./Documentation/DevLog/Day4.md) | Order detail page, status updates, reply system |
| [Dev Log — Day 5](./Documentation/DevLog/Day5.md) | Menu manager, customer view, UI redesign, fonts |
| [Dev Log — Day 6](./Documentation/DevLog/Day6.md) | Docker, migrations, README, v1.0 release |
| [Parser Test Log](./Documentation/tests/Parser_test.md) | 6 test cases for the AI order parser |

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

## Quick Start

### One-command setup (Docker)

```bash
git clone https://github.com/Nathan-sudo-pycharm/sorted.git
cd sorted
cp backend/.env.example backend/.env      # fill in your keys
cp frontend/.env.local.example frontend/.env.local  # fill in your keys
docker compose up --build
```

Open `http://localhost:3000` — dashboard is live.

### Manual setup

See the full manual setup guide below.

---

## Manual Setup Guide

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
cp .env.example .env     # fill in your keys
uvicorn main:app --reload
```

### 3. Database setup

Go to your Supabase project → SQL Editor and run:
```
supabase/migrations/001_initial.sql
```

### 4. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev
```

### 5. Open the dashboard

```
http://localhost:3000
```

### 6. Test with a mock message

Send a POST request to `http://localhost:8000/webhook`:

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

## Project Structure

```
sorted/
├── backend/
│   ├── db/                    # Supabase client
│   ├── services/              # Groq order parser
│   ├── main.py                # FastAPI app + all endpoints
│   ├── .env.example           # Environment variable template
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── app/                   # Next.js pages
│   ├── components/            # UI components
│   ├── lib/                   # Supabase client, types, utils
│   └── .env.local.example     # Frontend env template
├── supabase/
│   └── migrations/            # SQL migration files
├── Documentation/             # All project docs and devlogs
├── docker-compose.yml
└── README.md
```

---

## Roadmap

| Feature | Status |
|---|---|
| AI order parsing | ✅ v1.0 |
| Live Kanban dashboard | ✅ v1.0 |
| Order detail + reply | ✅ v1.0 |
| Menu manager | ✅ v1.0 |
| Customer profiles | ✅ v1.0 |
| Docker one-command setup | ✅ v1.0 |
| WhatsApp Cloud API integration | 🚧 v1.1 |
| Payment tracking (Razorpay) | 🚧 v1.2 |
| Follow-up queue | 🚧 v1.2 |
| Mobile app | 🚧 Future |

---

## Contributing

Contributions are welcome! Ideas for community contributions:
- WhatsApp Cloud API integration
- Language prompt packs (Tamil, Telugu, Hindi regions)
- Menu templates for bakeries, tiffin services, mithai shops
- Payment integrations (Razorpay, UPI)

---

## Licence

MIT — free to use, modify, and self-host.

---

*Built by [Nathan Sequeira](https://github.com/Nathan-sudo-pycharm) · Manglore, India · 2026*