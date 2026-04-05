# Plan — F1.3 Pet Listing Completion

## Sub-steps

### Step 1 — Filtro de espécie no PetFilterSidebar
**File**: `apps/web/src/components/features/pets/pet-filter-sidebar.tsx`
- Adicionar `SPECIES_OPTIONS` (DOG→Cachorro, CAT→Gato, etc.)
- Adicionar estado `species` inicializado do searchParam
- Adicionar `<FilterSelect label="Tipo" ...>` no `FilterPanelContent`
- Incluir `species` no `handleSearch` URLSearchParams

### Step 2 — Paginação + fundo na página /pets
**File**: `apps/web/src/app/(public)/pets/page.tsx`
- Corrigir `bg-brand-primary-pale` → `bg-background` no `<main>`
- Importar componentes de paginação
- Calcular `totalPages = Math.ceil(total / perPage)`
- Renderizar `<Pagination>` abaixo do grid quando `totalPages > 1`
- Links de paginação preservam todos os filtros ativos na URL

## Files to Change
- `apps/web/src/components/features/pets/pet-filter-sidebar.tsx`
- `apps/web/src/app/(public)/pets/page.tsx`

## Test Strategy
- `/pets` sem filtros → auto-redirect para JPA → grid renderiza
- Filtrar por espécie "Cachorro" → URL tem `species=DOG`
- Limpar espécie → URL sem `species`
- Navegar para página 2 → `page=2` na URL, resultados mudam
- Mobile: abrir Sheet, filtro "Tipo" aparece
