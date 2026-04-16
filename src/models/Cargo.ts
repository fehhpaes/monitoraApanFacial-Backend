import mongoose, { Schema, Document } from 'mongoose';

export interface ICargoDocument extends Document {
  nome: string;
  dataCriacao: Date;
}

const CargoSchema = new Schema<ICargoDocument>(
  {
    nome: {
      type: String,
      required: [true, 'Nome do cargo é obrigatório'],
      unique: true,
      trim: true,
    },
    dataCriacao: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Cargo = mongoose.model<ICargoDocument>('Cargo', CargoSchema);