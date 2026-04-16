import mongoose, { Schema, Document } from 'mongoose';

export interface IPresencaDocument extends Document {
  tipo: 'aluno' | 'funcionario';
  alunoId?: string;
  funcionarioId?: string;
  nome: string;
  curso: string;
  fotoUrl: string;
  emailResponsavel?: string;
  dataEntrada: Date;
  dataSaida?: Date;
  status: 'presente' | 'atrasado' | 'saida';
  dataCriacao: Date;
}

const PresencaSchema = new Schema<IPresencaDocument>(
  {
    tipo: {
      type: String,
      enum: ['aluno', 'funcionario'],
      required: true,
      default: 'aluno',
      index: true,
    },
    alunoId: {
      type: String,
      default: null,
      index: true,
    },
    funcionarioId: {
      type: String,
      default: null,
      index: true,
    },
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    curso: {
      type: String,
      required: [true, 'Curso/Cargo é obrigatório'],
      trim: true,
      index: true,
    },
    fotoUrl: {
      type: String,
      required: true,
    },
    emailResponsavel: {
      type: String,
      default: '',
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