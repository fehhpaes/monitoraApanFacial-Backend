import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const ALUNOS_FILE = path.join(DATA_DIR, 'alunos.json');
const CURSOS_FILE = path.join(DATA_DIR, 'cursos.json');

// Garantir que o diretório existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializar arquivos se não existirem
const initializeFiles = () => {
  if (!fs.existsSync(ALUNOS_FILE)) {
    fs.writeFileSync(ALUNOS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(CURSOS_FILE)) {
    fs.writeFileSync(CURSOS_FILE, JSON.stringify([], null, 2));
  }
};

initializeFiles();

// Funções para alunos
export const readAlunos = () => {
  try {
    const data = fs.readFileSync(ALUNOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const writeAlunos = (alunos: any[]) => {
  fs.writeFileSync(ALUNOS_FILE, JSON.stringify(alunos, null, 2));
};

export const createAluno = (aluno: any) => {
  const alunos = readAlunos();
  const novoAluno = {
    _id: Date.now().toString(),
    ...aluno,
    dataCadastro: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  };
  alunos.push(novoAluno);
  writeAlunos(alunos);
  return novoAluno;
};

export const updateAluno = (id: string, data: any) => {
  const alunos = readAlunos();
  const index = alunos.findIndex((a: any) => a._id === id);
  if (index === -1) return null;
  alunos[index] = { ...alunos[index], ...data, dataAtualizacao: new Date().toISOString() };
  writeAlunos(alunos);
  return alunos[index];
};

export const deleteAluno = (id: string) => {
  const alunos = readAlunos();
  const index = alunos.findIndex((a: any) => a._id === id);
  if (index === -1) return false;
  alunos.splice(index, 1);
  writeAlunos(alunos);
  return true;
};

export const getAlunoById = (id: string) => {
  const alunos = readAlunos();
  return alunos.find((a: any) => a._id === id) || null;
};

// Funções para cursos
export const readCursos = () => {
  try {
    const data = fs.readFileSync(CURSOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const writeCursos = (cursos: any[]) => {
  fs.writeFileSync(CURSOS_FILE, JSON.stringify(cursos, null, 2));
};

export const createCurso = (nome: string, descricao?: string) => {
  const cursos = readCursos();
  if (cursos.find((c: any) => c.nome === nome)) {
    return null;
  }
  const novoCurso = {
    _id: Date.now().toString(),
    nome,
    descricao,
    dataCriacao: new Date().toISOString(),
  };
  cursos.push(novoCurso);
  writeCursos(cursos);
  return novoCurso;
};
