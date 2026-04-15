import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import alunosRouter from './routes/alunosOffline.js';
import * as jsonStorage from './services/jsonStorage.js';

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',      // Vite dev server (padrão)
    'http://localhost:3000',      // Alternativa dev
    'http://localhost:5000',      // Backend local
    'https://monitoraapanfacial-backend.onrender.com',
    'https://monitoraapan.vercel.app',  // Vercel frontend
    process.env.FRONTEND_URL,     // URL do frontend (se definida)
  ].filter((url): url is string => Boolean(url)),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Tentar conectar ao MongoDB, se falhar usar JSON local
let mongoConnected = false;

try {
  configureCloudinary();
  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.error('❌ Falha ao configurar Cloudinary:', error);
}

// Tentar conexão MongoDB (não-bloqueante)
import { connectDB } from './config/mongodb.js';
connectDB().then(() => {
  mongoConnected = true;
  console.log('✅ MongoDB conectado com sucesso');
}).catch((error) => {
  mongoConnected = false;
  console.warn('⚠️ MongoDB não disponível, usando armazenamento local (JSON)');
  console.warn('📝 Dados serão salvos em: backend/data/alunos.json');
});

// Rotas
app.use('/api/alunos', alunosRouter);

// Rota de cursos (offline)
app.get('/api/cursos', (_req, res) => {
  try {
    const cursos = jsonStorage.readCursos();
    res.status(200).json({
      success: true,
      data: cursos,
      total: cursos.length,
      mode: mongoConnected ? 'MongoDB' : 'Local (JSON)',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cursos',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/api/cursos', (req, res) => {
  try {
    const { nome, sigla, tipo } = req.body;

    if (!nome) {
      res.status(400).json({
        success: false,
        message: 'Nome do curso é obrigatório',
      });
      return;
    }

    if (!sigla) {
      res.status(400).json({
        success: false,
        message: 'Sigla do curso é obrigatória',
      });
      return;
    }

    if (sigla.length > 7) {
      res.status(400).json({
        success: false,
        message: 'Sigla não pode exceder 7 caracteres',
      });
      return;
    }

    if (!tipo || !['modular', 'integral'].includes(tipo)) {
      res.status(400).json({
        success: false,
        message: 'Tipo deve ser "modular" ou "integral"',
      });
      return;
    }

    const novoCurso = jsonStorage.createCurso(nome, sigla, tipo);
    
    if (!novoCurso) {
      res.status(400).json({
        success: false,
        message: 'Curso com este nome ou sigla já existe',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: novoCurso,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar curso',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor está funcionando',
    mode: mongoConnected ? 'MongoDB Online' : 'Local Mode (JSON)',
    timestamp: new Date().toISOString(),
  });
});

// Status do banco
app.get('/status/db', (_req, res) => {
  res.status(200).json({
    success: true,
    mongoConnected,
    mode: mongoConnected ? 'MongoDB Atlas' : 'Armazenamento Local (JSON)',
    message: mongoConnected 
      ? 'Conectado ao MongoDB Atlas' 
      : 'Usando armazenamento local - os dados serão salvos em JSON',
    dataPath: mongoConnected ? 'MongoDB Atlas' : 'backend/data/',
  });
});

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  console.log(`📊 Status do banco: ${mongoConnected ? '✅ MongoDB Online' : '📝 Modo Local (JSON)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
