"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const schema_json_1 = __importDefault(require("./schema.json"));
const database_1 = __importDefault(require("./database/database"));
const crewReportRepository_1 = __importDefault(require("./database/crewReportRepository"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const ajv = new ajv_1.default({
    allErrors: true,
    validateSchema: false,
    addUsedSchema: false
});
(0, ajv_formats_1.default)(ajv);
const validate = ajv.compile(schema_json_1.default);
// Initialize database
const db = database_1.default.getInstance();
const crewReportRepo = new crewReportRepository_1.default();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/api/schema', (req, res) => {
    res.json(schema_json_1.default);
});
app.post('/api/validate', (req, res) => {
    const valid = validate(req.body);
    if (valid) {
        res.json({ valid: true, data: req.body });
    }
    else {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};
startServer();
