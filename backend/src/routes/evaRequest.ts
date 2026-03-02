import express from 'express';
import { Request, Response } from 'express';
import { EvaRequestRepository, EvaRequest } from '../database/evaRequestRepository';

const router = express.Router();
const evaRequestRepo = new EvaRequestRepository();

// Submit EVA request
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: EvaRequest = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol', 'evaNumber'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof EvaRequest]) {
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
    const reportId = await evaRequestRepo.save(reportData);

    console.log('[EVA Request] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'EVA request submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting EVA request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all EVA requests
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await evaRequestRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'EVA requests retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching EVA requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get EVA requests by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await evaRequestRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `EVA requests for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching EVA requests by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific EVA request
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await evaRequestRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'EVA request not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'EVA request retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching EVA request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete EVA request
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await evaRequestRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'EVA request not found'
      });
    }

    res.json({
      success: true,
      message: 'EVA request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting EVA request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
