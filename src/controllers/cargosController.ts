import { Request, Response } from 'express';
import { Cargo } from '../models/Cargo.js';

export const getAllCargos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cargos = await Cargo.find().sort({ nome: 1 });

    res.status(200).json({
      success: true,
      data: cargos,
      total: cargos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cargos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createCargo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome } = req.body;

    if (!nome) {
      res.status(400).json({
        success: false,
        message: 'Nome do cargo é obrigatório',
      });
      return;
    }

    const cargoExistente = await Cargo.findOne({ nome: nome.trim() });
    if (cargoExistente) {
      res.status(400).json({
        success: false,
        message: 'Cargo com este nome já existe',
      });
      return;
    }

    const novoCargo = new Cargo({ nome: nome.trim(), dataCriacao: new Date() });
    await novoCargo.save();

    res.status(201).json({
      success: true,
      message: 'Cargo criado com sucesso',
      data: novoCargo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cargo',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteCargo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cargo = await Cargo.findByIdAndDelete(id);

    if (!cargo) {
      res.status(404).json({
        success: false,
        message: 'Cargo não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cargo deletado com sucesso',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cargo',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};