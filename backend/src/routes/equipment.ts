import express, { Request, Response } from 'express';
import { EquipmentRepository } from '../database/equipmentRepository';

const router = express.Router();
const equipmentRepo = new EquipmentRepository();

router.post('/', async (req: Request, res: Response) => {
  try {
    const id = await equipmentRepo.save(req.body);
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const equipment = await equipmentRepo.findAll();
    res.json({ success: true, data: equipment, count: equipment.length });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await equipmentRepo.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await equipmentRepo.update(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await equipmentRepo.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, message: 'Equipment deleted' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
