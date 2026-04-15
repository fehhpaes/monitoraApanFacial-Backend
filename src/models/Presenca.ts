import mongoose, { Schema, Document } from 'mongoose';

export interface IPresencaDocument extends Document {
  alunoId: string;
  nome: string;
  curso: string;
  fotoUrl: string;
  emailResponsavel: string;
  dataEntrada: Date;
  dataSaida?: Date;
  status: 'presente' | 'atrasado' | 'saida';
  dataCriacao: Date;
}

const PresencaSchema = new Schema<IPresencaDocument>(
  {
    alunoId: {
      type: String,
      required: [true, 'ID do aluno é obrigatório'],
      index: true,
    },
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    curso: {
      type: String,
      required: [true, 'Curso é obrigatório'],
      trim: true,
      index: true,
    },
    fotoUrl: {
      type: String,
      required: true,
    },
    emailResponsavel: {
      type: String,
      required: true,
    },
    dataEntrada: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dataSaida: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['presente', 'atrasado', 'saida'],
      default: 'presente',
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const Presenca = mongoose.model<IPresencaDocument>('Presenca', PresencaSchema);
