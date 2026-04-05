# Research — F1.3 Pet Listing Completion

## Filtro de espécie

**Abordagem**: Adicionar `SPECIES_OPTIONS` e um `<FilterSelect>` no `PetFilterSidebar`, incluindo `species` no estado e no `handleSearch`.

Labels PT-BR:
- DOG → Cachorro
- CAT → Gato
- RABBIT → Coelho
- BIRD → Pássaro
- HORSE → Cavalo
- COW → Vaca
- GOAT → Cabra
- PIG → Porco
- TURTLE → Tartaruga
- OTHER → Outro

## Paginação

**Abordagem escolhida**: URL-based com `<PaginationLink href="...">` — server component, sem JS extra.

**Lógica**:
- `totalPages = Math.ceil(total / perPage)`
- Mostrar só quando `totalPages > 1`
- Links mantêm todos os outros filtros na URL + `?page=N`
- Mostrar: Anterior | 1 … N-1 | N | N+1 … | Total | Próximo
- Simplificado: apenas Anterior/Próximo + página atual/total (suficiente para MVP)

**Alternativa descartada**: Infinite scroll — requer client component + intersection observer; overkill para MVP.

## Fundo

`bg-brand-primary-pale` → `bg-background` — mudança de 1 linha, sem side effects.
