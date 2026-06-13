# Sorted — Developer Log
## Day 6: Docker, SQL Migrations, Final README & v1.0 Release
**Nathan Ivor Sequeira | June 2026**

---

## What I Was Trying to Build

The final week of Sorted. The goal was to go from "works on my machine" to "anyone can clone and run this in one command." That means:

1. Docker containerisation for both backend and frontend
2. A SQL migration file so anyone can set up the database from scratch
3. `.env.example` files so contributors know exactly what keys they need
4. A final README that's honest, complete, and useful
5. GitHub v1.0.0 release tag

---

## Part 1 — Docker Setup

### What Docker does

Without Docker, someone cloning Sorted needs to:
- Install Python 3.11
- Create a virtual environment
- Install all Python packages
- Install Node.js
- Install all npm packages
- Start two separate terminals
- Run uvicorn and npm dev separately

With Docker, they just run:
```bash
docker compose up --build
```

Docker handles everything else.

### Files created

**`docker-compose.yml`** — defines two services: `backend` (FastAPI) and `frontend` (Next.js). They share a network so they can talk to each other. Frontend depends on backend so they start in the right order.

**`backend/Dockerfile`** — starts from `python:3.11-slim`, installs requirements, copies code, runs uvicorn.

**`frontend/Dockerfile`** — starts from `node:20-slim`, installs npm packages, copies code, runs next dev.

### Challenge — missing package in Docker

The first Docker build failed with:
```
Module not found: Can't resolve '@supabase/supabase-js'
```

The package was installed locally but wasn't properly saved in `package.json`. Fixed by running `npm install @supabase/supabase-js` locally first to update `package.json`, then rebuilding with `docker compose up --build`.

### Challenge — virtualization not detected

Docker Desktop initially failed to start because Windows virtualization wasn't enabled. Fixed by installing WSL2 via:
```bash
wsl --install
```

After a restart, Docker Desktop launched correctly.

---

## Part 2 — requirements.txt

Generated the backend requirements file:
```bash
pip freeze > requirements.txt
```

This captures every Python package and its exact version. Anyone cloning the repo can now run:
```bash
pip install -r requirements.txt
```

And get the exact same environment.

---

## Part 3 — SQL Migration File

Created `supabase/migrations/001_initial.sql` — a single SQL file that creates all four tables, all RLS policies, and the order count trigger from scratch.

This means a new contributor doesn't need to manually run SQL commands one by one — they just paste the migration file into Supabase SQL Editor and everything is set up.

Tables created:
- `customers` — with trigger to auto-update `total_orders`
- `messages` — with `order_id` foreign key
- `orders` — with status check constraint
- `menu_items` — with aliases array

---

## Part 4 — Environment Files

Created `backend/.env.example` and `frontend/.env.local.example` — template files with placeholder values that show exactly what keys are needed without exposing real credentials.

These are committed to the repo. The actual `.env` files are in `.gitignore` and never committed.

---

## Part 5 — Final README

Rewrote the README to be honest about what's working and what isn't. Key decisions:

- Removed Meta Developer Account from prerequisites — WhatsApp integration isn't done yet
- Added a mock message test step so people can test without WhatsApp
- Added a Roadmap table showing v1.0, v1.1, v1.2 plans

Honesty in a README builds trust with contributors.

---

## Part 6 — v1.0.0 Release

Tagged the release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Then created the GitHub release with a description of what's included and what's coming in v1.1.

---

## Key Lessons

- **`pip freeze > requirements.txt`** captures exact package versions — critical for reproducible builds
- **Docker build cache** means subsequent builds are much faster than the first — only changed layers rebuild
- **`.env.example` files** are the open source standard for communicating required environment variables without exposing secrets
- **SQL migration files** are the right way to version database schemas — one file, run once, database is ready
- **Honest READMEs** build more trust than overselling. Marking WhatsApp as `🚧 In progress` is better than pretending it works.
- **GitHub releases** with tags give contributors a stable reference point — `v1.0.0` will always point to this exact commit

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*