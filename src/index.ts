import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/mongodb.js';
import { configureCloudinary } from './config/cloudinary.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import alunosRouter from './routes/alunos.js';
import cursosRouter from './routes/cursos.js';
import presencaRouter from './routes/presenca.js';
import funcionariosRouter from './routes/funcionarios.js';
import cargosRouter from './routes/cargos.js';

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

// Conectar ao banco de dados e configurar Cloudinary
connectDB().catch((error) => {
  console.error('Falha ao conectar ao banco de dados:', error);
  process.exit(1);
});

try {
  configureCloudinary();
} catch (error) {
  console.error('Falha ao configurar Cloudinary:', error);
  process.exit(1);
}

// Rotas
app.use('/api/alunos', alunosRouter);
app.use('/api/cursos', cursosRouter);
app.use('/api/presenca', presencaRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/cargos', cargosRouter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor está funcionando',
  });
});

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
