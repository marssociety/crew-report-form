import express, { Request, Response } from 'express';
import { CrewAssignmentRepository } from '../database/crewAssignmentRepository';

const router = express.Router();
const assignmentRepo = new CrewAssignmentRepository();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { crew_id, crew_member_id, role_id } = req.body;
    if (!crew_id || !crew_member_id || !role_id) {
      return res.status(400).json({ success: false, message: 'crew_id, crew_member_id, and role_id are required' });
    }
    const id = await assignmentRepo.save({ crew_id, crew_member_id, role_id });
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error creating crew assignment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/crew/:crewId', async (req: Request, res: Response) => {
  try {
    const assignments = await assignmentRepo.findByCrewId(Number(req.params.crewId));
    res.json({ success: true, data: assignments, count: assignments.length });
  } catch (error) {
    console.error('Error fetching crew assignments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const assignments = await assignmentRepo.findByMemberId(Number(req.params.memberId));
    res.json({ success: true, data: assignments, count: assignments.length });
  } catch (error) {
    console.error('Error fetching member assignments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await assignmentRepo.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting crew assignment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
