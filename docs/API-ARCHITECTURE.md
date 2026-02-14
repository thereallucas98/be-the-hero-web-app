# BeTheHero API Architecture (SOLID + Clean)

Este documento descreve a arquitetura das APIs do BeTheHero e como a IA deve criar ou modificar endpoints.

## Princípios

- **S (Single Responsibility)**: Rotas apenas fazem parse, validação, chamada de use case e resposta HTTP
- **O (Open/Closed)**: Novos comportamentos vêm de novos use cases, não de editar existentes
- **L (Liskov)**: Repositories implementam interfaces; podem ser trocados (ex: mock em testes)
- **I (Interface Segregation)**: Repositories expõem métodos específicos, não "god objects"
- **D (Dependency Inversion)**: Use cases recebem repositories por parâmetro; não importam Prisma diretamente

## Estrutura de pastas

```
apps/web/src/
├── server/
│   ├── repositories/       # Acesso a dados (encapsula Prisma)
│   │   ├── user.repository.ts
│   │   ├── workspace.repository.ts
│   │   ├── geo-place.repository.ts
│   │   └── index.ts        # Exporta instâncias com prisma injetado
│   ├── use-cases/          # Lógica de negócio
│   │   ├── auth/
│   │   ├── me/
│   │   ├── workspaces/
│   │   └── index.ts
│   ├── schemas/            # Schemas Zod compartilhados
│   │   ├── auth.schema.ts
│   │   └── workspace.schema.ts
│   └── http/               # Helpers HTTP (cookies, etc.)
│       └── cookie.ts
├── lib/                    # Utilitários (auth, db, session, get-principal)
└── app/api/                # Rotas Next.js (thin layer)
```

## Fluxo de uma request

```
Request → Route (parse + validate Zod) → Use Case (business logic) → Repository (data) → Route (format response)
```

## Como criar um novo endpoint

### 1. Schema (se precisar de body)

Crie ou estenda em `server/schemas/`:

```ts
// server/schemas/meu-dominio.schema.ts
import { z } from 'zod'

export const MeuSchema = z.object({
  campo: z.string().min(1),
  email: z.email(),
})
```

### 2. Repository (se precisar de novos métodos)

Crie em `server/repositories/` ou estenda existente:

```ts
// Interface define o contrato
export interface MeuRepository {
  findById(id: string): Promise<MeuModel | null>
}

// createMeuRepository(prisma) retorna implementação
export function createMeuRepository(prisma: PrismaClient): MeuRepository {
  return {
    async findById(id) {
      return prisma.meuModel.findUnique({ where: { id } })
    },
  }
}
```

Registre em `server/repositories/index.ts`.

### 3. Use Case

Crie em `server/use-cases/meu-dominio/`:

```ts
// server/use-cases/meu-dominio/meu-use-case.ts
import type { MeuRepository } from '../../repositories/meu.repository'

export interface MeuUseCaseInput { ... }

export type MeuUseCaseResult =
  | { success: true; data: ... }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | ... }

export async function meuUseCase(
  meuRepo: MeuRepository,
  principal: Principal | null,
  input: MeuUseCaseInput
): Promise<MeuUseCaseResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }
  // regras de negócio...
  const data = await meuRepo.findById(input.id)
  return { success: true, data }
}
```

Exporte em `server/use-cases/index.ts`.

### 4. Route

A rota fica enxuta:

```ts
// app/api/meu-dominio/route.ts
import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { meuRepository } from '~/server/repositories'
import { meuUseCase } from '~/server/use-cases'
import { MeuSchema } from '~/server/schemas/meu-dominio.schema'

export async function POST(req: Request) {
  const principal = await getPrincipal(req)

  const body = await req.json().catch(() => null)
  const parsed = MeuSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const result = await meuUseCase(meuRepository, principal, parsed.data)

  if (!result.success) {
    const status = mapCodeToStatus(result.code)
    return NextResponse.json({ message: mapCodeToMessage(result.code) }, { status })
  }

  return NextResponse.json(result.data, { status: 201 })
}
```

## Autenticação

