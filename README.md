# Mars Society Crew Report Form

A comprehensive web application for managing Mars Society crew reports from analog research stations. This application provides a structured form interface with full JSON schema validation and database persistence for crew report data.

## Features

- **Comprehensive Form Interface**: Dynamic React form supporting all Mars Society crew report fields
- **JSON Schema Validation**: Client and server-side validation against official crew report schema
- **Database Persistence**: SQLite database for storing and retrieving crew reports
- **Multi-Station Support**: Compatible with MDRS and Flashline stations
- **Dynamic Sections**: Support for variable crew members, incidents, EVA data, and objectives
- **REST API**: Full CRUD operations for crew report management

## Architecture

### Frontend (`/frontend`)
- **React 19** with JavaScript
- **React Hook Form** for form state management and validation
- **Dynamic field arrays** for crew members, incidents, and EVA data
- **UUID generation** for unique report identifiers
- **Real-time validation** with user feedback

### Backend (`/backend`)
- **Express.js** with TypeScript
- **AJV JSON Schema** validation
- **SQLite database** with normalized schema
- **RESTful API** endpoints
- **Security headers** with Helmet
- **CORS support** for cross-origin requests

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
   npm run dev
   # Server runs on http://localhost:3001
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   # Application runs on http://localhost:3000
   ```

The application will automatically open in your browser. The frontend connects to the backend API for form validation and data persistence.

## Database Schema

The application uses a normalized SQLite database with the following structure:

- **crew_reports** - Main report metadata and content
- **eva_data** - Extra-Vehicular Activity information
- **eva_participants** - EVA participants (many-to-many relationship)
- **eva_objectives** - EVA objectives (one-to-many relationship)
- **crew_members** - Crew member details (one-to-many relationship)
- **resources** - Resource usage data
- **environmental_data** - Environmental conditions
- **incidents** - Incident reports (one-to-many relationship)

Database file location: `/backend/data/crew_reports.db`

## API Endpoints

### Reports
- `GET /api/reports` - Retrieve all crew reports
- `GET /api/reports/:id` - Retrieve specific report by ID
- `POST /api/reports` - Submit new crew report

### Validation
- `GET /api/schema` - Get JSON schema for validation
- `POST /api/validate` - Validate report data without saving

### System
- `GET /health` - Health check endpoint

## Supported Stations

- **MDRS** - Mars Desert Research Station
- **FMARS** - Flashline Mars Arctic Research Station

## Report Types

- **Daily** - Daily crew reports
- **Weekly** - Weekly summary reports
- **EVA** - Extra-Vehicular Activity reports
- **Incident** - Incident and safety reports
- **Final** - Mission completion reports

## Form Sections

### Required Fields
- Report metadata (ID, title, author, dates)
- Station and mission information
- Report content

### Optional Sections
- **EVA Data**: EVA number, participants, duration, objectives, safety notes
- **Crew Members**: Names, roles, and status
- **Resources**: Water, power usage, and food consumption
- **Environmental Data**: Temperature, humidity, pressure
- **Incidents**: Type, severity, description, and resolution

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
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

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

## File Structure

```
crew-report-form/
├── README.md
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── schema.sql
│   │   │   ├── database.ts
│   │   │   └── crewReportRepository.ts
│   │   ├── index.ts
│   │   └── schema.json
│   ├── data/
│   │   └── crew_reports.db
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CrewReportForm.js
    │   │   └── CrewReportForm.css
    │   └── App.js
    ├── package.json
    └── public/
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

The form validates against the official Mars Society crew report schema from: https://github.com/marssociety/crew-report-template

## License

This project is licensed under the ISC License - see the package.json files for details.

## Mars Society

This application supports the Mars Society's mission to advance human exploration and settlement of Mars through analog research and simulation programs.

For more information about the Mars Society: [marssociety.org](https://www.marssociety.org/)

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.
