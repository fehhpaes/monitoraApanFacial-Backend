import { Router } from 'express';
import {
  registrarPresenca,
  getPresencaDia,
  getHistoricoAluno,
  getRelatorio,
  getRelatorioPeriodos,
  limparPresencaDia,
} from '../controllers/presencaController.js';

const router = Router();

// Registrar presença (entrada/saída automática)
router.post('/registrar', registrarPresenca);

// Obter presenças do dia (com filtro opcional por curso)
router.get('/dia', getPresencaDia);

// Limpar presenças do dia (para testes)
router.delete('/dia', limparPresencaDia);

// Obter histórico de presença de um aluno
router.get('/aluno/:id', getHistoricoAluno);

// Obter relatório (com filtro por data e curso)
router.get('/relatorio', getRelatorio);

// Obter relatório com filtro por períodos (hoje, semana, mês, etc)
router.get('/relatorio-periodos', getRelatorioPeriodos);

export default router;