- **getPrincipal(req)** em `lib/get-principal.ts`: retorna `{ userId, role, memberships, adminCities }` ou `null`
- Rotas protegidas: `if (!principal) return 401`
- Regras de role: checar `principal.role` no use case

## Padrão de resposta de erro

Use cases retornam `{ success: false, code: '...' }`. A rota mapeia:

| code              | HTTP status |
|-------------------|-------------|
| UNAUTHENTICATED   | 401         |
| FORBIDDEN         | 403         |
| NOT_FOUND         | 404         |
| EMAIL_IN_USE      | 409         |
| INVALID_CITY      | 400         |
| INVALID_STATUS    | 409         |
| INVALID_IMAGES    | 400         |
| WORKSPACE_BLOCKED     | 403         |
| MISSING_REVIEW_NOTE   | 400         |

## Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Registro de usuário |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/me | Usuário autenticado |
| POST | /api/workspaces | Criar workspace (PARTNER_MEMBER) |
| GET | /api/workspaces/my | Listar meus workspaces |
| GET | /api/workspaces/:id | Detalhes do workspace (RBAC: membro, ADMIN com cobertura ou SUPER_ADMIN). Query: `membersPage`, `membersPerPage` (default 20) |
| PATCH | /api/workspaces/:id | Atualiza dados básicos (nome, descrição, contatos, links). RBAC: OWNER/EDITOR, ADMIN com cobertura ou SUPER_ADMIN. Payload parcial. Registra AuditLog. |
| PATCH | /api/workspaces/:id/location | Atualiza localização primária (cityPlaceId, lat, lng, endereço). Adiciona cidade à cobertura automaticamente. cityPlaceId deve existir e ser tipo CITY. Transacional. AuditLog. |
| POST | /api/workspaces/:id/members | Adiciona membro por e-mail (payload: email, role). Apenas OWNER. Role: OWNER/EDITOR/FINANCIAL. Transacional. 409 se já membro. AuditLog. |
| DELETE | /api/workspaces/:id/members/:memberId | Remove membro (soft delete, isActive=false). Apenas OWNER. Não pode remover último OWNER. AuditLog. |
| POST | /api/workspaces/:id/pets | Cadastra pet (status DRAFT). Apenas OWNER/EDITOR. Workspace deve existir e estar ativo. AuditLog. |
| PATCH | /api/pets/:id | Atualiza pet (parcial). Apenas OWNER/EDITOR. Bloqueado se ADOPTED. Não altera status/approvedAt. AuditLog. |
| POST | /api/pets/:id/submit-for-review | Envia pet DRAFT para PENDING_REVIEW. Requer 1-5 imagens, 1 isCover, dados mínimos. Workspace ativo. Transacional + AuditLog. |
| POST | /api/pets/:id/images | Adiciona imagem (url, storagePath, position 1-5, isCover). storagePath: pets/{petId}/... Max 5. Transacional + cover swap. AuditLog. |
| PATCH | /api/pets/:petId/images/:imageId | Atualiza position e/ou isCover. Transacional (swap de posição, desmarca cover). AuditLog. Não altera status. |
| DELETE | /api/pets/:petId/images/:imageId | Remove imagem. OWNER/EDITOR. Se cover removida, próxima por position vira cover. Não remove última imagem se pet PENDING_REVIEW. 204. AuditLog DELETE. |
| POST | /api/admin/pets/:id/approve | Aprova pet em PENDING_REVIEW. SUPER_ADMIN ou ADMIN com cobertura da cidade do workspace. Pet: 1-5 imagens, 1 isCover. Workspace ativo. Transacional + AuditLog APPROVE. |
| POST | /api/admin/pets/:id/reject | Rejeita pet em PENDING_REVIEW. Body: `{ reviewNote: string }`. SUPER_ADMIN ou ADMIN com cobertura. Workspace ativo. Transacional + AuditLog REJECT com reviewNote em metadata. |

## Zod

- Use `z.email()` e `z.uuid()` (Zod 4)
- Validação na rota; use case recebe dados já validados
- Erro: `{ message: 'Invalid payload', details: parsed.error.issues }` com status 400
