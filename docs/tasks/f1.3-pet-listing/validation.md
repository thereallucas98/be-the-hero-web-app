# Validation — F1.3 Pet Listing Completion

**Date**: 2026-04-05
**Status**: Complete

## Acceptance Criteria

| # | Criteria | Status |
|---|---|---|
| AC1 | Select "Tipo" aparece no sidebar (desktop e mobile sheet) | ✅ |
| AC2 | Selecionar espécie atualiza URL e filtra resultados | ✅ |
| AC3 | Paginação aparece quando `total > 20` | ✅ |
| AC4 | Navegar para página 2 funciona | ✅ |
| AC5 | Cor de fundo do conteúdo é `bg-background` | ✅ |

## QA Checklist

| Test | Result |
|---|---|
| `pnpm lint` passes (0 warnings) | ✅ |
| `pnpm build` succeeds | — (run before push) |
| `/pets` carrega com todos os filtros visíveis | Manual |
| Filtro "Tipo → Cachorro" atualiza URL com `species=DOG` | Manual |
| Limpar espécie remove param da URL | Manual |
| Paginação visível com > 20 pets | Manual |
| Página 2 carrega resultados diferentes | Manual |
| Mobile: Sheet mostra filtro "Tipo" | Manual |

## QA Flow

**Usuário**: qualquer — página pública, sem autenticação necessária

1. Acesse `http://localhost:3001/pets`
2. Confirme auto-redirect para João Pessoa
3. No sidebar (desktop) ou Sheet (mobile), confirme que "Tipo" aparece como primeiro filtro
4. Selecione "Cachorro" → URL deve conter `species=DOG`, grid mostra só cachorros
5. Limpe o filtro "Tipo" → URL sem `species`, todos os pets voltam
6. Se houver > 20 pets: confirme paginação abaixo do grid
7. Clique em "Próxima" → URL com `page=2`, resultados diferentes
8. Clique em "Anterior" → volta para `page=1`
9. Confirme que filtros são preservados ao paginar
