import mongoose, { Schema, Document } from 'mongoose';

export interface IAlunoDocument extends Document {
  nome: string;
  curso: string;
  nomeResponsavel: string;
  emailResponsavel: string;
  fotoUrl: string;
  fotoPublicId: string;
  dataCadastro: Date;
  dataAtualizacao: Date;
}

const AlunoSchema = new Schema<IAlunoDocument>(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter no mínimo 2 caracteres'],
    },
    curso: {
      type: String,
      required: [true, 'Curso é obrigatório'],
      trim: true,
    },
    nomeResponsavel: {
      type: String,
      required: [true, 'Nome do responsável é obrigatório'],
      trim: true,
      minlength: [2, 'Nome do responsável deve ter no mínimo 2 caracteres'],
    },
    emailResponsavel: {
      type: String,
      required: [true, 'Email do responsável é obrigatório'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    fotoUrl: {
      type: String,
      required: [true, 'Foto é obrigatória'],
    },
    fotoPublicId: {
      type: String,
      required: true,
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

export const Aluno = mongoose.model<IAlunoDocument>('Aluno', AlunoSchema);
