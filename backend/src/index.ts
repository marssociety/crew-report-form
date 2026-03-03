import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import reportSchema from './report_schema.json';
import { validateSubmission, REPORT_TYPES, ALL_ACCEPTED_TYPES } from './validation';
import Database from './database/database';
import { ReportRepository } from './database/reportRepository';
import greenhabRouter from './routes/greenhab';
import solSummaryRouter from './routes/solSummary';
import operationsRouter from './routes/operations';
import evaReportRouter from './routes/evaReport';
import evaRequestRouter from './routes/evaRequest';
import journalistRouter from './routes/journalist';
import photosRouter from './routes/photos';
import astronomyRouter from './routes/astronomy';
import hsoChecklistRouter from './routes/hsoChecklist';
import checkoutRouter from './routes/checkout';
import foodInventoryRouter from './routes/foodInventory';

const app = express();
const port = process.env.PORT || 3001;

// Initialize database
const db = Database.getInstance();
const reportRepo = new ReportRepository();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Mount routes
app.use('/api/reports/greenhab', greenhabRouter);
app.use('/api/reports/sol-summary', solSummaryRouter);
app.use('/api/reports/operations', operationsRouter);
app.use('/api/reports/eva', evaReportRouter);
app.use('/api/reports/eva-request', evaRequestRouter);
app.use('/api/reports/journalist', journalistRouter);
app.use('/api/reports/photos', photosRouter);
app.use('/api/reports/astronomy', astronomyRouter);
app.use('/api/reports/hso-checklist', hsoChecklistRouter);
app.use('/api/reports/checkout', checkoutRouter);
app.use('/api/reports/food-inventory', foodInventoryRouter);

app.get('/api/schema', (_req, res) => {
  res.json(reportSchema);
});

app.get('/api/schema/types', (_req, res) => {
  res.json({ report_types: REPORT_TYPES, accepted_aliases: ALL_ACCEPTED_TYPES });
});

app.post('/api/validate', (req, res) => {
  const result = validateSubmission(req.body);
  if (result.valid) {
    res.json({ valid: true, data: req.body });
  } else {
    res.status(400).json({ valid: false, errors: result.errors });
  }
});

// Get all reports (used by ViewCrewReports.js)
app.get('/api/reports', async (_req, res) => {
  try {
    const reports = await reportRepo.findAll();
    // Map id → report_id for frontend compatibility
    const mapped = reports.map(r => ({
      report_id: r.id,
      title: r.title || `${r.report_type} report`,
      author: r.author || '',
      station: r.station || 'MDRS',
      mission_name: r.mission_name || '',
      crew_number: r.crew_number,
      mission_type: r.mission_type || '',
      report_date: r.report_date,
      report_type: r.report_type,
      sol: r.sol,
      content: r.content || r.email_body || '',
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error retrieving reports:', error);
    res.status(500).json({
      error: 'Failed to retrieve reports',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get specific report by ID (used by CrewReportView.js)
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await reportRepo.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    // Map to frontend-expected shape
    res.json({
      report_id: report.id,
      title: report.title || `${report.report_type} report`,
      author: report.author || '',
      station: report.station || 'MDRS',
      mission_name: report.mission_name || '',
      crew_number: report.crew_number,
      mission_type: report.mission_type || '',
      mission_start_date: report.mission_start_date || '',
      mission_duration_day: report.mission_duration_day,
      report_date: report.report_date,
      report_type: report.report_type,
      sol: report.sol,
      content: report.content || report.email_body || '',
      report_data: report.report_data,
      email_subject: report.email_subject,
      email_body: report.email_body,
      created_at: report.created_at,
    });
  } catch (error) {
    console.error('Error retrieving report:', error);
    res.status(500).json({
      error: 'Failed to retrieve report',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await db.initialize();
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Database initialized and connected');
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close();
      await db.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();
