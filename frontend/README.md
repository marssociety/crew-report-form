# Mars Society Crew Report Form - Frontend

This is the React frontend for the Mars Society Crew Report Form application. It provides interactive forms for submitting crew reports and GreenHab operational reports with real-time validation.

## Overview

The frontend is built with React 19 and React Hook Form, providing:
- Two specialized forms: Crew Report and GreenHab Report
- Real-time form validation
- Dynamic field arrays (for crew members, incidents, harvests, watering schedules)
- Responsive, left-aligned design
- Integration with backend REST API for data persistence

## Available Scripts

In the project directory, you can run:

### `npm install`

Install all project dependencies listed in package.json.

### `npm start`

Runs the app in development mode on [http://localhost:3000](http://localhost:3000).

The page will reload when you make changes. You may see lint errors in the console.

**Note**: Requires the backend API running on `http://localhost:3001`.

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React and optimizes the build for the best performance. The build is minified and filenames include the hashes.

### `npm test`

Launches the test runner in interactive watch mode.

See the [testing documentation](https://create-react-app.dev/docs/running-tests) for more information.

## Project Structure

```
frontend/
├── src/
│   ├── App.js              # Main app component with navigation
│   ├── App.css             # App-wide styling
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   └── components/
│       ├── CrewReportForm.js       # Crew report form
│       ├── CrewReportForm.css      # Crew report styling
│       ├── GreenHabReportForm.js   # GreenHab report form
│       └── GreenHabReportForm.css  # GreenHab styling
├── forms/                  # Alternative form location
│   ├── CrewReport.js
│   ├── CrewReport.css
│   └── GreenHabReport.js
├── public/
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   └── robots.txt
├── package.json
└── README.md
```

## Form Components

### CrewReportForm
- **Purpose**: Comprehensive crew report submission
- **Location**: `src/components/CrewReportForm.js`
- **Sections**:
  - Basic Information (title, author, station, mission)
  - EVA Data (optional)
  - Crew Members (optional)
  - Resources (optional)
  - Environmental Data (optional)
  - Incidents (optional)

### GreenHabReportForm
- **Purpose**: GreenHab operations reporting
- **Location**: `src/components/GreenHabReportForm.js`
- **Features**:
  - Email subject and body preview
  - Copy-to-clipboard functionality
  - Dynamic watering schedule entries
  - Dynamic harvest data entries

## Backend Integration

The frontend communicates with the backend API at `http://localhost:3001`:

### Endpoints Used

**Crew Reports:**
- `POST /api/reports` - Submit new crew report
- `GET /api/reports` - List all reports

**GreenHab Reports:**
- `POST /api/reports/greenhab` - Submit new GreenHab report
- `GET /api/reports/greenhab` - List all GreenHab reports

## Dependencies

Key dependencies (see package.json for full list):
- **react**: ^19.1.0 - React library
- **react-dom**: ^19.1.0 - React DOM rendering
- **react-hook-form**: ^7.60.0 - Form state management
- **uuid**: ^11.1.0 - Unique ID generation
- **react-scripts**: 5.0.1 - Create React App scripts

## Form Validation

The frontend uses **React Hook Form** for client-side validation:
- Required field enforcement
- Type validation
- Custom validation rules
- Real-time error messages
- Form state management

Server-side validation occurs at the backend using AJV JSON Schema validation.

## Styling

All forms follow consistent design principles:
- **Colors**: Dark gray (#333) for text, black (#000) for section dividers
- **Layout**: Left-aligned, max-width 900px
- **Responsive**: Mobile-friendly grid layouts
- **Buttons**: Dark gray with hover effects
- **Focus States**: Subtle border and shadow effects

## Development Tips

### Running Locally

1. **Start backend** (in separate terminal):
   ```bash
   cd ../backend
   npm run build
   npm start
   ```

2. **Start frontend**:
   ```bash
   npm install
   npm start
   ```

3. Access the app at http://localhost:3000

### Modifying Forms

- Form structure: Edit the JSX in component files
- Form styling: Edit the corresponding CSS files
- Validation rules: Modify the `register()` options in React Hook Form
- API endpoints: Update the fetch URLs in `onSubmit()` functions

### Hot Reload

The development server automatically reloads when you save files. This works for:
- JSX changes
- CSS changes
- JavaScript logic changes

## Production Build

To create an optimized production build:

```bash
npm run build
```

The build folder is ready to be deployed to a static hosting service.

### Deploying the Build

1. **Static Hosting** (Vercel, Netlify, GitHub Pages):
   - Upload the `build` folder contents
   - Ensure backend API is accessible

2. **Docker**:
   - Build a Docker image containing the build folder
   - Serve with nginx or similar

3. **Traditional Server**:
   - Copy `build` folder to your web server
   - Configure server to route all requests to `index.html` for client-side routing

## Troubleshooting

### Backend API Not Reachable
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify backend CORS configuration

### Form Not Submitting
- Check browser console for JavaScript errors
- Verify all required fields are filled
- Ensure backend is responding to API calls

### Validation Errors
- Check browser console for specific validation messages
- Review React Hook Form error objects
- Verify field names match validation schema

## Learn More

- [Create React App Documentation](https://create-react-app.dev/)
- [React Documentation](https://react.dev/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Mars Society](https://www.marssociety.org/)

## See Also

- [Root README](../README.md) - Full project documentation
- [Claude.md](../Claude.md) - AI development context guide
- [Backend README](../backend) - Backend documentation

---

**Last Updated**: January 2026
**Maintained by**: Mars Society Development Team

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
