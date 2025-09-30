# Endpoints de Endereços - Backend

Este documento descreve os endpoints que precisam ser implementados no backend para o módulo de Cadastro de Endereços.

## Base URL
```
/api/addresses
```

## Endpoints Necessários

### 1. Listar Endereços
```http
GET /api/addresses
GET /api/addresses?depositoId={depositoId}
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "uuid",
    "depositoId": "uuid",
    "deposito": "Principal",
    "enderecoCompleto": "Rua A; Coluna 1; Nível 0; Palete 1",
    "enderecoAbreviado": "R A; C 1; N 0; P 1",
    "estruturaFisica": "Porta palete",
    "funcao": "Armazenagem",
    "acessivelAMao": true,
    "situacao": "ATIVO",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

---

### 2. Obter Endereço por ID
```http
GET /api/addresses/:id
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "depositoId": "uuid",
  "deposito": "Principal",
  "enderecoCompleto": "Rua A; Coluna 1; Nível 0; Palete 1",
  "enderecoAbreviado": "R A; C 1; N 0; P 1",
  "estruturaFisica": "Porta palete",
  "funcao": "Armazenagem",
  "acessivelAMao": true,
  "situacao": "ATIVO",
  "unitizador": "Palete",
  "peso": 500,
  "altura": 150,
  "largura": 120,
  "comprimento": 80,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### 3. Preview de Endereços (Simulação)
```http
POST /api/addresses/preview
```

**Body:**
```json
{
  "depositoId": "uuid",
  "estruturaFisicaId": "uuid",
  "coordenadas": [
    {
      "tipo": "R",
      "nome": "Rua",
      "abrev": "R",
      "inicio": "A",
      "fim": "B",
      "usarPrefixo": true
    },
    {
      "tipo": "C",
      "nome": "Coluna",
      "abrev": "C",
      "inicio": 1,
      "fim": 10
    },
    {
      "tipo": "N",
      "nome": "Nível",
      "abrev": "N",
      "inicio": 0,
      "fim": 4,
      "acessiveisAMao": [0, 1]
    },
    {
      "tipo": "P",
      "nome": "Palete",
      "abrev": "P",
      "inicio": 1,
      "fim": 2
    }
  ],
  "capacidade": {
    "unitizador": "Palete",
    "peso": 500,
    "altura": 150,
    "largura": 120,
    "comprimento": 80
  }
}
```

**Resposta de Sucesso (200):**
```json
{
  "total": 160,
  "enderecos": [
    {
      "enderecoCompleto": "Rua A; Coluna 1; Nível 0; Palete 1",
      "enderecoAbreviado": "R A; C 1; N 0; P 1",
      "alcance": "ACESSÍVEL A MÃO"
    },
    {
      "enderecoCompleto": "Rua A; Coluna 1; Nível 0; Palete 2",
      "enderecoAbreviado": "R A; C 1; N 0; P 2",
      "alcance": "ACESSÍVEL A MÃO"
    }
  ]
}
```

**Lógica do Preview:**
- Combinar todas as coordenadas para gerar endereços
- Para estrutura com R(A-B), C(1-10), N(0-4), P(1-2): 2 × 10 × 5 × 2 = **200 endereços**
- Marcar como "ACESSÍVEL A MÃO" se o nível estiver no array `acessiveisAMao`

---

### 4. Criar Endereços em Lote
```http
POST /api/addresses/bulk
```

**Body:** (mesmo formato do preview)

**Resposta de Sucesso (201):**
```json
{
  "total": 160,
  "enderecos": [
    {
      "enderecoCompleto": "Rua A; Coluna 1; Nível 0; Palete 1",
      "enderecoAbreviado": "R A; C 1; N 0; P 1",
      "alcance": "ACESSÍVEL A MÃO"
    }
  ]
}
```

---

### 5. Atualizar Endereço
```http
PATCH /api/addresses/:id
```

**Body:**
```json
{
  "situacao": "BLOQUEADO",
  "peso": 600,
  "altura": 160
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "deposito": "Principal",
  "enderecoCompleto": "Rua A; Coluna 1; Nível 0; Palete 1",
  ...
}
```

---

### 6. Deletar Endereço
```http
DELETE /api/addresses/:id
```

**Resposta de Sucesso (204):** No Content

---

## Regras de Negócio

### Geração de Endereços
1. **Ordem das coordenadas:** Seguir a ordem definida na estrutura física
2. **Formato completo:** Usar `nomeCustom` ou `nomePadrao` da coordenada
3. **Formato abreviado:** Usar `abrevCustom` ou `abrevPadrao` da coordenada
4. **Separador:** Usar `;` (ponto e vírgula) entre coordenadas
5. **Prefixo:** Se `usarPrefixo: false`, não incluir o nome da coordenada

### Exemplo de Formatação
```
Prefixo habilitado:  "Rua A; Coluna 1; Nível 0; Palete 1"
Prefixo desabilitado: "A; Coluna 1; Nível 0; Palete 1"

Abreviado: "R A; C 1; N 0; P 1"
```

### Acessibilidade à Mão
- Aplicável apenas para coordenadas do tipo "Nível" ou "Andar"
- Se o valor da coordenada estiver em `acessiveisAMao`, marcar o endereço como `acessivelAMao: true`

---

## Modelo de Dados Sugerido

```typescript
// Entity: Address
{
  id: string (UUID)
  depositoId: string (FK)
  estruturaFisicaId: string (FK)
  
  // Coordenadas (JSON ou colunas separadas)
  coordenadas: Record<string, string | number>
  // Ex: { "R": "A", "C": 1, "N": 0, "P": 1 }
  
  enderecoCompleto: string
  enderecoAbreviado: string
  
  funcao: "Armazenagem" | "Stage" | "Doca" | "Produção" | "Picking"
  acessivelAMao: boolean
  situacao: "ATIVO" | "BLOQUEADO"
  
  // Capacidade
  unitizador?: string
  peso?: number
  altura?: number
  largura?: number
  comprimento?: number
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Status Atual

✅ Frontend implementado  
⏳ Backend pendente  
📝 Documentação dos endpoints criada

A aplicação frontend está configurada para lidar graciosamente com a ausência dos endpoints, exibindo mensagens apropriadas ao usuário.
