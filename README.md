# Mars Society Crew Report Form

A comprehensive web application for managing Mars Society crew reports and GreenHab operations from analog research stations. This application provides structured form interfaces with full JSON schema validation and database persistence.

## Features

- **Dual Form Interface**: Crew report and GreenHab operations report forms
- **Mars Society Branding**: Official Mars flag logo and themed interface
- **JSON Schema Validation**: Full validation against official Mars Society crew report schema
- **Database Persistence**: SQLite database with normalized schema matching JSON exactly
- **Multi-Station Support**: Compatible with MDRS, FMARS, HI-SEAS, and LUNARES
- **Dynamic Forms**: Support for variable crew members, incidents, EVA data, watering schedules, and harvest tracking
- **REST API**: Full CRUD operations for crew and GreenHab report management
- **Email Generation**: GreenHab form generates email-formatted output with copy-to-clipboard
- **Real-time Validation**: Client and server-side validation with immediate user feedback
- **Error Handling**: React error boundary for graceful error recovery
- **Responsive Design**: Left-aligned, accessible forms that work on all devices
- **Environment Configuration**: Separate development and production API endpoints

## Architecture

### Frontend (`/frontend`)
- **React 19** with JavaScript
- **React Hook Form** for form state management and validation
- **Dynamic field arrays** for crew members, incidents, EVA data, watering schedules, and harvests
- **UUID generation** for unique report identifiers
- **Real-time validation** with user feedback
- **Header/Footer Navigation** with form switching
- **Left-aligned responsive design** with black section separators

