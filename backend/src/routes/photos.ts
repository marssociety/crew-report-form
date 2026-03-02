import express from 'express';
import { Request, Response } from 'express';
import { PhotosRepository, PhotosReport } from '../database/photosRepository';

const router = express.Router();
const photosRepo = new PhotosRepository();

// Submit Photos report
// Note: For now, handles photos as JSON data (filename, caption).
// File upload with multer will be added later.
router.post('/', async (req: Request, res: Response) => {
  try {
    const reportData: PhotosReport = req.body;

    // Basic validation
    const requiredFields = ['crewNumber', 'preparedBy', 'reportDate', 'sol'];

    for (const field of requiredFields) {
      if (!reportData[field as keyof PhotosReport]) {
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
    const reportId = await photosRepo.save(reportData);

    console.log('[Photos] Report Saved:', {
      id: reportId,
      crew: reportData.crewNumber,
      sol: reportData.sol,
      preparedBy: reportData.preparedBy,
      date: reportData.reportDate
    });

    res.status(201).json({
      success: true,
      message: 'Photos report submitted successfully',
      data: {
        id: reportId,
        crewNumber: reportData.crewNumber,
        sol: reportData.sol,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error submitting Photos report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all Photos reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await photosRepo.findAll();

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: 'Photos reports retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Photos reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Photos reports by crew number
router.get('/crew/:crewNumber', async (req: Request, res: Response) => {
  try {
    const { crewNumber } = req.params;
    const reports = await photosRepo.findByCrewNumber(crewNumber);

    res.json({
      success: true,
      data: reports,
      count: reports.length,
      message: `Photos reports for crew ${crewNumber} retrieved successfully`
    });
  } catch (error) {
    console.error('Error fetching Photos reports by crew:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific Photos report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await photosRepo.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Photos report not found'
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'Photos report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching Photos report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete Photos report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await photosRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Photos report not found'
      });
    }

    res.json({
      success: true,
      message: 'Photos report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Photos report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
