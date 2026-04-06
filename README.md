# BeTheHero

**Plataforma de adoção responsável de animais — conectando tutores, organizações parceiras e administradores.**

---

## Visao geral

O **BeTheHero** conecta **pessoas que querem adotar ou ajudar** com **projetos parceiros** que resgatam e cuidam de animais — ONGs, protetores, clinicas e petshops com iniciativa de adocao.

Um hub confiavel, com curadoria, responsabilidade e transparencia.

---

## Status do projeto

| Camada | Status |
|---|---|
| API (REST) | ✅ 100% completa (70+ endpoints) |
| GraphQL | ✅ Infraestrutura + escopo guardian |
| Frontend | ✅ Todos os sprints (F0–F5) |
| Design System | ✅ 13+ componentes |
| Auth | ✅ JWT + RBAC + middleware |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5.9 (strict) |
| Banco | PostgreSQL + Prisma 7 |
| Auth | JWT (httpOnly cookie) + CASL RBAC |
| GraphQL | graphql-yoga + Pothos + graphql-request + codegen |
| Validacao | Zod 4 |
| Forms | React Hook Form 7 + zodResolver |
| Data fetching | React Query 5 |
| Estado | Zustand 5 |
| UI | shadcn/ui (Radix) + TailwindCSS 4 |
| Icons | lucide-react |
| Toasts | sonner |

---

## Portais

### Publico (`/`)
- Landing page, listagem de pets, detalhe do pet, perfil publico do workspace, campanhas

### Guardian (`/guardian/*`)
- Meus interesses (retirar), minhas adocoes (timeline de follow-up), perfil

### Workspace (`/workspaces/{id}/*`)
- Dashboard com metricas, gestao de pets, interesses recebidos, campanhas, configuracoes

### Admin (`/admin/*`)
- Dashboard com metricas da plataforma, filas de aprovacao (pets, workspaces, campanhas, doacoes, follow-ups), cobertura de cidades, logs de auditoria

---

## Estrutura do monorepo

```
apps/web/src/
  app/
    (public)/          → Paginas publicas
    (auth)/            → Login, registro, verificacao, reset senha
    (guardian)/         → Portal do tutor
    (workspace)/        → Portal do workspace
    (admin)/            → Painel admin
  server/
    graphql/            → Schema, context, types, queries, mutations
    repositories/       → Acesso a dados (Prisma)
    use-cases/          → Logica de negocio
    schemas/            → Validacao Zod
  components/
    ui/                 → Primitivos (Button, Card, Input, Dialog...)
    features/           → Componentes por dominio (guardian/, workspaces/, admin/, campaigns/)
  graphql/
    hooks/              → React Query hooks (useMe, useMyInterests, useAdoption...)
    operations/         → .graphql operation files
  lib/                  → Utilitarios (auth, db, graphql-client, session)
  providers/            → QueryProvider
packages/
  auth/                 → CASL RBAC (@bethehero/auth)
  env/                  → Validacao de env (@bethehero/env)
```

---

## Pre-requisitos

- Node.js >= 18
- pnpm 9.x
- Docker (para PostgreSQL)

## Como comecar

```bash
# Instalar dependencias
pnpm install

# Subir o banco
docker compose up -d

# Gerar Prisma client
cd apps/web && pnpm db:generate

# Rodar migrations
cd apps/web && pnpm db:migrate

# Iniciar desenvolvimento
pnpm dev
```

Acesse [http://localhost:3001](http://localhost:3001).

## Comandos

| Comando | Descricao |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento (porta 3001) |
| `pnpm build` | Build de producao |
| `pnpm lint` | tsc + ESLint (0 warnings) |
| `pnpm lint-fix` | Auto-fix ESLint |
| `pnpm prettier-format` | Formatar codigo |
| `pnpm codegen` | Gerar tipos GraphQL |
| `pnpm db:generate` | Gerar Prisma client |
| `pnpm db:migrate` | Rodar migrations |
| `pnpm db:studio` | Prisma Studio UI |

## Usuarios de teste

| Email | Senha | Role |
|---|---|---|
| `guardian@bth.dev` | `Pass1234!` | GUARDIAN |
| `partner_test@example.com` | `Pass1234!` | PARTNER_MEMBER (OWNER) |
| `admin@bth.dev` | `Pass1234!` | ADMIN |
| `superadmin@bth.dev` | `Pass1234!` | SUPER_ADMIN |

## Swagger

Documentacao da API disponivel em `/api-docs` (dev only).

---

## Atuacao inicial (MVP)

- **Estado:** Paraiba (PB)
- **Cidades piloto:** Joao Pessoa, Campina Grande, Bayeux, Santa Rita

---

## Licenca

A definir.
