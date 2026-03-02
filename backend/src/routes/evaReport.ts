import express from 'express';
import { Request, Response } from 'express';
import { EvaReportRepository, EvaReport } from '../database/evaReportRepository';

const router = express.Router();
const evaReportRepo = new EvaReportRepository();

// Submit EVA report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: EvaReport = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol', 'evaNumber'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof EvaReport]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Validate numeric fields
    if (reportData.sol < 1) {
      return res.status(400).json({
        success: false,
        message: 'Sol must be a positive number'
      });
    }

    // Save to database
    const reportId = await evaReportRepo.save(reportData);

    console.log('[EVA Report] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'EVA report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting EVA report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all EVA reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await evaReportRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'EVA reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching EVA reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get EVA reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await evaReportRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `EVA reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching EVA reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific EVA report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await evaReportRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'EVA report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'EVA report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching EVA report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete EVA report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await evaReportRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'EVA report not found'
      });
    }

    res.json({
      success: true,
      message: 'EVA report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting EVA report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
