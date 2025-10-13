# Como Corrigir o Erro "Cannot convert object to primitive value"

## 🔍 Diagnóstico
O erro está ocorrendo por causa de cache do navegador ou do Vite dev server.

## ✅ Solução Rápida

### 1. Limpar Cache do Navegador
1. Abra as DevTools (F12)
2. Clique com botão direito no botão de reload
3. Selecione "Limpar cache e fazer hard reload"

OU

Pressione: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)

### 2. Parar e Reiniciar o Dev Server
```bash
# Parar o servidor (Ctrl+C)
# Limpar cache do Vite
npm run dev -- --force

# OU deletar a pasta .vite e node_modules/.vite
rm -rf node_modules/.vite
rm -rf .vite
npm run dev
```

### 3. Verificar se os Arquivos Existem
Todos os arquivos devem ter export default:

✅ `/src/page/integration/settings/organizacao/page.tsx`
```tsx
export function OrganizacaoPage() { ... }
export default OrganizacaoPage;
```

✅ `/src/page/integration/settings/erp-integration/page.tsx`
```tsx
export function ErpIntegration() { ... }
export default ErpIntegration;
```

✅ `/src/page/integration/settings/unified-product/page.tsx`
```tsx
export function UnifiedProduct() { ... }
export default UnifiedProduct;
```

## 🐛 Se o Erro Persistir

### Opção 1: Reconstruir Completamente
```bash
# Parar o dev server
# Limpar tudo
rm -rf node_modules
rm -rf .vite
rm package-lock.json

# Reinstalar
npm install
npm run dev
```

### Opção 2: Verificar Console do Navegador
1. Abra DevTools → Console
2. Procure por erros específicos
3. Verifique a aba "Network" para ver se os arquivos estão sendo carregados

### Opção 3: Modo Incógnito
Teste em uma janela anônima do navegador para eliminar problemas de cache.

## ✨ Correções Já Aplicadas

1. ✅ Adicionado `export default` em todos os componentes
2. ✅ Corrigido validação de CNPJ (agora é opcional)
3. ✅ Protegido `.replace()` contra valores null/undefined
4. ✅ Sistema de autenticação usando `apiFetch`
5. ✅ Toast correto (`toast-context`)

## 📝 Checklist de Verificação

- [ ] Arquivos têm export default
- [ ] Cache do navegador limpo
- [ ] Dev server reiniciado com --force
- [ ] Modo incógnito testado
- [ ] Console sem erros de import

Se ainda persistir, o problema pode estar em:
- Extensões do navegador
- Proxy/VPN interferindo
- Versão do Node.js incompatível

---

**Desenvolvido:** Outubro 2025

