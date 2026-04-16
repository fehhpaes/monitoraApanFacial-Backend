import mongoose, { Schema, Document } from 'mongoose';

export interface IFuncionarioDocument extends Document {
  nome: string;
  cargo: string;
  fotoUrl: string;
  fotoPublicId: string;
  qrCodeUrl?: string;
  qrCodePublicId?: string;
  qrCodeGerado: boolean;
  dataCadastro: Date;
  dataAtualizacao: Date;
}

const FuncionarioSchema = new Schema<IFuncionarioDocument>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
    },
    cargo: {
      type: String,
      required: [true, 'Cargo é obrigatório'],
      trim: true,
    },
    fotoUrl: {
      type: String,
      required: [true, 'Foto é obrigatória'],
    },
    fotoPublicId: {
      type: String,
      required: true,
    },
    qrCodeUrl: {
      type: String,
      default: null,
    },
    qrCodePublicId: {
      type: String,
      default: null,
    },
    qrCodeGerado: {
      type: Boolean,
      default: false,
    },
    dataCadastro: {
      type: Date,
      default: Date.now,
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Funcionario = mongoose.model<IFuncionarioDocument>('Funcionario', FuncionarioSchema);