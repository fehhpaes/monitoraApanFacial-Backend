import { Request, Response } from 'express';
import { Curso } from '../models/Curso.js';

export const getAllCursos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });

    res.status(200).json({
      success: true,
      data: cursos,
      total: cursos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cursos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, sigla, tipo } = req.body;

    // Validação básica
    if (!nome || !sigla || !tipo) {
      res.status(400).json({
        success: false,
        message: 'Nome, sigla e tipo do curso são obrigatórios',
      });
      return;
    }

    if (!['modular', 'integral'].includes(tipo)) {
      res.status(400).json({
        success: false,
        message: 'Tipo deve ser "modular" ou "integral"',
      });
      return;
    }

    // Verificar se curso com mesmo nome ou sigla já existe
    const cursoExistente = await Curso.findOne({ $or: [{ nome }, { sigla }] });
    if (cursoExistente) {
      res.status(400).json({
        success: false,
        message: 'Curso com este nome ou sigla já existe',
      });
      return;
    }

    const novoCurso = new Curso({ nome, sigla, tipo, dataCriacao: new Date() });
    await novoCurso.save();

    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: novoCurso,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar curso',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
