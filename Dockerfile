# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para TypeScript)
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar apenas dependências de produção (sem devDependencies)
RUN npm ci --legacy-peer-deps --only=production && npm cache clean --force

# Criar diretórios de dados
RUN mkdir -p /app/data

# Copiar código compilado do builder
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 5000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar (usa indexAuto.js que tenta MongoDB com fallback JSON)
CMD ["node", "dist/indexAuto.js"]

