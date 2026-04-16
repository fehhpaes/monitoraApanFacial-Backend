import { Request, Response } from 'express';
import { Presenca } from '../models/Presenca.js';
import { Aluno } from '../models/Aluno.js';

// Registrar presença (entrada ou saída)
export const registrarPresenca = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrData, tipo } = req.body; // tipo: 'entrada' ou 'saida'

    if (!qrData) {
      res.status(400).json({
        success: false,
        message: 'Dados do QR Code são obrigatórios',
      });
      return;
    }

    let alunoData;
    try {
      alunoData = JSON.parse(qrData);
    } catch (parseError) {
      res.status(400).json({
        success: false,
        message: 'Dados do QR Code inválidos',
      });
      return;
    }

    const { _id: alunoId, nome, curso, fotoUrl, emailResponsavel } = alunoData;

    if (!alunoId || !nome || !curso) {
      res.status(400).json({
        success: false,
        message: 'Dados incompletos do QR Code',
      });
      return;
    }

    // Verificar se o aluno existe
    const aluno = await Aluno.findById(alunoId);
    if (!aluno) {
      res.status(404).json({
        success: false,
        message: 'Aluno não encontrado',
      });
      return;
    }

    // Verificar se já existe entrada hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const presencaHoje = await Presenca.findOne({
      alunoId,
      dataEntrada: { $gte: hoje, $lt: amanha },
    });

    let presenca;

    if (!presencaHoje) {
      // Primeira presença do dia = Entrada
      presenca = new Presenca({
        alunoId,
        nome,
        curso,
        fotoUrl,
        emailResponsavel,
        dataEntrada: new Date(),
        status: 'presente',
        dataCriacao: new Date(),
      });
    } else if (!presencaHoje.dataSaida) {
      // Já tem entrada, registrar saída
      presencaHoje.dataSaida = new Date();
      presencaHoje.status = 'saida';
      presenca = presencaHoje;
    } else {
      // Já tem entrada e saída, ignorar novo scan
      res.status(200).json({
        success: true,
        message: 'Presença já registrada para hoje',
        data: presencaHoje,
        alreadyRegistered: true,
      });
      return;
    }

    await presenca.save();

    res.status(201).json({
      success: true,
      message: presencaHoje
        ? presencaHoje.status === 'saida'
          ? 'Saída registrada com sucesso'
          : 'Entrada registrada com sucesso'
        : 'Presença registrada com sucesso',
      data: presenca,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar presença',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Obter presença do dia
export const getPresencaDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { curso } = req.query;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const filtro: any = {
      dataEntrada: { $gte: hoje, $lt: amanha },
    };

    if (curso) {
      filtro.curso = curso;
    }

    const presencas = await Presenca.find(filtro).sort({ dataEntrada: -1 });

    res.status(200).json({
      success: true,
      data: presencas,
      total: presencas.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar presença do dia',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Obter histórico de presença de um aluno
export const getHistoricoAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const historico = await Presenca.find({ alunoId: id }).sort({ dataEntrada: -1 });

    res.status(200).json({
      success: true,
      data: historico,
      total: historico.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de presença',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Obter relatório de presença
export const getRelatorio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataInicio, dataFim, curso } = req.query;

    const filtro: any = {};

    if (dataInicio || dataFim) {
      filtro.dataEntrada = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio as string);
        inicio.setHours(0, 0, 0, 0);
        filtro.dataEntrada.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim as string);
        fim.setHours(23, 59, 59, 999);
        filtro.dataEntrada.$lte = fim;
      }
    }

    if (curso) {
      filtro.curso = curso;
    }

    const relatorio = await Presenca.find(filtro).sort({ dataEntrada: -1 });

    res.status(200).json({
      success: true,
      data: relatorio,
      total: relatorio.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Calcular intervalo de data baseado no período
const calcularIntervaloData = (periodo: string): { dataInicio: Date; dataFim: Date } => {
  const agora = new Date();
  const dataFim = new Date(agora);
  dataFim.setHours(23, 59, 59, 999);

  const dataInicio = new Date(agora);
  dataInicio.setHours(0, 0, 0, 0);

  switch (periodo) {
    case 'hoje':
      break;

    case 'semana':
      dataInicio.setDate(dataInicio.getDate() - 6);
      dataInicio.setHours(0, 0, 0, 0);
      break;

    case 'mes':
      dataInicio.setDate(dataInicio.getDate() - 29);
      dataInicio.setHours(0, 0, 0, 0);
      break;

    case 'bimestre':
      dataInicio.setDate(dataInicio.getDate() - 59);
      dataInicio.setHours(0, 0, 0, 0);
      break;

    case 'trimestre':
      dataInicio.setDate(dataInicio.getDate() - 89);
      dataInicio.setHours(0, 0, 0, 0);
      break;

    case 'semestre':
      dataInicio.setDate(dataInicio.getDate() - 179);
      dataInicio.setHours(0, 0, 0, 0);
      break;

    case 'ano':
      dataInicio.setDate(dataInicio.getDate() - 364);
      dataInicio.setHours(0, 0, 0, 0);
      break;

    default:
      break;
  }

  return { dataInicio, dataFim };
};

// Limpar presenças do dia (para testes)
export const limparPresencaDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { confirmar } = req.query;

    if (confirmar !== 'true') {
      res.status(400).json({
        success: false,
        message: 'Para confirmar a exclusão, adicione ?confirmar=true na URL',
        warning: 'Isso excluirá TODAS as presenças de HOJE!',
      });
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const resultado = await Presenca.deleteMany({
      dataEntrada: { $gte: hoje, $lt: amanha },
    });

    res.status(200).json({
      success: true,
      message: `${resultado.deletedCount} presença(s) excluída(s) com sucesso`,
      deletedCount: resultado.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar presenças',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Obter relatório com filtro por períodos
export const getRelatorioPeriodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodo = 'hoje', curso, alunoId } = req.query;

    // Validar período
    const periodsValidos = ['hoje', 'semana', 'mes', 'bimestre', 'trimestre', 'semestre', 'ano'];
    if (!periodsValidos.includes(periodo as string)) {
      res.status(400).json({
        success: false,
        message: `Período inválido. Valores aceitos: ${periodsValidos.join(', ')}`,
      });
      return;
    }

    const { dataInicio, dataFim } = calcularIntervaloData(periodo as string);

    const filtro: any = {
      dataEntrada: { $gte: dataInicio, $lte: dataFim },
    };

    if (curso) {
      filtro.curso = curso;
    }

    if (alunoId) {
      filtro.alunoId = alunoId;
    }

    let relatorio = await Presenca.find(filtro);

    // Ordenar por curso, depois por nome
    relatorio.sort((a, b) => {
      if (a.curso !== b.curso) {
        return a.curso.localeCompare(b.curso);
      }
      return a.nome.localeCompare(b.nome);
    });

    res.status(200).json({
      success: true,
      data: relatorio,
      total: relatorio.length,
      periodo,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório por períodos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
