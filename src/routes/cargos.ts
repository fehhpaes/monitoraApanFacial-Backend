import { Router } from 'express';
import {
  getAllCargos,
  createCargo,
  deleteCargo,
} from '../controllers/cargosController.js';

const router = Router();

router.get('/', getAllCargos);
router.post('/', createCargo);
router.delete('/:id', deleteCargo);

export default router;