import express from 'express';
import { Request, Response } from 'express';
import { JournalistRepository, JournalistReport } from '../database/journalistRepository';

const router = express.Router();
const journalistRepo = new JournalistRepository();

// Submit Journalist report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: JournalistReport = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof JournalistReport]) {
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
    const reportId = await journalistRepo.save(reportData);

    console.log('[Journalist] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Journalist report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Journalist report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Journalist reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await journalistRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Journalist reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Journalist reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Journalist reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await journalistRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Journalist reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Journalist reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Journalist report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await journalistRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Journalist report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Journalist report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Journalist report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Journalist report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await journalistRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Journalist report not found'
      });
    }

    res.json({
      success: true,
      message: 'Journalist report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Journalist report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
