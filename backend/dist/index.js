"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const report_schema_json_1 = __importDefault(require("./report_schema.json"));
const validation_1 = require("./validation");
const database_1 = __importDefault(require("./database/database"));
const reportRepository_1 = require("./database/reportRepository");
const greenhab_1 = __importDefault(require("./routes/greenhab"));
const solSummary_1 = __importDefault(require("./routes/solSummary"));
const operations_1 = __importDefault(require("./routes/operations"));
const evaReport_1 = __importDefault(require("./routes/evaReport"));
const evaRequest_1 = __importDefault(require("./routes/evaRequest"));
const journalist_1 = __importDefault(require("./routes/journalist"));
const photos_1 = __importDefault(require("./routes/photos"));
const astronomy_1 = __importDefault(require("./routes/astronomy"));
const hsoChecklist_1 = __importDefault(require("./routes/hsoChecklist"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const foodInventory_1 = __importDefault(require("./routes/foodInventory"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Initialize database
const db = database_1.default.getInstance();
const reportRepo = new reportRepository_1.ReportRepository();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
// Mount routes
app.use('/api/reports/greenhab', greenhab_1.default);
app.use('/api/reports/sol-summary', solSummary_1.default);
app.use('/api/reports/operations', operations_1.default);
app.use('/api/reports/eva', evaReport_1.default);
app.use('/api/reports/eva-request', evaRequest_1.default);
app.use('/api/reports/journalist', journalist_1.default);
app.use('/api/reports/photos', photos_1.default);
app.use('/api/reports/astronomy', astronomy_1.default);
app.use('/api/reports/hso-checklist', hsoChecklist_1.default);
app.use('/api/reports/checkout', checkout_1.default);
app.use('/api/reports/food-inventory', foodInventory_1.default);
app.get('/api/schema', (_req, res) => {
    res.json(report_schema_json_1.default);
});
app.get('/api/schema/types', (_req, res) => {
    res.json({ report_types: validation_1.REPORT_TYPES, accepted_aliases: validation_1.ALL_ACCEPTED_TYPES });
});
app.post('/api/validate', (req, res) => {
    const result = (0, validation_1.validateSubmission)(req.body);
    if (result.valid) {
        res.json({ valid: true, data: req.body });
    }
    else {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};
startServer();
