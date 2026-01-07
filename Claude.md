# Claude Development Guide

This document provides context and information for Claude (AI assistant) to understand and work with the Mars Society Crew Report Form project.

## Project Overview

The Mars Society Crew Report Form is a full-stack web application for managing crew reports from analog research stations (MDRS, FMARS, HI-SEAS, LUNARES). It provides structured forms for submitting crew reports and GreenHab operational reports with real-time validation and database persistence.

## Key Technologies

- **Frontend**: React 19, React Hook Form, CSS3
- **Backend**: Express.js, TypeScript, SQLite3
- **Validation**: AJV (JSON Schema)
- **Database**: SQLite with normalized schema

## Project Structure

```
crew-report-form/
├── README.md                 # Main project documentation
├── Claude.md                # This file - AI development context
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── schema.json           # JSON schema for validation
│   │   ├── database/
│   │   │   ├── database.ts       # SQLite wrapper class
│   │   │   ├── schema.sql        # Database schema (matches JSON schema)
│   │   │   ├── crewReportRepository.ts
│   │   │   └── greenhabRepository.ts
│   │   └── routes/
│   │       ├── reports.ts        # Crew report endpoints
│   │       └── greenhab.ts       # GreenHab report endpoints
│   ├── dist/                     # Compiled JavaScript
│   ├── data/                     # SQLite database file
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main app with navigation
│   │   ├── App.css              # App-wide styling
│   │   ├── index.js
│   │   └── components/
│   │       ├── CrewReportForm.js    # Crew report form component
│   │       ├── CrewReportForm.css   # Form styling
│   │       ├── GreenHabReportForm.js # GreenHab form component
│   │       └── GreenHabReportForm.css # GreenHab styling
│   ├── forms/                   # Alternative form location
│   │   ├── CrewReport.js        # Copy of crew report form
│   │   ├── CrewReport.css       # Copy of crew report styling
│   │   └── GreenHabReport.js    # Copy of GreenHab form
│   ├── public/
│   │   └── index.html
│   ├── build/                   # Production build output
│   ├── package.json
│   └── README.md
```

## Database Schema

The SQLite database matches the official Mars Society crew report JSON schema exactly. Key tables:

- **crew_reports** - Main report table with all top-level JSON fields
- **report_categories** & **report_tags** - Many-to-many relationships
- **crew_members** - Crew member details with affiliation
- **crew_equipment** - Equipment assignments (many-to-many)
- **eva_planned_waypoints** & **eva_actual_waypoints** - EVA data
- **eva_planned_activities** & **eva_activities_completed** - EVA activities
- **eva_observations** - EVA observations with coordinates
- **resource_usage** - Water, power, food tracking
- **environmental_data** - Temperature, humidity, pressure, wind
- **incidents** - Safety incidents with severity tracking
- **health_and_safety_summary** - Morale and medical notes
- **report_attachments** & **report_custom_metadata** - Metadata
- **greenhab_reports** - Separate schema for GreenHab operations
- **greenhab_watering_times** & **greenhab_harvests** - GreenHab data

## Development Workflow

### Backend Setup
```bash
cd backend
npm install
npm run build          # Compile TypeScript to dist/
npm start dev          # Run with development mode flag
npm run dev            # Run with nodemon hot-reload
```

The build script automatically copies `schema.sql` and `schema.json` to the `dist/` folder.

### Frontend Setup
```bash
cd frontend
npm install
npm start              # Run React dev server on localhost:3000
npm run build          # Create production build
```

### Running Both Servers
1. Terminal 1: `cd backend && npm start dev` (or `npm run build && npm start`)
2. Terminal 2: `cd frontend && npm start`
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

## Forms Overview

### Crew Report Form
- **Location**: `/src/components/CrewReportForm.js` and `/forms/CrewReport.js`
- **Fields**: 50+ form fields across 8 sections
- **Sections**: Basic Info, EVA Data, Crew Members, Resources, Environmental, Incidents
- **Features**: Dynamic arrays for crew/incidents, UUID generation, email-style submission

### GreenHab Report Form
- **Location**: `/src/components/GreenHabReportForm.js` and `/forms/GreenHabReport.js`
- **Fields**: 25+ specialized GreenHab fields
- **Sections**: Report Info, Environmental Control, Water Usage, Watering Schedule, Crops & Harvest, Additional Info
- **Features**: Email subject/body preview, copy-to-clipboard, dynamic watering times and harvest entries

