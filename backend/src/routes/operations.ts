import express from 'express';
import { Request, Response } from 'express';
import { OperationsRepository, OperationsReport } from '../database/operationsRepository';

const router = express.Router();
const operationsRepo = new OperationsRepository();

// Submit Operations report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: OperationsReport = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof OperationsReport]) {
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
    const reportId = await operationsRepo.save(reportData);

    console.log('[Operations] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Operations report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Operations report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Operations reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await operationsRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Operations reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Operations reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Operations reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await operationsRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Operations reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Operations reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Operations report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await operationsRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Operations report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Operations report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Operations report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Operations report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await operationsRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Operations report not found'
      });
    }

    res.json({
      success: true,
      message: 'Operations report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Operations report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
