import express, { Request, Response } from 'express';
import { ReportRepository } from '../database/reportRepository';
import { validateSubmission } from '../validation';

const reportRepo = new ReportRepository();

export function createReportRouter(reportType: string, displayName: string): express.Router {
  const router = express.Router();

  // Submit a report
  router.post('/', async (req: Request, res: Response) => {
    try {
      const body = req.body;

      // Ensure report_type is set correctly
      body.report_type = reportType;

      // Validate with AJV
      const validation = validateSubmission(body);
      if (!validation.valid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      const id = await reportRepo.save({
        report_type: reportType,
        title: body.title || `${displayName} Report`,
        author: body.author || '',
        position: body.position || '',
        station: body.station || 'MDRS',
        mission_name: body.mission_name || '',
        crew_number: body.crew_number,
        mission_type: body.mission_type || '',
        mission_start_date: body.mission_start_date || null,
        mission_duration_day: body.mission_duration_day || null,
        report_date: body.report_date,
        sol: body.sol ?? null,
        content: body.content || '',
        report_data: body.role_specific_data || {},
        email_subject: body.email_subject || '',
        email_body: body.email_body || '',
      });

      console.log(`[${displayName}] Report saved:`, {
        id,
        crew: body.crew_number,
        sol: body.sol,
        date: body.report_date,
      });

      res.status(201).json({
        success: true,
        message: `${displayName} report submitted successfully`,
        data: {
          id,
          crewNumber: body.crew_number,
          sol: body.sol,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(`Error submitting ${displayName} report:`, error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get all reports of this type
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const reports = await reportRepo.findByType(reportType);
      res.json({
        success: true,
        data: reports,
        count: reports.length,
        message: `${displayName} reports retrieved successfully`,
      });
    } catch (error) {
      console.error(`Error fetching ${displayName} reports:`, error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get reports by crew number
  router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
    try {
      const { crewNumber } = req.params;
      const reports = await reportRepo.findByTypeAndCrewNumber(reportType, crewNumber);
      res.json({
        success: true,
        data: reports,
        count: reports.length,
        message: `${displayName} reports for crew ${crewNumber} retrieved successfully`,
      });
    } catch (error) {
      console.error(`Error fetching ${displayName} reports by crew:`, error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get specific report by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const report = await reportRepo.findById(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: `${displayName} report not found` });
      }
      res.json({ success: true, data: report, message: `${displayName} report retrieved successfully` });
    } catch (error) {
      console.error(`Error fetching ${displayName} report:`, error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Delete a report
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const deleted = await reportRepo.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: `${displayName} report not found` });
      }
      res.json({ success: true, message: `${displayName} report deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${displayName} report:`, error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  return router;
}
