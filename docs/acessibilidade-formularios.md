# Acessibilidade em Formulários (Frontend)

Regras simples para inputs/labels em todo o projeto:

- Todo campo de formulário deve possuir `id` e `name` únicos.
- Toda `<label>` deve estar associada ao campo usando `htmlFor` apontando para o `id` do campo.
- Para inputs escondidos visualmente, use `className="sr-only"` na label (mantém acessível para leitores de tela).
- Prefira `autoComplete` quando aplicável: `name`, `email`, `tel`, `organization`, `address-level1`, etc.
- Em componentes shadcn/ui (`<Input />`), o `id` e `name` são repassados ao `<input>` nativo—sempre forneça ambos quando houver label.

Exemplo:

```tsx
<label htmlFor="customer-email" className="text-sm">E-mail</label>
<Input id="customer-email" name="email" type="email" autoComplete="email" />
```

Checklist antes de commitar páginas com formulários:

- [ ] Todos os campos com label possuem `id`/`name`.
- [ ] Toda label tem `htmlFor` (ou o input está aninhado dentro do label).
- [ ] Campos de busca possuem label com `sr-only`.
- [ ] Onde faz sentido, `autoComplete` está definido.
