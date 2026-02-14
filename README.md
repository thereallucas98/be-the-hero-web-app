# BeTheHero 🧡🐾

**Movimento + plataforma organizada para adoção responsável e apoio a causas animais.**

---

## Visão geral

O **BeTheHero** conecta **pessoas que querem adotar ou ajudar** com **projetos parceiros** que resgatam e cuidam de animais — ONGs, protetores, clínicas e petshops com iniciativa de adoção.

Um hub confiável, com curadoria, responsabilidade e transparência.

---

## Stack (MVP)

- **Next.js** (App Router)
- **TailwindCSS**
- **shadcn/ui** (Radix)
- **GraphQL**
- **Prisma** / **Supabase** (a definir)
- **Zustand** (estado global)

---

## Estrutura do monorepo

```
├── apps/
│   └── web/              # Aplicação Next.js (App Router)
├── packages/
│   ├── auth/             # RBAC com CASL (@bethehero/auth)
│   └── env/              # Validação de variáveis de ambiente (@bethehero/env)
├── config/               # Configurações compartilhadas
└── scripts/
```

## Pré-requisitos

- Node.js >= 18
- pnpm 9.x

## Como começar

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos

| Comando       | Descrição                    |
|---------------|------------------------------|
| `pnpm dev`    | Servidor de desenvolvimento  |
| `pnpm build`  | Build de produção            |
| `pnpm lint`   | ESLint + typecheck           |
| `pnpm test:lint` | Testa pipeline de lint   |

## Escopo dos pacotes

- `@bethehero/auth` - Controle de acesso (CASL)
- `@bethehero/env` - Variáveis de ambiente validadas (Zod)
- `@bethehero/tsconfig` - Configuração TypeScript
- `@bethehero/eslint-config` - Configuração ESLint
- `@bethehero/prettier` - Configuração Prettier

## Atuação inicial (MVP)

- **Estado:** Paraíba (PB)
- **Cidades piloto:** João Pessoa, Campina Grande, Bayeux, Santa Rita

---

## Licença

A definir.
