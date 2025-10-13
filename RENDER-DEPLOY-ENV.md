# 🚀 Deploy Frontend no Render - Configurações de Ambiente

## 📋 Variáveis de Ambiente Necessárias

Para fazer deploy do frontend no Render, você precisa configurar as seguintes variáveis de ambiente no dashboard do Render:

### 🔗 **Variáveis Obrigatórias:**

```bash
# API Configuration
VITE_API_URL=https://backend-wms-fdsc.onrender.com/api

# Application Settings
VITE_APP_NAME=WMS System
VITE_APP_VERSION=1.0.0

# Environment
NODE_ENV=production
```

### 🔐 **Variáveis Opcionais (JWT):**

```bash
# JWT Configuration (se usado pelo frontend)
VITE_JWT_ACCESS_EXPIRES=15m
VITE_JWT_REFRESH_EXPIRES=7d
```

## 🛠️ **Como Configurar no Render:**

### **Passo 1: Criar Web Service**
1. Conecte seu repositório GitHub ao Render
2. Selecione **"Web Service"**
3. Escolha **"Build with Dockerfile"** ou **"Runtime: Node.js"**

### **Passo 2: Configurar Build**
```bash
# Se usar Dockerfile:
Build Command: npm run build
Start Command: npm run preview

# Se usar Node.js direto:
Build Command: npm run build
Start Command: npm run preview
```

### **Passo 3: Adicionar Variáveis de Ambiente**
No dashboard do Render, vá em **"Environment"** e adicione:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://backend-wms-fdsc.onrender.com/api` | URL da API do backend |
| `VITE_APP_NAME` | `WMS System` | Nome da aplicação |
| `NODE_ENV` | `production` | Ambiente de produção |

## 📁 **Estrutura Recomendada:**

```
frontend-wms-v1/
├── .env.example          # Template com variáveis (commitar no git)
├── .env.local           # Desenvolvimento local (não commitar)
├── public/
├── src/
├── vite.config.ts
└── vercel.json          # Configuração para deploy
```

## 🔧 **Configuração para Diferentes Ambientes:**

### **Desenvolvimento Local:**
```bash
# Arquivo: .env.local (não commite no git)
VITE_API_URL=http://localhost:3000/api
VITE_USE_REMOTE_API=false
NODE_ENV=development
```

### **Produção (Render):**
```bash
# Configurado no dashboard do Render
VITE_API_URL=https://backend-wms-fdsc.onrender.com/api
VITE_USE_REMOTE_API=false
NODE_ENV=production
```

## ⚙️ **Arquivo vercel.json (opcional):**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://backend-wms-fdsc.onrender.com/api/$1" }
  ]
}
```

## 🚨 **Checklist Pré-Deploy:**

- [ ] Backend está rodando no Render (`https://backend-wms-fdsc.onrender.com`)
- [ ] Variáveis de ambiente configuradas no dashboard do Render
- [ ] API responde corretamente em `/api`
- [ ] CORS configurado no backend para aceitar domínio do frontend
- [ ] Build do frontend funciona localmente (`npm run build`)

## 🔗 **URLs Finais:**

Após deploy:
- **Frontend**: `https://seu-app-frontend.onrender.com`
- **Backend**: `https://backend-wms-fdsc.onrender.com`
- **API Endpoint**: `https://seu-app-frontend.onrender.com/api/*`

---

🎉 **Pronto para Deploy!** Configure as variáveis no Render e faça push das mudanças.
