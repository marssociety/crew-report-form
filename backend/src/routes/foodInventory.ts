import express from 'express';
import { Request, Response } from 'express';
import { FoodInventoryRepository, FoodInventory } from '../database/foodInventoryRepository';

const router = express.Router();
const foodInventoryRepo = new FoodInventoryRepository();

// Submit Food Inventory report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: FoodInventory = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof FoodInventory]) {
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
    const reportId = await foodInventoryRepo.save(reportData);

    console.log('[Food Inventory] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Food Inventory report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Food Inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Food Inventory reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await foodInventoryRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Food Inventory reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Food Inventory reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Food Inventory reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await foodInventoryRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Food Inventory reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Food Inventory reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Food Inventory report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await foodInventoryRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Food Inventory report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Food Inventory report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Food Inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Food Inventory report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await foodInventoryRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Food Inventory report not found'
      });
    }

    res.json({
      success: true,
      message: 'Food Inventory report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Food Inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