### Backend (`/backend`)
- **Express.js** with TypeScript
- **AJV JSON Schema** validation
- **SQLite database** with normalized schema matching Mars Society JSON template
- **RESTful API** endpoints with CRUD operations
- **Security headers** with Helmet
- **CORS support** for cross-origin requests
- **Repository pattern** for data access (CrewReportRepository, GreenHabRepository)

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crew-report-form
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run build          # Compile TypeScript and copy schema files
   npm start              # Run on http://localhost:3001
   ```
   
   Or use development mode with hot reload:
   ```bash
   npm run dev            # Uses nodemon for auto-restart
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm install            # Install dependencies first if needed
   npm start              # Application runs on http://localhost:3000
   ```

The application will automatically open in your browser at http://localhost:3000. The frontend connects to the backend API at http://localhost:3001 for form validation and data persistence.

**Note**: The backend build script automatically copies `schema.sql` and schema files to the `dist/` folder, so always run `npm run build` after making schema changes.

## Database Schema

The application uses a normalized SQLite database that matches the official Mars Society crew report JSON schema exactly. Key tables:

### Crew Reports
- **crew_reports** - Main report table with all top-level fields (title, author, station, dates, etc.)
- **report_categories** & **report_tags** - Many-to-many category and tag relationships
- **crew_members** - Crew member details with name, role, and affiliation
- **crew_equipment** - Equipment assignments (many-to-many relationship)

### EVA Data
- **eva_planned_waypoints** - Planned EVA waypoint locations with UTM coordinates
- **eva_planned_activities** - Planned activities at each waypoint
- **eva_planned_crew** - Crew assigned to planned waypoints
- **eva_actual_waypoints** - Actual EVA waypoint visits with coordinates
- **eva_activities_completed** - Activities completed at actual waypoints
- **eva_observations** - Observations and findings from EVA
- **eva_actual_crew** - Crew present at actual waypoints

### Environmental & Resources
- **resource_usage** - Water, power, and food tracking
- **environmental_data** - Temperature, humidity, pressure, and wind data

### Health & Safety
- **incidents** - Safety incidents with type, severity, and resolution
- **health_and_safety_summary** - Morale level and medical notes

### Metadata
- **report_attachments** - File attachments (photos, logs, etc.)
- **report_custom_metadata** - Custom metadata for station-specific data

### GreenHab Operations (Separate Schema)
- **greenhab_reports** - Main GreenHab report with environmental control, water, and narrative data
- **greenhab_watering_times** - Watering schedule times
- **greenhab_harvests** - Crop harvest data with mass in grams

Database file location: `/backend/data/crew_reports.db` (automatically created on first run)

## API Endpoints

### Crew Reports
- `POST /api/reports` - Submit new crew report
- `GET /api/reports` - List all crew reports
- `GET /api/reports/:id` - Retrieve specific report by ID

### GreenHab Reports
- `POST /api/reports/greenhab` - Submit new GreenHab report
- `GET /api/reports/greenhab` - List all GreenHab reports
- `GET /api/reports/greenhab/:id` - Get specific GreenHab report
- `GET /api/reports/greenhab/crew/:crewNumber` - Get reports for specific crew
- `DELETE /api/reports/greenhab/:id` - Delete GreenHab report

### Validation
- `GET /api/schema` - Get JSON schema for validation

### System
- `GET /health` - Health check endpoint

## Supported Stations

- **MDRS** - Mars Desert Research Station (Utah, USA)
- **FMARS** - Flashline Mars Arctic Research Station (Canada)
- **HI-SEAS** - Hawaii Space Exploration Analog and Simulation (Hawaii, USA)
- **LUNARES** - Lunar Research Station Simulator

## Report Types

- **Daily** - Daily crew reports
- **Weekly** - Weekly summary reports
- **EVA** - Extra-Vehicular Activity reports
- **Incident** - Incident and safety reports
- **Final** - Mission completion reports

## Form Sections

### Crew Report Form

#### Required Fields
- Report metadata (ID, title, author, dates)
- Station and mission information
- Report type and content

#### Optional Sections
- **EVA Data**: EVA number, participants, duration, objectives, safety notes, waypoints with UTM coordinates
- **Crew Members**: Names, roles, affiliations, and equipment assignments
- **Resources**: Water, power usage, and food consumption
- **Environmental Data**: Temperature, humidity, pressure
- **Incidents**: Type, severity, description, and resolution

### GreenHab Report Form

#### Required Fields
- Report information (crew number, position, prepared by, date, sol)
- Environmental control and temperature data (average, max, min)
- Daily water usage for crops
- Blue tank water level
- Narrative description

#### Optional Sections
- Water usage for research/other purposes
- Watering schedule times (dynamic array)
- Changes to crops
- Harvest data (crop type and mass in grams, dynamic array)
- Support/supplies needed
- Attached pictures indicator

#### Special Features
- Email subject and body preview
- Copy-to-clipboard functionality for email content
- Date formatting (dd-MM-yyyy)

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with your preferred web server
```

### Environment Variables

**Backend:**
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

**Frontend:**
- `REACT_APP_API_URL` - API endpoint URL
  - Development: `http://localhost:3001` (set in `.env`)
  - Production: `https://api.marssociety.org` (set in `.env.production`)

Create `.env` and `.env.production` files in the frontend directory to configure API endpoints for different environments.

## Development Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production server

### Frontend
- `npm start` - Start development server
- `npm run build` - Build optimized production bundle
- `npm test` - Run test suite

## Data Validation

The application implements comprehensive validation using JSON Schema:

- **Field-level validation** for data types and formats
- **Required field enforcement** for critical report data
- **Enum validation** for predefined values (stations, roles, etc.)
- **Custom validation rules** for business logic
- **Real-time feedback** in the form interface

## Security Features

- **Helmet.js** security headers
- **CORS** configuration for cross-origin requests
- **Input validation** and sanitization
- **SQL injection protection** via parameterized queries
- **Error handling** without information disclosure

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Recent Improvements (January 2026)

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for a comprehensive analysis and detailed improvement log.

**Critical Bug Fixes:**
- ✅ Fixed GreenHab routes not being registered (404 errors)
- ✅ Fixed field name mismatch in GreenHab form (date vs reportDate)
- ✅ Fixed hardcoded API URLs for production deployment

