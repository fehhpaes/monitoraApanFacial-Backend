import { Router } from 'express';
import { getAllCursos, createCurso } from '../controllers/cursosController.js';

const router = Router();

router.get('/', getAllCursos);
router.post('/', createCurso);

export default router;
