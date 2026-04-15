import mongoose, { Schema, Document } from 'mongoose';

export interface ICursoDocument extends Document {
  nome: string;
  descricao?: string;
  dataCriacao: Date;
}

const CursoSchema = new Schema<ICursoDocument>(
  {
    nome: {
      type: String,
      required: [true, 'Nome do curso é obrigatório'],
      unique: true,
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Curso = mongoose.model<ICursoDocument>('Curso', CursoSchema);