**New Features:**
- ✅ Mars flag as favicon and header logo
- ✅ Updated footer with Mars Society copyright and links
- ✅ React error boundary for graceful error handling
- ✅ Improved loading states on all forms
- ✅ Environment-based API configuration

## File Structure

```
crew-report-form/
├── Claude.md                    # AI development context guide
├── README.md                    # This file - main documentation
├── IMPROVEMENTS.md              # Detailed analysis and improvements log
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server with routes
│   │   ├── schema.json           # JSON schema reference
│   │   ├── database/
│   │   │   ├── schema.sql        # SQLite schema (matches JSON)
│   │   │   ├── database.ts       # SQLite wrapper class
│   │   │   ├── crewReportRepository.ts  # Crew report data access
│   │   │   └── greenhabRepository.ts    # GreenHab data access
│   │   └── routes/
│   │       └── greenhab.ts       # GreenHab API endpoints
│   ├── dist/                     # Compiled JavaScript (generated)
│   ├── data/
│   │   └── crew_reports.db      # SQLite database (generated)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── App.js                # Main app with header, footer, navigation
│   │   ├── App.css               # App-wide styling with Mars flag logo
│   │   ├── Flag-Mars.svg         # Official Mars flag image
│   │   ├── index.js              # Entry point with ErrorBoundary
│   │   ├── index.css
│   │   └── components/
│   │       ├── CrewReport.js           # Crew report form component
│   │       ├── CrewReport.css          # Crew report styling
│   │       ├── GreenHabReport.js       # GreenHab form component
│   │       ├── GreenHabReport.css      # GreenHab styling
│   │       └── ErrorBoundary.js        # Error boundary component
│   ├── public/
│   │   ├── index.html           # Updated with Mars branding
│   │   ├── favicon.svg          # Mars flag favicon
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── .env                     # Development environment config
│   ├── .env.production          # Production environment config
│   ├── build/                   # Production build output (generated)
│   ├── package.json
│   └── README.md
```

## Technology Stack

**Frontend:**
- React 19
- React Hook Form
- CSS3
- JavaScript ES6+

**Backend:**
- Node.js
- Express.js
- TypeScript
- SQLite3
- AJV (JSON Schema validation)

**Development Tools:**
- nodemon (hot reload)
- ts-node (TypeScript execution)
- Create React App

## Schema Reference

This project implements the official Mars Society crew report JSON schema from:
https://github.com/marssociety/crew-report-template/blob/main/crew_report_template_strict.json

The SQL database schema is normalized but maintains all JSON fields for complete data persistence and compatibility.

### Design Principles

- **Left-aligned**: All text and form elements are left-aligned
- **Section breaks**: Black horizontal lines separate major form sections
- **Responsive**: Grid layouts adapt to different screen sizes
- **Accessible**: Semantic HTML, proper labels, keyboard navigation
- **Minimal styling**: Clean, professional appearance without unnecessary decoration

## License

This project is licensed under the ISC License - see the package.json files for details.

## Mars Society

This application supports the Mars Society's mission to advance human exploration and settlement of Mars through analog research and simulation programs.

For more information:
- **Website**: https://www.marssociety.org/
- **MDRS Reports**: https://mdrs.marssociety.org
- **Reports Archive**: https://reports.marssociety.org
- **GitHub Organization**: https://github.com/marssociety/
- **Crew Report Template**: https://github.com/marssociety/crew-report-template

## Support & Contributing

For issues, questions, feature requests, or contributions:
1. Check the [Claude.md](Claude.md) file for AI development context
2. Review existing issues on GitHub
3. Submit a pull request with your improvements
4. Contact the development team for questions

## License

This project is licensed under the ISC License - see the package.json files for details.

---

**Project Status**: Active Development
**Last Updated**: January 2026
**Maintainers**: Mars Society Development Team
