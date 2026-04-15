import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/monitoraapan.db');

// Criar diretório se não existir
import fs from 'fs';
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Ativar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabelas se não existirem
export const initializeDatabase = () => {
  try {
    // Tabela de alunos
    db.exec(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        curso TEXT NOT NULL,
        nomeResponsavel TEXT NOT NULL,
        emailResponsavel TEXT NOT NULL,
        fotoUrl TEXT NOT NULL,
        fotoPublicId TEXT NOT NULL,
        dataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de cursos
    db.exec(`
      CREATE TABLE IF NOT EXISTS cursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        descricao TEXT,
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Banco de dados SQLite inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

export default db;
