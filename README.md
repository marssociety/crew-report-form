# Mars Society Crew Report System

Web application for MDRS (Mars Desert Research Station) crew members to submit daily operational reports. Each crew role has a dedicated form that validates input, persists data to a database, and generates formatted email output for mission support.

**Live**: [crew-reports.marssociety.org](https://crew-reports.marssociety.org)

---

## Report Types

| Report | Description |
|--------|-------------|
| **Sol Summary** | Commander's daily summary — mission status, activities, weather, crew health |
| **Operations** | Engineering officer — systems status, rover readings, water/power, suits & radios |
| **GreenHab** | GreenHab officer — environmental control, water usage, crops, harvests |
| **EVA Report** | Post-EVA debrief — participants, routes, coordinates, narrative |
| **EVA Request** | Pre-EVA planning — purpose, destination, vehicles, weather assessment |
| **Journalist** | Crew journalist — daily narrative report |
| **Photos** | Photographer — photo of the day submissions with captions |
| **Astronomy** | Astronomy officer — telescope observations, solar features, imaging |
| **HSO Checklist** | Health & safety officer — beginning-of-mission equipment/safety checklist |
| **Checkout** | End-of-mission checkout — facility condition, damages, cleaning |
| **Food Inventory** | Pantry inventory tracking with starting amounts and remaining fractions |

All forms share common header fields (crew number, date, sol, prepared by) and generate email subject/body output.

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+ (local via Docker or native install)

### Development

```bash
# Clone
git clone https://github.com/YOUR-USERNAME/crew-report-form.git
cd crew-report-form

# Start PostgreSQL (Docker)
docker run -d --name crew-pg -e POSTGRES_DB=crew_reports -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:17

# Backend (Terminal 1)
cd backend
npm install
DATABASE_URL=postgresql://postgres:dev@localhost:5432/crew_reports npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm start              # Runs on http://localhost:3000
```

Open http://localhost:3000 in your browser. Password: `hanksville`

### Production Build

```bash
# Backend
cd backend
npm ci
npm run build
DATABASE_URL=postgresql://... npm start   # Serves API on port 3001

# Frontend
cd frontend
echo "REACT_APP_API_URL=https://crew-reports.marssociety.org" > .env.production
npm ci
npm run build          # Output in frontend/build/
```

---

## Architecture

```
frontend/          React 19 SPA (Create React App)
  src/
    App.js           Login gate, view routing, navigation
    components/
      ReportSelector.js    Report type picker grid
      SharedHeader.js      Common crew/date/sol fields
      *Form.js             One form per report type
      ViewCrewReports.js   Report list
      CrewReportView.js    Report detail view

backend/           Express 5 + TypeScript API
  src/
    index.ts              Server entry, route mounting
    validation.ts         AJV per-type validation (discriminated union)
    report_schema.json    Official crew-report-template JSON Schema
    routes/
      reportRouteFactory.ts  Generic route factory (POST/GET/DELETE)
      *.ts                   2-line wrappers per report type
    database/
      database.ts         PostgreSQL Pool wrapper
      schema.sql          Unified table DDL
      reportRepository.ts Unified repository (all report types)
```

**Data flow**: Form → `buildTemplatePayload()` → POST `/api/reports/<type>` → AJV validation → `reportRepository.save()` → PostgreSQL JSONB

**Submission format**: All forms submit in the [crew-report-template](https://github.com/marssociety/crew-report-template) format with envelope fields (`report_type`, `crew_number`, `report_date`, `sol`) and a `role_specific_data` object containing type-specific fields.

**Database**: PostgreSQL with a single unified `reports` table. Envelope fields are columns; role-specific data is stored in a JSONB `report_data` column. Schema auto-created from `schema.sql` on first run.

---

## API Endpoints

Each report type exposes:

```
POST   /api/reports/<type>       Submit a report
GET    /api/reports/<type>       List all reports
GET    /api/reports/<type>/:id   Get a specific report
```

Where `<type>` is: `sol-summary`, `operations`, `greenhab`, `eva`, `eva-request`, `journalist`, `photos`, `astronomy`, `hso-checklist`, `checkout`, `food-inventory`

Additional:
- `GET /api/schema` — JSON validation schema (crew-report-template format)
- `GET /api/schema/types` — List of all valid report_type enum values
- `POST /api/validate` — Validate report data against per-type schemas
- `GET /health` — Health check

---

## Environment Variables

**Backend** (`backend/.env`):
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://localhost:5432/crew_reports
```

**Frontend** (`frontend/.env.production`):
```
REACT_APP_API_URL=https://crew-reports.marssociety.org
```

Template files: `.env.example` and `frontend/.env.production.example`

---

## Deployment

Deployed on **phobos** server at `crew-reports.marssociety.org`.

Single-server setup: Nginx serves the React build as static files and proxies `/api` requests to the Node.js backend (PM2).

See [DEPLOYMENT.md](DEPLOYMENT.md) for full step-by-step instructions.

---

## Tech Stack

- **Frontend**: React 19, React Hook Form, CSS3
- **Backend**: Express 5, TypeScript, PostgreSQL (pg), AJV (JSON Schema validation with per-type discriminated union)
- **Security**: Helmet.js headers, CORS, parameterized SQL queries
- **Production**: PM2 process manager, Nginx reverse proxy, Let's Encrypt SSL

---

## Development Notes

- `npm run build` in backend compiles TypeScript and copies `schema.sql` and `report_schema.json` to `dist/`
- To reset the database: `DROP TABLE reports;` in psql — table regenerates on server start
- Frontend reads `REACT_APP_API_URL` at build time; defaults to `http://localhost:3001` in dev
- Migration script at `backend/scripts/migrate-sqlite-to-pg.ts` for migrating from old SQLite data
- See [Claude.md](Claude.md) for detailed AI development context

---

## Links

- [Mars Society](https://www.marssociety.org/)
- [MDRS Reports Archive](https://reports.marssociety.org)
- [Crew Report Template Schema](https://github.com/marssociety/crew-report-template)

---

**Last Updated**: March 2026
