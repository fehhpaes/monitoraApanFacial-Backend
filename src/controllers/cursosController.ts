import { Request, Response } from 'express';
import { Curso } from '../models/Curso.js';
import { Aluno } from '../models/Aluno.js';

export const getAllCursos = async (_req: Request, res: Response): Promise<void> => {
  try {
    let cursos = await Curso.find().sort({ nome: 1 });

    // Se não houver cursos registrados, obter dos alunos existentes
    if (cursos.length === 0) {
      const cursosDosBancos = await Aluno.distinct('curso').sort();
      
      // Criar objetos de curso a partir dos cursos dos alunos
      cursos = cursosDosBancos.map((nome: string) => ({
        _id: undefined,
        nome,
        descricao: '',
        dataCriacao: new Date(),
      })) as any;
    }

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
    const { nome, descricao } = req.body;

    if (!nome) {
      res.status(400).json({
        success: false,
        message: 'Nome do curso é obrigatório',
      });
      return;
    }

    const cursoExistente = await Curso.findOne({ nome });
    if (cursoExistente) {
      res.status(400).json({
        success: false,
        message: 'Curso com este nome já existe',
      });
      return;
    }

    const novoCurso = new Curso({ nome, descricao });
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
