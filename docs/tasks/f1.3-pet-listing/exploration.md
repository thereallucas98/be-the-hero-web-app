# Exploration — F1.3 Pet Listing Completion

## Current Implementation

### `apps/web/src/app/(public)/pets/page.tsx`
- Server component, aceita searchParams: `cityPlaceId`, `ageCategory`, `energyLevel`, `size`, `independenceLevel`, `species`, `page`
- Auto-redireciona para João Pessoa (PB) quando nenhuma cidade selecionada
- Chama `listPets` → retorna `{ items, total, page, perPage }` (perPage default = 20)
- Renderiza `<PetFilterSidebar>` + grid de `<PetCard>`
- **Problema**: `species` recebido mas não passado ao `listPets` ← já está passando
- **Problema**: `total/page/perPage` retornados mas sem `<Pagination>` no JSX
- **Problema**: `<main>` usa `bg-brand-primary-pale`

### `apps/web/src/components/features/pets/pet-filter-sidebar.tsx`
- Client component com estado local para location + 4 filtros
- `handleSearch` monta URLSearchParams e faz `router.push('/pets?...')`
- Filtros disponíveis: ageCategory, energyLevel, size, independenceLevel
- **Faltando**: species

### `apps/web/src/components/ui/pagination.tsx`
- Componente shadcn/ui padrão
- Exports: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`
- `PaginationLink` renderiza `<a>` com `href` — perfeito para server-side navigation

### `apps/web/src/server/repositories/pet.repository.ts`
- `listPublicPets` aceita `species?: string`
- Species enum: DOG, CAT, RABBIT, BIRD, HORSE, COW, GOAT, PIG, TURTLE, OTHER
- Retorna `{ items, total, page, perPage }` onde `perPage` default = 20

## Integration Points
- Filtros → URL params → server component re-render (sem client state extra)
- Paginação → URL `?page=N` → server component re-render

## Risks
- Nenhum risco técnico — tudo já existe
