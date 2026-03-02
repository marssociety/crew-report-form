import express from 'express';
import { Request, Response } from 'express';
import { CheckoutRepository, CheckoutChecklist } from '../database/checkoutRepository';

const router = express.Router();
const checkoutRepo = new CheckoutRepository();

// Submit Checkout checklist
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: CheckoutChecklist = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof CheckoutChecklist]) {
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
    const reportId = await checkoutRepo.save(reportData);

    console.log('[Checkout] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Checkout checklist submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Checkout checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Checkout checklists
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await checkoutRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Checkout checklists retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Checkout checklists:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Checkout checklists by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await checkoutRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Checkout checklists for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Checkout checklists by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Checkout checklist
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await checkoutRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Checkout checklist not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Checkout checklist retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Checkout checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Checkout checklist
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await checkoutRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Checkout checklist not found'
      });
    }

    res.json({
      success: true,
      message: 'Checkout checklist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Checkout checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
