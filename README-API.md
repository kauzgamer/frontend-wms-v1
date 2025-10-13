# 🔗 Configuração da API - Frontend WMS

## 🌐 Conectando à API do Render

O frontend foi configurado com **fallback inteligente** para se conectar automaticamente à API do Render quando o backend local não estiver disponível.

### ✅ Funcionalidades Implementadas

#### **Fallback Automático**
O cliente API (`src/lib/api/client.ts`) tenta conectar primeiro com o backend local e, se não conseguir, automaticamente usa a API remota:

```typescript
// Tenta backend local primeiro
// Se falhar, usa API remota automaticamente
const FALLBACK_BASE_URLS = [
  'https://backend-wms-fdsc.onrender.com/api', // API remota
]
```

#### **Configuração Inteligente**
```typescript
const getApiBaseUrl = (): string => {
  if (!import.meta.env.DEV) {
    // Produção: sempre usa API remota
    return import.meta.env.VITE_API_URL || 'https://backend-wms-fdsc.onrender.com/api'
  }

  if (import.meta.env.VITE_USE_REMOTE_API === 'true') {
    // Desenvolvimento: força API remota
    return import.meta.env.VITE_API_URL || 'https://backend-wms-fdsc.onrender.com/api'
  }

  // Desenvolvimento: usa proxy local (padrão)
  return '/api'
}
```

### 🛠️ Variáveis de Ambiente (opcionais)

Crie um arquivo `.env` na raiz do projeto para personalizar:

```bash
# .env
VITE_API_URL=https://backend-wms-fdsc.onrender.com/api
VITE_USE_REMOTE_API=false  # true para forçar API remota em desenvolvimento
```

### 🚀 Modos de Operação

| Ambiente | Backend Local | API Remota | Comportamento |
|----------|---------------|------------|---------------|
| **Desenvolvimento** | ✅ Disponível | ❌ | Usa proxy `/api` → `localhost:3000` |
| **Desenvolvimento** | ❌ Indisponível | ✅ | **Fallback automático** para API remota |
| **Produção** | N/A | ✅ | Usa `VITE_API_URL` ou fallback |

### 🔧 Como Usar

#### **Desenvolvimento Normal (recomendado)**
1. Execute o backend localmente: `npm run start:dev`
2. Execute o frontend: `npm run dev`
3. Funciona automaticamente com proxy

#### **Desenvolvimento com API Remota**
Se o backend local não estiver disponível:
1. O frontend detecta automaticamente e usa API remota
2. Veja logs no console: "Local API unavailable, trying remote API..."
3. Funciona sem configuração adicional

#### **Forçar API Remota em Desenvolvimento**
```bash
# .env
VITE_USE_REMOTE_API=true
```

### 📝 Exemplo de Uso

```typescript
import { apiFetch } from '@/lib/api/client'

// Funciona automaticamente em qualquer ambiente
const data = await apiFetch('/users')
const products = await apiFetch('/products')
```

### 🔒 CORS e Segurança

- ✅ **CORS configurado** no backend para aceitar frontend
- ✅ **Credenciais habilitadas** (`credentials: true`)
- ✅ **Headers de segurança** (Helmet no backend)

### 🚨 Solução de Problemas

#### **Erro: "Local API unavailable"**
- ✅ **Normal!** Significa que o backend local não está rodando
- ✅ **Automático!** O sistema já faz fallback para API remota
- ✅ **Transparente!** Aplicação continua funcionando

#### **Para usar apenas API remota:**
```bash
echo "VITE_USE_REMOTE_API=true" > .env
```

#### **Para voltar ao desenvolvimento local:**
```bash
# Inicie o backend: npm run start:dev
# Remova a variável de ambiente ou defina como false
```

---

🎉 **Resultado:** Frontend funciona automaticamente em qualquer cenário!
