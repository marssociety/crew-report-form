import express from 'express';
import { Request, Response } from 'express';
import { AstronomyRepository, AstronomyReport } from '../database/astronomyRepository';

const router = express.Router();
const astronomyRepo = new AstronomyRepository();

// Submit Astronomy report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: AstronomyReport = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof AstronomyReport]) {
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
    const reportId = await astronomyRepo.save(reportData);

    console.log('[Astronomy] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Astronomy report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Astronomy report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Astronomy reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await astronomyRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Astronomy reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Astronomy reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Astronomy reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await astronomyRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Astronomy reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Astronomy reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Astronomy report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await astronomyRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Astronomy report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Astronomy report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Astronomy report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Astronomy report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await astronomyRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Astronomy report not found'
      });
    }

    res.json({
      success: true,
      message: 'Astronomy report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Astronomy report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
