import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import * as jsonStorage from './services/jsonStorage.js';

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',      // Vite dev server (padrão)
    'http://localhost:3000',      // Alternativa dev
    'http://localhost:5000',      // Backend local
    'https://monitoraapanfacial-backend.onrender.com',
    process.env.FRONTEND_URL,     // URL do frontend (se definida)
  ].filter((url): url is string => Boolean(url)),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let usingMongoDB = false;
let mongoError = '';

// Tentar configurar Cloudinary
try {
  configureCloudinary();
  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.error('❌ Falha ao configurar Cloudinary:', error);
}

// Carregar rotas sincronamente - ANTES de iniciar o servidor
import alunosRouter from './routes/alunos.js';
import alunosOfflineRouter from './routes/alunosOffline.js';

// Tentar conectar ao MongoDB (não-bloqueante)
import { connectDB } from './config/mongodb.js';

// Tentar conectar ao MongoDB e carregar as rotas apropriadas
connectDB()
  .then(() => {
    usingMongoDB = true;
    console.log('✅ MongoDB conectado com sucesso!');
    console.log('🗄️  Usando: MongoDB Atlas');
    // Use MongoDB router
    app.use('/api/alunos', alunosRouter);
  })
  .catch((error) => {
    usingMongoDB = false;
    mongoError = error.message;
    console.warn('⚠️ MongoDB não disponível');
    console.warn('📝 Usando armazenamento local (JSON)');
    console.warn('💾 Dados salvos em: backend/data/alunos.json');
    // Use offline router
    app.use('/api/alunos', alunosOfflineRouter);
  });

// Rota de cursos (funciona em ambos os modos)
app.get('/api/cursos', (_req, res) => {
  try {
    let cursos;
    
    if (usingMongoDB) {
      // Usar MongoDB
      import('./models/Aluno.js').then((module) => {
        const Aluno = module.Aluno;
        Aluno.distinct('curso').then((cursosUnicos: string[]) => {
          res.status(200).json({
            success: true,
            data: cursosUnicos.map((nome) => ({ nome })),
            total: cursosUnicos.length,
            mode: 'MongoDB',
          });
        });
      });
    } else {
      // Usar JSON local
      cursos = jsonStorage.readCursos();
      res.status(200).json({
        success: true,
        data: cursos,
        total: cursos.length,
        mode: 'Local (JSON)',
      });
    }
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

    if (!/^[A-Za-z0-9]+$/.test(sigla)) {
      res.status(400).json({
        success: false,
        message: 'Sigla deve conter apenas letras e números',
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

    if (usingMongoDB) {
      // Criar no MongoDB
      import('./models/Curso.js').then((module) => {
        const Curso = module.Curso;
        const novoCurso = new Curso({ nome, sigla, tipo });
        novoCurso.save().then(() => {
          res.status(201).json({
            success: true,
            message: 'Curso criado com sucesso',
            data: novoCurso,
          });
        }).catch((error) => {
          if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
              success: false,
              message: `${field.charAt(0).toUpperCase() + field.slice(1)} já existe`,
            });
          } else {
            res.status(400).json({
              success: false,
              message: error.message || 'Erro ao criar curso',
            });
          }
        });
      });
    } else {
      // Criar em JSON
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
    }
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
    mode: usingMongoDB ? 'MongoDB Online' : 'Local Mode (JSON)',
    timestamp: new Date().toISOString(),
  });
});

// Status do banco
app.get('/status/db', (_req, res) => {
  res.status(200).json({
    success: true,
    mongoConnected: usingMongoDB,
    mode: usingMongoDB ? 'MongoDB Atlas' : 'Armazenamento Local (JSON)',
    message: usingMongoDB 
      ? '✅ Conectado ao MongoDB Atlas' 
      : '📝 Usando armazenamento local (JSON)',
    dataPath: usingMongoDB ? 'MongoDB Atlas' : 'backend/data/',
    mongoError: usingMongoDB ? null : mongoError,
  });
});

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
  console.log(`📊 Status: ${usingMongoDB ? '✅ MongoDB Online' : '📝 Modo Local (JSON)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
