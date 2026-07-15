# 🕒 Intern Attendance Tracker

A full-stack, QR-code-based attendance system for tracking interns. Interns check in and out by scanning a personal QR code, while staff manage intern records, timesheets, and attendance history from a web dashboard. Includes automatic session timeout handling for interns who forget to check out.

## Features

- **QR code check-in/check-out** — each registered intern gets a unique QR code (generated server-side with `qrcode` + Pillow); attendance is scanned directly in the browser via `html5-qrcode`
- **Intern management** — register, update, list, and remove interns, each tied to a school, abbreviation, and shift
- **Timesheet tracking** — records time-in/time-out and computes total hours worked per day, with support for editing, deleting, and filtering by date
- **Attendance history** — separate historical records per intern, with per-school deletion support
- **Automatic timeout** — a background scheduler (APScheduler) automatically closes out attendance sessions that were left open (e.g. an intern forgot to check out)
- **Filtering** — filter attendance/intern records by school and by date
- **Dockerized** — one-command spin-up of the backend, frontend, and PostgreSQL database via Docker Compose

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- React Router
- Tailwind CSS
- Axios
- `html5-qrcode` (in-browser QR scanning)
- Lucide Icons

**Backend**
- Python + FastAPI
- SQLAlchemy (ORM) + `databases` (async queries)
- PostgreSQL (via `asyncpg` / `psycopg2`)
- Pydantic / Pydantic Settings
- APScheduler (background auto-timeout jobs)
- `qrcode` + Pillow (QR code generation)

**Infra**
- Docker & Docker Compose

## Project Structure

```
Intern-Attendance-Tracker/
├── server/                        # FastAPI backend
│   ├── app/
│   │   ├── main.py                 # App entry point, CORS, routers, startup scheduler
│   │   ├── scheduler.py            # APScheduler setup
│   │   ├── auto_timeout.py         # Auto-closes open attendance sessions
│   │   ├── routes/                 # intern, attendance, intern_history endpoints
│   │   ├── crud/                   # Database operations
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   └── utils/                  # DB session, QR generator, settings, helpers
│   ├── db.sql                      # Database schema
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                      # React + TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml             # Backend + frontend + PostgreSQL orchestration
```

## Getting Started

### Option A: Run with Docker (recommended)

**Prerequisites:** Docker & Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/jus-waa/Intern-Attendance-Tracker.git
   cd Intern-Attendance-Tracker
   ```
2. Create a `.env` file inside `server/`:
   ```env
   DB_URL=postgresql://<user>:<password>@db:5432/<database>
   DEBUG=True
   ```
   (Docker Compose points both the backend and the `db` service at this same `.env` file.)
3. Start everything:
   ```bash
   docker compose up --build
   ```
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5173`
   - PostgreSQL: `localhost:5432`

### Option B: Run locally without Docker

**Prerequisites:** Node.js, Python, PostgreSQL

**Backend**
```bash
cd server
python -m venv venv
venv\Scripts\activate.ps1   # or `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
```
Create a `.env` file inside `server/` with `DB_URL` and `DEBUG` as shown above (using `localhost` instead of `db` for the host), then run:
```bash
uvicorn app.main:app --reload
```

**Database**
- Create a PostgreSQL database.
- Run the schema in `server/db.sql`.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## API Overview

**Intern** (`/intern`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new intern and generate their QR code |
| GET | `/list` | List all interns |
| GET | `/list/id:{id}` | Get a single intern by ID |
| PATCH | `/update` | Update intern details |
| DELETE | `/delete` | Remove an intern (and their QR code) |

**Attendance** (`/attendance`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/check-in` | Check in an intern |
| POST | `/check-out` | Check out an intern |
| POST | `/qr-scan` | Register attendance via QR code scan |
| GET | `/timesheet` | Get all attendance records |
| GET | `/timesheet/by-date` | Get attendance filtered by date |
| PATCH | `/timesheet/edit` | Edit an attendance record |
| DELETE | `/timesheet/delete` | Delete an attendance record |

**Intern History** (`/history`)
| Method | Description |
|---|---|
| — | Historical attendance records per intern |

## Contributors

Contributions welcome — please avoid committing directly to `main`; open a pull request instead.

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software for personal or commercial projects, provided that the original copyright and license notice are included.
