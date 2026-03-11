# BeTheHero API Architecture (SOLID + Clean)

This document describes the BeTheHero API architecture and how to create or modify endpoints.

## Principles

- **S (Single Responsibility)**: Routes only parse, validate, call use cases, and format HTTP responses
- **O (Open/Closed)**: New behaviors come from new use cases, not from editing existing ones
- **L (Liskov)**: Repositories implement interfaces; can be swapped (e.g., mocks in tests)
- **I (Interface Segregation)**: Repositories expose specific methods, not "god objects"
- **D (Dependency Inversion)**: Use cases receive repositories as parameters; do not import Prisma directly

## Folder structure

```
apps/web/src/
├── server/
│   ├── repositories/       # Data access (encapsulates Prisma)
│   │   ├── user.repository.ts
│   │   ├── workspace.repository.ts
│   │   ├── geo-place.repository.ts
│   │   └── index.ts        # Exports instances with injected prisma
│   ├── use-cases/          # Business logic
│   │   ├── auth/
│   │   ├── me/
│   │   ├── workspaces/
│   │   └── index.ts
│   ├── schemas/            # Shared Zod schemas
│   │   ├── auth.schema.ts
│   │   └── workspace.schema.ts
│   └── http/               # HTTP helpers (cookies, etc.)
│       └── cookie.ts
├── lib/                    # Utilities (auth, db, session, get-principal)
└── app/api/                # Next.js routes (thin layer)
```

## Request flow

```
Request → Route (parse + validate Zod) → Use Case (business logic) → Repository (data) → Route (format response)
```

## How to create a new endpoint

### 1. Schema (if body is needed)

Create or extend in `server/schemas/`:

```ts
// server/schemas/my-domain.schema.ts
import { z } from 'zod'

export const MySchema = z.object({
  field: z.string().min(1),
  email: z.email(),
})
```

### 2. Repository (if new methods are needed)

Create in `server/repositories/` or extend an existing one:

```ts
// Interface defines the contract
export interface MyRepository {
  findById(id: string): Promise<MyModel | null>
}

// createMyRepository(prisma) returns implementation
export function createMyRepository(prisma: PrismaClient): MyRepository {
  return {
    async findById(id) {
      return prisma.myModel.findUnique({ where: { id } })
    },
  }
}
```

Register in `server/repositories/index.ts`.

### 3. Use Case

Create in `server/use-cases/my-domain/`:

```ts
// server/use-cases/my-domain/my-use-case.ts
import type { MyRepository } from '../../repositories/my.repository'

export interface MyUseCaseInput { ... }

export type MyUseCaseResult =
  | { success: true; data: ... }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | ... }

export async function myUseCase(
  myRepo: MyRepository,
  principal: Principal | null,
  input: MyUseCaseInput
): Promise<MyUseCaseResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }
  // business rules...
  const data = await myRepo.findById(input.id)
  return { success: true, data }
}
```

Export in `server/use-cases/index.ts`.

### 4. Route

The route stays thin:

```ts
// app/api/my-domain/route.ts
import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { myRepository } from '~/server/repositories'
import { myUseCase } from '~/server/use-cases'
import { MySchema } from '~/server/schemas/my-domain.schema'

export async function POST(req: Request) {
  const principal = await getPrincipal(req)

  const body = await req.json().catch(() => null)
  const parsed = MySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const result = await myUseCase(myRepository, principal, parsed.data)

  if (!result.success) {
    const status = mapCodeToStatus(result.code)
    return NextResponse.json({ message: mapCodeToMessage(result.code) }, { status })
  }

  return NextResponse.json(result.data, { status: 201 })
}
```

## Authentication

- **getPrincipal(req)** in `lib/get-principal.ts`: returns `{ userId, role, memberships, adminCities }` or `null`
- Protected routes: `if (!principal) return 401`
- Role rules: check `principal.role` in the use case

## Error response pattern

Use cases return `{ success: false, code: '...' }`. The route maps:

| code                  | HTTP status |
|-----------------------|-------------|
| UNAUTHENTICATED       | 401         |
| FORBIDDEN             | 403         |
| NOT_FOUND             | 404         |
| EMAIL_IN_USE          | 409         |
| INVALID_CITY          | 400         |
| INVALID_STATUS        | 409         |
| INVALID_IMAGES        | 400         |
| WORKSPACE_BLOCKED     | 403         |
| MISSING_REVIEW_NOTE   | 400         |
| PET_NOT_APPROVED      | 409         |
| PET_INACTIVE          | 409         |
| PET_ALREADY_ADOPTED   | 409         |
| GUARDIAN_NOT_FOUND    | 404         |

