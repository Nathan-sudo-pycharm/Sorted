# Sorted — Commands Reference
> A complete list of every command used in this project, explained for beginners.

---

## Python & Virtual Environment

| Command | What it does |
|---|---|
| `python --version` | Check which Python version is installed |
| `python -m venv venv` | Create a virtual environment called `venv` |
| `.\venv\Scripts\activate` | Activate the virtual environment (Windows) |
| `source venv/bin/activate` | Activate the virtual environment (Mac/Linux) |
| `python -m pip install fastapi uvicorn` | Install packages using pip |
| `pip freeze > requirements.txt` | Save all installed packages to a file |
| `pip install -r requirements.txt` | Install all packages from requirements.txt |

> **What is a virtual environment?**
> A virtual environment is an isolated Python installation just for your project. It means packages you install for Sorted don't interfere with other Python projects on your machine.

---

## Running the Backend

| Command | What it does |
|---|---|
| `uvicorn main:app --reload` | Start the FastAPI server with auto-reload on file changes |
| `uvicorn main:app --host 0.0.0.0 --port 8000` | Start FastAPI accessible from any network (used in Docker) |
| `python test_parser.py` | Run the order parser test script |

> **What is uvicorn?**
> Uvicorn is the server that runs your FastAPI app. `--reload` means it automatically restarts when you save a file — very useful during development.

---

## Running the Frontend

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm install` | Install all packages listed in package.json |
| `npm install @supabase/supabase-js` | Install a specific package and save it to package.json |
| `npx create-next-app@latest frontend` | Create a new Next.js project in a folder called frontend |
| `npx shadcn@latest init` | Initialise shadcn/ui in your project |
| `npx shadcn@latest add card badge button` | Add specific shadcn components |

---

## Git Commands

| Command | What it does |
|---|---|
| `git init` | Initialise a new git repository |
| `git add .` | Stage all changed files for commit |
| `git commit -m "message"` | Save a snapshot with a description |
| `git push` | Upload commits to GitHub |
| `git push origin main` | Push to the main branch explicitly |
| `git tag v1.0.0` | Create a version tag |
| `git push origin v1.0.0` | Push the tag to GitHub |
| `git branch -M main` | Rename the current branch to main |
| `git remote add origin <url>` | Link your local repo to a GitHub repo |

> **Commit message convention used in this project:**
> - `feat:` — new feature
> - `fix:` — bug fix
> - `docs:` — documentation only
> - `test:` — test files
> Example: `git commit -m "feat: add Groq order parser"`

---

## Docker Commands

| Command | What it does |
|---|---|
| `docker --version` | Check Docker is installed |
| `docker compose version` | Check Docker Compose is installed |
| `docker compose up --build` | Build images and start all containers |
| `docker compose up` | Start containers without rebuilding |
| `docker compose down` | Stop and remove all containers |
| `docker compose logs` | See logs from all containers |
| `docker compose logs backend` | See logs from just the backend container |

> **What is Docker?**
> Docker packages your app and all its dependencies into a "container" — a self-contained box that runs the same way on any machine. `docker compose` manages multiple containers (backend + frontend) together.

---

## ngrok Commands

| Command | What it does |
|---|---|
| `ngrok config add-authtoken YOUR_TOKEN` | Link ngrok to your account |
| `ngrok http 8000` | Create a public HTTPS tunnel to localhost:8000 |

> **What is ngrok?**
> ngrok creates a temporary public URL that tunnels to your local server. Useful for testing webhooks — Meta needs a public URL to send messages to, and ngrok provides one during development.

---

## Windows-Specific Commands

| Command | What it does |
|---|---|
| `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` | Allow PowerShell to run local scripts (needed for venv activation) |
| `wsl --install` | Install Windows Subsystem for Linux (needed for Docker) |
| `where python` | Find where Python is installed |
| `copy .env.example .env` | Copy a file (Windows version of `cp`) |

---

## Environment Variables

Never commit your `.env` files to GitHub. They contain secret keys.

| File | What it's for |
|---|---|
| `backend/.env` | Backend secrets — Groq key, Supabase keys |
| `frontend/.env.local` | Frontend Supabase keys |
| `backend/.env.example` | Template showing what keys are needed (safe to commit) |
| `frontend/.env.local.example` | Template for frontend keys (safe to commit) |

---

## Useful URLs During Development

| URL | What it is |
|---|---|
| `http://127.0.0.1:8000` | FastAPI backend |
| `http://127.0.0.1:8000/docs` | Auto-generated FastAPI API documentation |
| `http://localhost:3000` | Next.js frontend dashboard |
| `https://xxx.ngrok-free.app/webhook` | Public webhook URL via ngrok |

> **Pro tip:** FastAPI auto-generates interactive API docs at `/docs`. You can test all your endpoints there without Thunder Client!

---

*Sorted — MIT Licence — github.com/Nathan-sudo-pycharm/sorted*