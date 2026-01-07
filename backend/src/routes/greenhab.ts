import express from 'express';
import { Request, Response } from 'express';
import { GreenHabRepository, GreenHabReport } from '../database/greenhabRepository';

const router = express.Router();
const greenhabRepo = new GreenHabRepository();

// Submit GreenHab report
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: GreenHabReport = req.body;

    // Basic validation
    const requiredFields = [
      'crewNumber', 'position', 'reportPreparedBy', 'reportDate', 'sol',
      'environmentalControl', 'avgTemperature', 'maxTemperature', 
      'minTemperature', 'supplementalLightHours', 'dailyWaterUsageCrops',
      'blueTankRemaining', 'narrative'
    ];

    for (const field of requiredFields) {
      if (!reportData[field as keyof GreenHabReport]) {
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

    if (reportData.blueTankRemaining < 0 || reportData.blueTankRemaining > 200) {
      return res.status(400).json({
        success: false,
        message: 'Blue tank remaining must be between 0 and 200 gallons'
      });
    }

    if (reportData.supplementalLightHours < 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplemental light hours must be non-negative'
      });
    }

    // Save to database
    const reportId = await greenhabRepo.save(reportData);

    console.log('GreenHab Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.reportPreparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'GreenHab report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting GreenHab report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all GreenHab reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await greenhabRepo.findAll();
    
    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'GreenHab reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching GreenHab reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get GreenHab reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await greenhabRepo.findByCrewNumber(crewNumber);
    
    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `GreenHab reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching GreenHab reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific GreenHab report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await greenhabRepo.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'GreenHab report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'GreenHab report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching GreenHab report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete GreenHab report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await greenhabRepo.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'GreenHab report not found'
      });
    }

    res.json({
      success: true,
      message: 'GreenHab report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting GreenHab report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;