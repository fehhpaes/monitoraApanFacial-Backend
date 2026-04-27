import { Request, Response } from 'express';
import { Presenca } from '../models/Presenca.js';
import { Aluno } from '../models/Aluno.js';
import { Funcionario } from '../models/Funcionario.js';

export const registrarPresenca = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      res.status(400).json({
        success: false,
        message: 'Dados do QR Code são obrigatórios',
      });
      return;
    }

    let pessoaData;
    try {
      pessoaData = JSON.parse(qrData);
    } catch (parseError) {
      res.status(400).json({
        success: false,
        message: 'Dados do QR Code inválidos',
      });
      return;
    }

    const { _id: pessoaId, nome, curso, fotoUrl, emailResponsavel, tipo } = pessoaData;

    if (!pessoaId || !nome || !curso) {
      res.status(400).json({
        success: false,
        message: 'Dados incompletos do QR Code',
      });
      return;
    }

    let presencaTipo: 'aluno' | 'funcionario' = 'aluno';

    if (tipo === 'funcionario') {
      const funcionario = await Funcionario.findById(pessoaId);
      if (!funcionario) {
        res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado',
        });
        return;
      }
      presencaTipo = 'funcionario';
    } else {
      const aluno = await Aluno.findById(pessoaId);
      if (!aluno) {
        res.status(404).json({
          success: false,
          message: 'Aluno não encontrado',
        });
        return;
      }
      presencaTipo = 'aluno';
    }

    // Verificar se já existe um registro hoje para alternar entre entrada e saída
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ultimaPresenca = await Presenca.findOne({
      $or: [
        { alunoId: presencaTipo === 'aluno' ? pessoaId : null },
        { funcionarioId: presencaTipo === 'funcionario' ? pessoaId : null }
      ],
      dataEntrada: { $gte: hoje }
    }).sort({ dataEntrada: -1 });

    const statusFinal = (ultimaPresenca && ultimaPresenca.status === 'presente') 
      ? 'saida' 
      : 'presente';

    const novaPresenca = new Presenca({
      tipo: presencaTipo,
      alunoId: presencaTipo === 'aluno' ? pessoaId : null,
      funcionarioId: presencaTipo === 'funcionario' ? pessoaId : null,
      nome,
      curso,
      fotoUrl,
      emailResponsavel: emailResponsavel || '',
      dataEntrada: new Date(),
      status: statusFinal,
      dataCriacao: new Date(),
    });

    await novaPresenca.save();

    res.status(201).json({
      success: true,
      message: presencaTipo === 'funcionario' 
        ? 'Presença de funcionário registrada com sucesso' 
        : 'Presença registrada com sucesso',
      data: novaPresenca,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar presença',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getPresencaDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { curso, tipo } = req.query;

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

    if (tipo) {
      filtro.tipo = tipo;
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

export const getHistoricoAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const historico = await Presenca.find({ 
      $or: [{ alunoId: id }, { funcionarioId: id }] 
    }).sort({ dataEntrada: -1 });

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

export const getRelatorio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataInicio, dataFim, curso, tipo } = req.query;

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

    if (tipo) {
      filtro.tipo = tipo;
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

export const getRelatorioPeriodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodo = 'hoje', curso, tipo } = req.query;

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

    if (tipo) {
      filtro.tipo = tipo;
    }

    let relatorio = await Presenca.find(filtro);

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