import { Request, Response } from 'express';
import { Curso } from '../models/Curso.js';
import { Aluno } from '../models/Aluno.js';

export const seedCursos = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Contar cursos existentes
    const cursoCount = await Curso.countDocuments();

    if (cursoCount > 0) {
      res.status(200).json({
        success: true,
        message: 'Cursos já existem no banco de dados',
        total: cursoCount,
      });
      return;
    }

    // Lista de cursos padrão para semear
    const cursosPadrao = [
      { nome: 'Desenvolvimento Web' },
      { nome: 'Design' },
      { nome: 'DevOps' },
      { nome: 'Data Science' },
      { nome: 'Mobile' },
      { nome: 'UI/UX' },
    ];

    const cursosInseridos = await Curso.insertMany(cursosPadrao);

    res.status(201).json({
      success: true,
      message: 'Cursos inseridos com sucesso',
      total: cursosInseridos.length,
      data: cursosInseridos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao semear cursos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAlunosCursos = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Buscar todos os cursos únicos dos alunos cadastrados
    const cursosUnicos = await Aluno.distinct('curso');

    res.status(200).json({
      success: true,
      data: cursosUnicos,
      total: cursosUnicos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cursos dos alunos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
