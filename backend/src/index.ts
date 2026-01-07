import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from './schema.json';
import Database from './database/database';
import CrewReportRepository from './database/crewReportRepository';
import greenhabRouter from './routes/greenhab';

const app = express();
const port = process.env.PORT || 3001;

const ajv = new Ajv({ 
  allErrors: true,
  validateSchema: false,
  addUsedSchema: false
});
addFormats(ajv);
const validate = ajv.compile(schema);

// Initialize database
const db = Database.getInstance();
const crewReportRepo = new CrewReportRepository();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Mount routes
app.use('/api/reports/greenhab', greenhabRouter);

app.get('/api/schema', (req, res) => {
  res.json(schema);
});

app.post('/api/validate', (req, res) => {
  const valid = validate(req.body);
  
  if (valid) {
    res.json({ valid: true, data: req.body });
  } else {
    res.status(400).json({ 
      valid: false, 
      errors: validate.errors 
    });
  }
});

app.post('/api/reports', async (req, res) => {
  const valid = validate(req.body);
  
  if (!valid) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      errors: validate.errors 
    });
  }

  try {
    await crewReportRepo.saveCrewReport(req.body);
    
    console.log('Report saved to database:', {
      id: req.body.report_id,
      title: req.body.title,
      author: req.body.author
    });

    res.status(201).json({ 
      message: 'Report submitted and saved successfully',
      id: req.body.report_id 
    });
  } catch (error) {
    console.error('Error saving report to database:', error);
    res.status(500).json({ 
      error: 'Failed to save report to database',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await crewReportRepo.getAllCrewReports();
    res.json(reports);
  } catch (error) {
    console.error('Error retrieving reports:', error);
    res.status(500).json({
      error: 'Failed to retrieve reports',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific report by ID
app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await crewReportRepo.getCrewReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error retrieving report:', error);
    res.status(500).json({
      error: 'Failed to retrieve report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await db.initialize();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log('Database initialized and connected');
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();