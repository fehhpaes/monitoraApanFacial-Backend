import { Router } from 'express';
import {
  createFuncionario,
  getAllFuncionarios,
  getFuncionarioById,
  updateFuncionario,
  deleteFuncionario,
  uploadFoto,
  generateQRCode,
  deleteQRCode,
  getFuncionariosComQRCode,
} from '../controllers/funcionariosController.js';

const router = Router();

router.get('/diagnostico/qrcode', getFuncionariosComQRCode);

router.post('/upload/foto', uploadFoto);

router.post('/:id/qrcode/generate', generateQRCode);
router.delete('/:id/qrcode', deleteQRCode);

router.post('/', createFuncionario);
router.get('/', getAllFuncionarios);
router.get('/:id', getFuncionarioById);
router.put('/:id', updateFuncionario);
router.delete('/:id', deleteFuncionario);

export default router;