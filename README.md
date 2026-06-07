# Sorted 
### WhatsApp Order Manager for Home Bakers & Cloud Kitchens

> *Before Sorted, orders are chaos. After, they're sorted.*

---

## What is Sorted?

Sorted is a free, open-source order management system built specifically for home bakers and small cloud kitchens in India.

When a customer sends a WhatsApp message like:

> *"hey can I get a 1kg black forest for Sunday, with fondant please, and also like 12 cupcakes — how much will it be?"*

Sorted automatically extracts the order details, creates a structured record, sends the customer a confirmation, and adds it to a live dashboard. No manual data entry. No missed orders.

---

## The Problem

India has over 5 million home bakers and cloud kitchen operators. Almost all of them run their entire business through WhatsApp — and it's painful:

- Orders get buried in chat history
- Quantities get confused, delivery dates get missed
- There's no order queue, no follow-up system, no payment tracker
- Existing WhatsApp CRM tools are generic inbox managers — none of them understand food orders

Sorted is built specifically for this problem, for this user.

---

## Who is this for?

| User | Pain point Sorted solves |
|---|---|
| 🎂 Home baker | Tracks 30+ cake and cupcake orders manually in WhatsApp |
| 🍱 Cloud kitchen | No order queue, misses delivery slots |
| 🥡 Tiffin service | Daily subscription orders + last-minute changes |
| 🍮 Mithai / sweets maker | Bulk festival orders with advance payments |

---

## How it works

```
Customer sends WhatsApp message
        ↓
FastAPI backend receives it via Meta Cloud API webhook
        ↓
AI (Groq + Llama 3.1) parses the message into a structured order
        ↓
Auto-confirmation sent back to the customer
        ↓
Order appears live on the baker's dashboard (Next.js)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python + FastAPI |
| AI / Order parsing | Groq API (Llama 3.1 8B) |
| Database | Supabase (PostgreSQL) |
| Realtime updates | Supabase Realtime |
| Frontend | Next.js 15 + Tailwind CSS |
| WhatsApp | Meta Business Cloud API |
| Hosting | Render (backend) + Vercel (frontend) |

**Total cost to run: ₹0** — everything runs on free tiers.

---

## Why I'm building this

I'm building Sorted because this is a real, daily, painful problem for a huge and underserved segment — and no open-source solution exists for it. Every tool I found was either a generic CRM, too expensive, or not built for India's mixed-language WhatsApp culture (English + Kannada + Hindi in the same message).

This is also a learning project. I'm building it step by step, documenting the process, and keeping everything open source so others can learn from it, use it, or contribute to it.

---

## Licence

MIT — free to use, modify, and self-host. See [LICENSE](./LICENSE).

---

*Built by [Nathan Sequeira](https://github.com/nathansequeira) · Bangalore, India · 2026*
