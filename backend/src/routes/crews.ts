import express, { Request, Response } from 'express';
import { CrewRepository } from '../database/crewRepository';
import { ReportRepository } from '../database/reportRepository';

const router = express.Router();
const crewRepo = new CrewRepository();
const reportRepo = new ReportRepository();

router.post('/', async (req: Request, res: Response) => {
  try {
    const id = await crewRepo.save(req.body);
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error creating crew:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const crews = await crewRepo.findAll();
    res.json({ success: true, data: crews, count: crews.length });
  } catch (error) {
    console.error('Error fetching crews:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/number/:crewNumber', async (req: Request, res: Response) => {
  try {
    const crew = await crewRepo.findByCrewNumber(req.params.crewNumber);
    if (!crew) return res.status(404).json({ success: false, message: 'Crew not found' });
    res.json({ success: true, data: crew });
  } catch (error) {
    console.error('Error fetching crew:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const crew = await crewRepo.findById(Number(req.params.id));
    if (!crew) return res.status(404).json({ success: false, message: 'Crew not found' });
    res.json({ success: true, data: crew });
  } catch (error) {
    console.error('Error fetching crew:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id/roster', async (req: Request, res: Response) => {
  try {
    const roster = await crewRepo.findRoster(Number(req.params.id));
    res.json({ success: true, data: roster, count: roster.length });
  } catch (error) {
    console.error('Error fetching crew roster:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id/reports', async (req: Request, res: Response) => {
  try {
    const reports = await reportRepo.findByCrewId(Number(req.params.id));
    res.json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    console.error('Error fetching crew reports:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const crew = await crewRepo.update(Number(req.params.id), req.body);
    if (!crew) return res.status(404).json({ success: false, message: 'Crew not found' });
    res.json({ success: true, data: crew });
  } catch (error) {
    console.error('Error updating crew:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await crewRepo.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: 'Crew not found' });
    res.json({ success: true, message: 'Crew deleted' });
  } catch (error) {
    console.error('Error deleting crew:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
