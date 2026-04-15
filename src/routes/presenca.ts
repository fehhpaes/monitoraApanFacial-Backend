import { Router } from 'express';
import {
  registrarPresenca,
  getPresencaDia,
  getHistoricoAluno,
  getRelatorio,
  getRelatorioPeriodos,
} from '../controllers/presencaController.js';

const router = Router();

// Registrar presença (entrada/saída automática)
router.post('/registrar', registrarPresenca);

// Obter presenças do dia (com filtro opcional por curso)
router.get('/dia', getPresencaDia);

// Obter histórico de presença de um aluno
router.get('/aluno/:id', getHistoricoAluno);

// Obter relatório (com filtro por data e curso)
router.get('/relatorio', getRelatorio);

// Obter relatório com filtro por períodos (hoje, semana, mês, etc)
router.get('/relatorio-periodos', getRelatorioPeriodos);

export default router;
