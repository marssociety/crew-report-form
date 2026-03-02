import express from 'express';
import { Request, Response } from 'express';
import { HsoChecklistRepository, HsoChecklist } from '../database/hsoChecklistRepository';

const router = express.Router();
const hsoChecklistRepo = new HsoChecklistRepository();

// Submit HSO checklist
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: HsoChecklist = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof HsoChecklist]) {
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
    const reportId = await hsoChecklistRepo.save(reportData);

    console.log('[HSO Checklist] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'HSO checklist submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting HSO checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all HSO checklists
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await hsoChecklistRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'HSO checklists retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching HSO checklists:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get HSO checklists by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await hsoChecklistRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `HSO checklists for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching HSO checklists by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific HSO checklist
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await hsoChecklistRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'HSO checklist not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'HSO checklist retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching HSO checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete HSO checklist
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await hsoChecklistRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'HSO checklist not found'
      });
    }

    res.json({
      success: true,
      message: 'HSO checklist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting HSO checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
