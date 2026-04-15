# MonitoraApan Facial - Backend

Backend em Node.js + Express + TypeScript + MongoDB para o sistema de cadastro e monitoramento de alunos com captura de fotos via webcam.

## 🚀 Características

- ✅ CRUD completo de alunos
- ✅ Upload de fotos para Cloudinary
- ✅ Validação com Zod
- ✅ Autenticação MongoDB Atlas
- ✅ Modo fallback JSON (quando MongoDB indisponível)
- ✅ CORS habilitado
- ✅ Tratamento de erros robusto

## 📋 Requisitos

- Node.js 18+
- npm ou yarn
- MongoDB Atlas (ou JSON local)
- Cloudinary (para upload de imagens)

## 🛠️ Instalação

```bash
npm install
```

## 📝 Configuração (.env)

```env
MONGODB_URI=mongodb+srv://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan.cbun2hq.mongodb.net/monitoraapan?authSource=admin&retryWrites=true&w=majority&appName=prjMonitoraApan
CLOUDINARY_URL=cloudinary://935284621842928:zEex3K4qXldL1D2ILs_Hd1rpGAQ@dohvljdtg
PORT=5000
NODE_ENV=development
```

## 🚀 Iniciar

### Modo MongoDB (padrão)
```bash
npm run dev:mongodb
```

### Modo Auto (tenta MongoDB, fallback para JSON)
```bash
npm run dev
```

### Modo Offline (JSON local apenas)
```bash
npm run dev:offline
```

## 📚 Estrutura do Projeto

```
src/
├── config/           # Configurações (MongoDB, Cloudinary, etc)
├── controllers/      # Lógica de negócios
├── middleware/       # Middlewares Express
├── models/          # Schemas Mongoose
├── routes/          # Rotas da API
├── services/        # Serviços (JSON storage, etc)
├── index.ts         # Entry point MongoDB
├── indexAuto.ts     # Entry point com fallback
└── indexOffline.ts  # Entry point JSON local
```

## 🔌 API Endpoints

### Alunos
- `GET /api/alunos` - Listar todos
- `GET /api/alunos/:id` - Obter um
- `POST /api/alunos` - Criar
- `PUT /api/alunos/:id` - Atualizar
- `DELETE /api/alunos/:id` - Deletar

### Cursos
- `GET /api/cursos` - Listar cursos
- `POST /api/cursos` - Criar curso

### Health
- `GET /health` - Status do servidor
- `GET /status/db` - Status do banco de dados

## 🐛 Troubleshooting

### Erro de conexão MongoDB
Se receber erro de conexão:

1. Verifique se a URI está correta no `.env`
2. Confirme que o IP está na whitelist do MongoDB Atlas
3. Use `npm run dev` para modo auto (com fallback)
4. Use `npm run dev:offline` para modo JSON local

### Erro de upload Cloudinary
Verifique a URL do Cloudinary em `.env`

## 📦 Dependências Principais

- **express** - Framework web
- **mongoose** - ODM MongoDB
- **cloudinary** - Upload de imagens
- **zod** - Validação de dados
- **cors** - Cross-origin requests
- **dotenv** - Variáveis de ambiente

## 🔐 Segurança

- Validação de entrada com Zod
- Proteção CORS
- Variáveis sensíveis em `.env`
- Tratamento de erros seguro

## 🚀 Deploy

Para deploy em produção:

```bash
npm run build
npm start
```

## 📄 Licença

MIT

## 👨‍💻 Autor

Felipe Paes
