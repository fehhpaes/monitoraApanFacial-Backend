import { Request, Response } from 'express';
import * as jsonStorage from '../services/jsonStorage.js';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

const createAlunoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  curso: z.string().min(1, 'Curso é obrigatório'),
  nomeResponsavel: z.string().min(2, 'Nome do responsável deve ter no mínimo 2 caracteres'),
  emailResponsavel: z.string().email('Email inválido'),
  fotoUrl: z.string().url('URL da foto inválida'),
  fotoPublicId: z.string().min(1, 'ID público da foto é obrigatório'),
});

const updateAlunoSchema = createAlunoSchema.partial();

export const createAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createAlunoSchema.parse(req.body);
    const novoAluno = jsonStorage.createAluno(data);

    res.status(201).json({
      success: true,
      message: 'Aluno cadastrado com sucesso',
      data: novoAluno,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar aluno',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

export const getAllAlunos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alunos = jsonStorage.readAlunos().sort((a: any, b: any) => {
      return new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime();
    });

    res.status(200).json({
      success: true,
      data: alunos,
      total: alunos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar alunos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAlunoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const aluno = jsonStorage.getAlunoById(id);

    if (!aluno) {
      res.status(404).json({
        success: false,
        message: 'Aluno não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: aluno,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aluno',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateAlunoSchema.parse(req.body);

    // Se uma nova foto foi enviada, deletar a antiga do Cloudinary
    if (data.fotoPublicId) {
      const alunoAntigo = jsonStorage.getAlunoById(id);
      if (alunoAntigo?.fotoPublicId && alunoAntigo.fotoPublicId !== data.fotoPublicId) {
        try {
          await cloudinary.uploader.destroy(alunoAntigo.fotoPublicId);
        } catch (deleteError) {
          console.error('Erro ao deletar foto antiga do Cloudinary:', deleteError);
        }
      }
    }

    const alunoAtualizado = jsonStorage.updateAluno(id, data);

    if (!alunoAtualizado) {
      res.status(404).json({
        success: false,
        message: 'Aluno não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Aluno atualizado com sucesso',
      data: alunoAtualizado,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar aluno',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

export const deleteAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const aluno = jsonStorage.getAlunoById(id);

    if (!aluno) {
      res.status(404).json({
        success: false,
        message: 'Aluno não encontrado',
      });
      return;
    }

    // Deletar foto do Cloudinary
    if (aluno.fotoPublicId) {
      try {
        await cloudinary.uploader.destroy(aluno.fotoPublicId);
      } catch (deleteError) {
        console.error('Erro ao deletar foto do Cloudinary:', deleteError);
      }
    }

    jsonStorage.deleteAluno(id);

    res.status(200).json({
      success: true,
      message: 'Aluno deletado com sucesso',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar aluno',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Upload de foto para Cloudinary
export const uploadFoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.foto) {
      res.status(400).json({
        success: false,
        message: 'Nenhuma foto foi enviada',
      });
      return;
    }

    // Upload para Cloudinary
    const result = await cloudinary.uploader.upload(req.body.foto, {
      folder: 'monitoraapan/alunos',
      resource_type: 'auto',
      quality: 'auto',
      transformation: [{ width: 500, height: 500, crop: 'thumb', gravity: 'face' }],
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da foto',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
