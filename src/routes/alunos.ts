import { Router } from 'express';
import {
  createAluno,
  getAllAlunos,
  getAlunoById,
  updateAluno,
  deleteAluno,
  uploadFoto,
  generateQRCode,
  deleteAlunoQRCode,
  getAlunosComQRCode,
} from '../controllers/alunosController.js';

const router = Router();

// Rota de diagnóstico - listar alunos com QR codes
router.get('/diagnostico/qrcode', getAlunosComQRCode);

// Upload deve vir antes de /:id para evitar conflito
router.post('/upload/foto', uploadFoto);

// Rotas de QR Code
router.post('/:id/qrcode/generate', generateQRCode);
router.delete('/:id/qrcode', deleteAlunoQRCode);

router.post('/', createAluno);
router.get('/', getAllAlunos);
router.get('/:id', getAlunoById);
router.put('/:id', updateAluno);
router.delete('/:id', deleteAluno);

export default router;
