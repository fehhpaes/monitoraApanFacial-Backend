import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Funcionario } from '../models/Funcionario.js';
import { z } from 'zod';
import { generateQRCodeForStudent, deleteQRCode as deleteQRCodeUtil } from '../utils/qrcodeGenerator.js';

const createFuncionarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  fotoUrl: z.string().url('URL da foto inválida'),
  fotoPublicId: z.string().min(1, 'ID público da foto é obrigatório'),
});

const updateFuncionarioSchema = createFuncionarioSchema.partial();

export const createFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createFuncionarioSchema.parse(req.body);

    const novoFuncionario = new Funcionario({
      ...data,
      dataCadastro: new Date(),
      dataAtualizacao: new Date(),
    });

    await novoFuncionario.save();

    res.status(201).json({
      success: true,
      message: 'Funcionário cadastrado com sucesso',
      data: novoFuncionario,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.issues,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao cadastrar funcionário',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

export const getAllFuncionarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const funcionarios = await Funcionario.find().sort({ dataCadastro: -1 });

    res.status(200).json({
      success: true,
      data: funcionarios,
      total: funcionarios.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar funcionários',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getFuncionarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const funcionario = await Funcionario.findById(id);

    if (!funcionario) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: funcionario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar funcionário',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateFuncionarioSchema.parse(req.body);

    if (data.fotoPublicId) {
      const funcionarioAntigo = await Funcionario.findById(id);
      if (funcionarioAntigo?.fotoPublicId && funcionarioAntigo.fotoPublicId !== data.fotoPublicId) {
        try {
          await cloudinary.uploader.destroy(funcionarioAntigo.fotoPublicId);
        } catch (deleteError) {
          console.error('Erro ao deletar foto antiga do Cloudinary:', deleteError);
        }
      }
    }

    const functorioAtualizado = await Funcionario.findByIdAndUpdate(
      id,
      { ...data, dataAtualizacao: new Date() },
      { new: true, runValidators: true }
    );

    if (!functorioAtualizado) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Funcionário atualizado com sucesso',
      data: functorioAtualizado,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.issues,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar funcionário',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

export const deleteFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const functorio = await Funcionario.findByIdAndDelete(id);

    if (!functorio) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    if (functorio.fotoPublicId) {
      try {
        await cloudinary.uploader.destroy(functorio.fotoPublicId);
      } catch (deleteError) {
        console.error('Erro ao deletar foto do Cloudinary:', deleteError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Funcionário deletado com sucesso',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar funcionário',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const uploadFoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.foto) {
      res.status(400).json({
        success: false,
        message: 'Nenhuma foto foi enviada',
      });
      return;
    }

    const result = await cloudinary.uploader.upload(req.body.foto, {
      folder: 'monitoraapan/funcionarios',
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

export const generateQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const functorio = await Funcionario.findById(id);

    if (!functorio) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    if (functorio.qrCodePublicId) {
      try {
        await deleteQRCodeUtil(functorio.qrCodePublicId);
      } catch (error) {
        console.error('Erro ao deletar QR Code antigo:', error);
      }
    }

    const qrCodeData = await generateQRCodeForStudent({
      _id: functorio._id.toString(),
      nome: functorio.nome,
      curso: functorio.cargo,
      fotoUrl: functorio.fotoUrl,
      emailResponsavel: '',
      tipo: 'funcionario',
    });

    const functorioAtualizado = await Funcionario.findByIdAndUpdate(
      id,
      {
        qrCodeUrl: qrCodeData?.qrCodeUrl,
        qrCodePublicId: qrCodeData?.qrCodePublicId,
        qrCodeGerado: true,
        dataAtualizacao: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'QR Code gerado com sucesso',
      data: {
        qrCodeUrl: functorioAtualizado?.qrCodeUrl,
        qrCodeGerado: functorioAtualizado?.qrCodeGerado,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar QR Code',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteQRCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const functorio = await Funcionario.findById(id);

    if (!functorio) {
      res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado',
      });
      return;
    }

    if (!functorio.qrCodePublicId) {
      res.status(400).json({
        success: false,
        message: 'Este funcionário não possui QR Code',
      });
      return;
    }

    await deleteQRCodeUtil(functorio.qrCodePublicId);

    const functorioAtualizado = await Funcionario.findByIdAndUpdate(
      id,
      {
        qrCodeUrl: null,
        qrCodePublicId: null,
        qrCodeGerado: false,
        dataAtualizacao: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'QR Code deletado com sucesso',
      data: functorioAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar QR Code',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getFuncionariosComQRCode = async (_req: Request, res: Response): Promise<void> => {
  try {
    const funcComQR = await Funcionario.find({ qrCodeGerado: true }).select(
      'nome cargo qrCodeUrl qrCodeGerado dataAtualizacao'
    );

    const funcSemQR = await Funcionario.find({ qrCodeGerado: false }).select(
      'nome cargo qrCodeGerado dataCadastro'
    );

    const totalFuncionarios = await Funcionario.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Diagnóstico de QR Codes',
      data: {
        totalFuncionarios,
        comQRCode: funcComQR,
        semQRCode: funcSemQR,
        estatisticas: {
          total: totalFuncionarios,
          comQRCode: funcComQR.length,
          semQRCode: funcSemQR.length,
          percentualGerado: totalFuncionarios > 0
            ? Math.round((funcComQR.length / totalFuncionarios) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar diagnóstico',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};