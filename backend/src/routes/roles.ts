import express, { Request, Response } from 'express';
import { RoleRepository } from '../database/roleRepository';

const router = express.Router();
const roleRepo = new RoleRepository();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const roles = await roleRepo.findAll();
    res.json({ success: true, data: roles, count: roles.length });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const role = await roleRepo.findById(Number(req.params.id));
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