## Available endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/me | Authenticated user context |
| POST | /api/workspaces | Create workspace (PARTNER_MEMBER) |
| GET | /api/workspaces/my | List my workspaces |
| GET | /api/workspaces/:id | Workspace details (RBAC: member, ADMIN with coverage, or SUPER_ADMIN). Query: `membersPage`, `membersPerPage` (default 20) |
| PATCH | /api/workspaces/:id | Update basic data (name, description, contacts, links). RBAC: OWNER/EDITOR, ADMIN with coverage, or SUPER_ADMIN. Partial payload. Records AuditLog. |
| PATCH | /api/workspaces/:id/location | Update primary location (cityPlaceId, lat, lng, address). Automatically adds city to coverage. `cityPlaceId` must exist and be type CITY. Transactional. AuditLog. |
| POST | /api/workspaces/:id/members | Add member by email (payload: email, role). OWNER only. Role: OWNER/EDITOR/FINANCIAL. Transactional. 409 if already a member. AuditLog. |
| DELETE | /api/workspaces/:id/members/:memberId | Remove member (soft delete, isActive=false). OWNER only. Cannot remove last OWNER. AuditLog. |
| GET | /api/workspaces/:id/interests | List adoption interests for workspace pets. OWNER/EDITOR, SUPER_ADMIN, or ADMIN with coverage. Query: page (1), perPage (20). |
| POST | /api/workspaces/:id/pets | Create pet (status DRAFT). OWNER/EDITOR only. Workspace must exist and be active. AuditLog. |
| GET | /api/pets | List public pets (APPROVED, active). Public. Query: cityPlaceId, species, page (1), perPage (20). Workspace must be active and APPROVED. |
| PATCH | /api/pets/:id | Update pet (partial). OWNER/EDITOR only. Blocked if ADOPTED. Does not change status/approvedAt. AuditLog. |
| POST | /api/pets/:id/submit-for-review | Submit pet DRAFT to PENDING_REVIEW. Requires 1–5 images, 1 isCover, minimum data. Workspace active. Transactional + AuditLog. |
| POST | /api/pets/:id/images | Add image (url, storagePath, position 1–5, isCover). storagePath: pets/{petId}/... Max 5. Transactional + cover swap. AuditLog. |
| PATCH | /api/pets/:petId/images/:imageId | Update position and/or isCover. Transactional (position swap, unmark cover). AuditLog. Does not change status. |
| DELETE | /api/pets/:petId/images/:imageId | Remove image. OWNER/EDITOR. If cover is removed, next by position becomes cover. Cannot remove last image if pet is PENDING_REVIEW. 204. AuditLog DELETE. |
| POST | /api/pets/:id/interests | Register adoption interest. GUARDIAN only. Optional body: `{ message }`. Pet APPROVED and active. Workspace active and APPROVED. AuditLog CREATE ADOPTION_INTEREST. |
| POST | /api/admin/pets/:id/approve | Approve pet in PENDING_REVIEW. SUPER_ADMIN or ADMIN with workspace city coverage. Pet: 1–5 images, 1 isCover. Workspace active. Transactional + AuditLog APPROVE. |
| POST | /api/admin/pets/:id/reject | Reject pet in PENDING_REVIEW. Body: `{ reviewNote: string }`. SUPER_ADMIN or ADMIN with coverage. Workspace active. Transactional + AuditLog REJECT with reviewNote in metadata. |
| POST | /api/adoptions | Register adoption. Body: `{ petId, guardianUserId, adoptedAt?, notes? }`. OWNER/EDITOR, SUPER_ADMIN, or ADMIN with coverage. Pet APPROVED. Creates Adoption + follow-ups 30d/6m/1y. AuditLog CREATE ADOPTION + STATUS_CHANGE PET. |
| GET | /api/adoptions/:id | Adoption details (pet, guardian, workspace, follow-ups). Access: guardian, workspace OWNER/EDITOR, SUPER_ADMIN, or ADMIN with coverage. |

## Zod

- Use `z.email()` and `z.uuid()` (Zod 4)
- Validation in the route; use case receives already-validated data
- Error: `{ message: 'Invalid payload', details: parsed.error.issues }` with status 400
