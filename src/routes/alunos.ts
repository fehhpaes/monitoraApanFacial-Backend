import { Router } from 'express';
import {
  createAluno,
  getAllAlunos,
  getAlunoById,
  updateAluno,
  deleteAluno,
  uploadFoto,
} from '../controllers/alunosController.js';

const router = Router();

// Upload deve vir antes de /:id para evitar conflito
router.post('/upload/foto', uploadFoto);

router.post('/', createAluno);
router.get('/', getAllAlunos);
router.get('/:id', getAlunoById);
router.put('/:id', updateAluno);
router.delete('/:id', deleteAluno);

export default router;
