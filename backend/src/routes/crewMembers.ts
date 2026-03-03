import express, { Request, Response } from 'express';
import { CrewMemberRepository } from '../database/crewMemberRepository';

const router = express.Router();
const memberRepo = new CrewMemberRepository();

router.post('/', async (req: Request, res: Response) => {
  try {
    const id = await memberRepo.save(req.body);
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error creating crew member:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await memberRepo.findAll();
    res.json({ success: true, data: members, count: members.length });
  } catch (error) {
    console.error('Error fetching crew members:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await memberRepo.findById(Number(req.params.id));
    if (!member) return res.status(404).json({ success: false, message: 'Crew member not found' });
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error fetching crew member:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const history = await memberRepo.findHistory(Number(req.params.id));
    res.json({ success: true, data: history, count: history.length });
  } catch (error) {
    console.error('Error fetching member history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const member = await memberRepo.update(Number(req.params.id), req.body);
    if (!member) return res.status(404).json({ success: false, message: 'Crew member not found' });
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error updating crew member:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await memberRepo.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: 'Crew member not found' });
    res.json({ success: true, message: 'Crew member deleted' });
  } catch (error) {
    console.error('Error deleting crew member:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