## UI/UX Design

All forms follow these design principles:
- **Left-aligned** text and form elements
- **Black horizontal lines** separating section headings (`h2`)
- **Simple header** with app title and form navigation
- **Simple footer** with GitHub repo link
- **Navigation**: Text links with pipe separator, right-aligned in header
- **Responsive**: Grid layouts adapt to smaller screens

## Form Styling

- **Primary color**: Dark gray (#333)
- **Section borders**: Black (`#000`)
- **Focus state**: Dark gray border with light shadow
- **Buttons**: Dark gray background (#333), lighter on hover (#555)
- **Errors**: Red text (#dc3545)
- **Success**: Green background
- **Max width**: 900px for forms, centered

## API Endpoints

### Crew Reports
- `POST /api/reports` - Submit new crew report
- `GET /api/reports` - List all crew reports
- `GET /api/reports/:id` - Get specific report

### GreenHab Reports
- `POST /api/reports/greenhab` - Submit new GreenHab report
- `GET /api/reports/greenhab` - List all GreenHab reports
- `GET /api/reports/greenhab/:id` - Get specific GreenHab report
- `DELETE /api/reports/greenhab/:id` - Delete GreenHab report

## Important Notes for Development

1. **Schema Source of Truth**: The JSON schema at `https://github.com/marssociety/crew-report-template/blob/main/crew_report_template_strict.json` is the authoritative schema. Database schema must match this exactly.

2. **Database Compilation**: When modifying `schema.sql`, rebuild the backend to copy the updated file to `dist/`:
   ```bash
   cd backend
   npm run build
   ```

3. **Form Imports**: Both `/src/components/` and `/forms/` directories contain form files for flexibility in usage.

4. **Frontend Imports**: Main App.js imports from `/src/components/` for the primary interface.

5. **UUID Generation**: Crew reports use UUID v4 for report IDs. GreenHab reports use simple UUID generation in the component.

6. **Email Preview**: GreenHab form generates email-formatted output visible to users before submission.

7. **Validation**: Both AJV (server-side JSON schema) and React Hook Form (client-side) validation are implemented.

## Common Tasks

### Adding a New Form Field
1. Add to JSON schema in `/backend/src/schema.json`
2. Update SQL schema in `/backend/src/database/schema.sql`
3. Add to form component in `/src/components/`
4. Rebuild backend: `npm run build`

### Fixing the Database
Delete `/backend/data/crew_reports.db` - it will be recreated on next server start with the current schema.

### Deploying to Production
1. Backend: `cd backend && npm run build && npm start`
2. Frontend: `cd frontend && npm run build` then serve with web server

### Testing Forms Locally
1. Start backend: `npm start dev` (in backend/)
2. Start frontend: `npm start` (in frontend/)
3. Navigate to http://localhost:3000
4. Use form navigation to switch between crew and GreenHab reports

## Reference Links

- **Mars Society**: https://www.marssociety.org/
- **JSON Schema**: https://github.com/marssociety/crew-report-template/blob/main/crew_report_template_strict.json
- **GitHub Repo**: https://github.com/marssociety/crew-report-form
- **React Hook Form**: https://react-hook-form.com/
- **AJV JSON Schema**: https://ajv.js.org/

## Notes on Recent Changes

- Updated SQL schema to exactly match Mars Society JSON crew report template
- Added GreenHab report form and database schema
- Implemented left-aligned layout with black section separators
- Added header/footer with form navigation
- Created forms directory with copies of form components
- Updated all button colors to dark gray for consistency
- Added GreenHab-specific repositories and routing

## Troubleshooting

### Backend won't start - "schema.sql not found"
**Solution**: Run `npm run build` in the backend directory to copy schema files to dist/

### Frontend can't reach backend API
**Solution**: Ensure backend is running on port 3001 and CORS is enabled in Express

### Database shows old schema
**Solution**: Delete `/backend/data/crew_reports.db` and restart the server

### Form validation not working
**Solution**: Check browser console for validation errors; ensure schema.json matches the form fields

---

**Last Updated**: January 7, 2026
**Maintained by**: Mars Society Development Team
