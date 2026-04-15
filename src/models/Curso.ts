import mongoose, { Schema, Document } from 'mongoose';

export interface ICursoDocument extends Document {
  nome: string;
  sigla: string;
  tipo: 'modular' | 'integral';
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
    sigla: {
      type: String,
      required: [true, 'Sigla do curso é obrigatória'],
      unique: true,
      trim: true,
      maxlength: [7, 'Sigla não pode exceder 7 caracteres'],
      match: [/^[A-Za-z0-9]+$/, 'Sigla deve conter apenas letras e números'],
    },
    tipo: {
      type: String,
      enum: ['modular', 'integral'],
      default: 'modular',
      required: [true, 'Tipo de curso é obrigatório'],
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Curso = mongoose.model<ICursoDocument>('Curso', CursoSchema);
