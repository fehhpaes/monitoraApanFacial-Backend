# 🚀 Deploy no Render

## Como Fazer Deploy no Render

### Pré-requisitos
- Conta no Render (https://render.com)
- Repositório GitHub conectado
- Variáveis de ambiente configuradas

### Passo 1: Conectar GitHub ao Render

1. Acesse https://dashboard.render.com
2. Clique em "New +" → "Web Service"
3. Selecione "Deploy an existing repository from GitHub"
4. Conecte sua conta GitHub
5. Selecione o repositório `monitoraApanFacial-Backend`

### Passo 2: Configurar o Serviço

**Nome**: `monitoraapan-backend`

**Ambiente**: 
- Runtime: Docker
- Dockerfile Path: `./Dockerfile`
- Builder: Render (Docker)

**Porta**: `5000`

**Health Check Path**: `/health`

### Passo 3: Adicionar Variáveis de Ambiente

No Render Dashboard, vá para **Environment** e adicione:

```
MONGODB_URI=mongodb+srv://adminAdmin:MEqSRkjLzsdVVEYD@prjmonitoraapan.cbun2hq.mongodb.net/monitoraapan?authSource=admin&retryWrites=true&w=majority&appName=prjMonitoraApan

CLOUDINARY_URL=cloudinary://935284621842928:zEex3K4qXldL1D2ILs_Hd1rpGAQ@dohvljdtg

NODE_ENV=production

PORT=5000
```

### Passo 4: Deploy

1. Clique em "Create Web Service"
2. Render começará a fazer build da imagem Docker
3. Aguarde o deploy (geralmente 5-10 minutos)
4. Acesse a URL fornecida pelo Render

### Passo 5: Verificar Deploy

Após o deploy, teste os endpoints:

```bash
# Health Check
curl https://seu-servico.onrender.com/health

# Listar alunos
curl https://seu-servico.onrender.com/api/alunos

# Verificar status do banco
curl https://seu-servico.onrender.com/status/db
```

## 🔄 Auto Deploy

Com o render.yaml configurado, qualquer push para main fará deploy automático!

## 📝 Troubleshooting

### Build Failed
- Verifique se o Dockerfile está na raiz do repositório
- Confirme que o package.json tem o script `build`
- Veja os logs no dashboard do Render

### Conexão MongoDB
- Adicione a variável `MONGODB_URI` corretamente
- Se não conseguir conectar, o sistema usa fallback JSON
- Verifique a whitelist do MongoDB Atlas

### Cloudinary Não Funciona
- Verifique a URL do Cloudinary nas variáveis de ambiente
- Teste o upload de imagem

## 🌐 URL do Deploy

Após fazer deploy, a URL será algo como:
```
https://monitoraapan-backend.onrender.com
```

Adicione esta URL no frontend `.env`:
```
VITE_API_URL=https://monitoraapan-backend.onrender.com/api
```

## 📊 Monitoramento

No dashboard do Render, você pode:
- Ver logs em tempo real
- Monitorar performance
- Configurar alertas
- Fazer deploy manual

## 🔐 Segurança

- Nunca commite `.env` no Git
- Use `.env.example` como template
- Adicione as variáveis no dashboard do Render
- Mantenha as credenciais seguras

## 💡 Dicas

1. **Auto Deploy**: Qualquer push em main faz deploy automático
2. **Rollback**: Use a aba "Deployments" para voltar versão anterior
3. **Scale**: Configure no "Instance Type" se precisar mais recursos
4. **Logs**: Veja logs em tempo real no "Logs" do serviço
5. **Cron Jobs**: Configure jobs periódicos se necessário

## 📞 Suporte

Se tiver problemas:
1. Veja os logs do Render
2. Verifique as variáveis de ambiente
3. Teste localmente com `docker build -t monitoraapan . && docker run -p 5000:5000 monitoraapan`
