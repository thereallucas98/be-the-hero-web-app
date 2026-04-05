# Task Brief: F1.3 — Public Pet Listing Completion

**Created**: 2026-04-05
**Status**: In Progress
**Complexity**: Simple
**Type**: UI Change

---

## Feature Overview

### User Story
Como visitante anônimo, quero navegar pelos pets disponíveis para adoção filtrando por cidade, tipo, idade, porte, energia e independência, e navegar por páginas de resultados.

### Problem Statement
A página `/pets` já existe com layout, filtros e grid, mas faltam: filtro de espécie ("Tipo"), controles de paginação e correção da cor de fundo (`bg-brand-primary-pale` → `bg-background`).

### Scope

**In Scope:**
- Adicionar filtro de espécie ("Tipo") no `PetFilterSidebar`
- Adicionar paginação URL-based na página `/pets`
- Corrigir cor de fundo do conteúdo principal

**Out of Scope:**
- Infinite scroll
- Filtros adicionais (sexo, tem requisitos)
- SEO / meta tags

---

## Current State

**Key Files:**
- `apps/web/src/app/(public)/pets/page.tsx` — página principal, server component, já aceita `species` e `page` como searchParams mas sem UI para ambos
- `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` — sidebar com filtros de idade/energia/porte/independência + location picker; sem filtro de espécie
- `apps/web/src/components/ui/pagination.tsx` — componente de paginação já existe

**Current Behavior:**
- Página renderiza pets com filtros de localização e 4 filtros de atributo
- `listPets` retorna `{ items, total, page, perPage }` mas paginação não é exibida
- Fundo do conteúdo usa `bg-brand-primary-pale` (#fdeced) — cor rosada indesejada

**Gaps/Issues:**
- Sem filtro de espécie no sidebar
- Sem UI de paginação
- Cor de fundo errada

---

## Requirements

### FR1: Filtro de espécie
- **Description**: Adicionar select "Tipo" com opções DOG/CAT/RABBIT/BIRD/HORSE/COW/GOAT/PIG/TURTLE/OTHER
- **Trigger**: Usuário seleciona uma espécie
- **Expected Outcome**: URL atualizada com `?species=DOG`, página recarrega com pets filtrados

### FR2: Paginação
- **Description**: Mostrar controles de paginação quando `total > perPage`
- **Trigger**: Resultado tem mais de 20 pets
- **Expected Outcome**: Links Anterior/Próximo + números de página; navegação via URL `?page=N`

### FR3: Correção de fundo
- **Description**: `bg-brand-primary-pale` → `bg-background` no `<main>` da página

---

## Files to Change

### Modified Files
- [ ] `apps/web/src/components/features/pets/pet-filter-sidebar.tsx` — adicionar SPECIES_OPTIONS e FilterSelect de espécie
- [ ] `apps/web/src/app/(public)/pets/page.tsx` — adicionar `<Pagination>` e corrigir fundo

---

## Acceptance Criteria

### Must Have (P0)
- [ ] Select "Tipo" aparece no sidebar (desktop e mobile sheet)
- [ ] Selecionar espécie atualiza URL e filtra resultados
- [ ] Paginação aparece quando `total > 20`
- [ ] Navegar para página 2 via paginação funciona
- [ ] Cor de fundo do conteúdo é `bg-background`

---

## Test Strategy

**UI (manual):**
- `/pets` carrega com filtros visíveis
- Selecionar "Cachorro" filtra corretamente
- Com > 20 pets: paginação aparece e funciona
- Mobile: filtro de espécie aparece no Sheet

---

## Dependencies

**Blocks:** F1.4 (pet detail links já funcionam), F1.6 (campanha pública)
**Blocked By:** Nenhum — API 100% completa
