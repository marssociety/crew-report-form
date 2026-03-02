import express from 'express';
import { Request, Response } from 'express';
import { SolSummaryRepository, SolSummaryReport } from '../database/solSummaryRepository';

const router = express.Router();
const solSummaryRepo = new SolSummaryRepository();

// Submit Sol Summary report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: SolSummaryReport = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof SolSummaryReport]) {
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
    const reportId = await solSummaryRepo.save(reportData);

    console.log('[Sol Summary] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Sol Summary report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Sol Summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Sol Summary reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await solSummaryRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Sol Summary reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Sol Summary reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Sol Summary reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await solSummaryRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Sol Summary reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Sol Summary reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Sol Summary report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await solSummaryRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Sol Summary report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Sol Summary report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Sol Summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Sol Summary report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await solSummaryRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sol Summary report not found'
      });
    }

    res.json({
      success: true,
      message: 'Sol Summary report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Sol Summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
