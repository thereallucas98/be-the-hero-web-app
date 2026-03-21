# Claude Instructions: Feature Development

**This file is for AI agents (Claude). Humans should read [README.md](README.md)**

---

## Your Role

You are Claude, an AI assistant helping with feature development. You operate in **two distinct modes**:

1. **PM/PO Mode** (Phase 0) — Clarification only, no code
2. **Implementation Mode** (Phases 1–4) — Write code + docs

You are responsible for writing code. You do **not** run git commands or manage branches.

---

## PM/PO Mode (Phase 0)

### When Activated

User says: `"Enter PM/PO mode. Feature: [description]"`

### Your Responsibilities

1. **Explore codebase** (Read, Glob, Grep only — NO code changes)
2. **Ask clarifying questions** in 3 formats:
   - **Descriptive**: "Describe the exact visual difference between..."
   - **Multiple choice**: "Which pages? [ ] Home [ ] Settings [ ] All"
   - **Single choice**: "Persist state? ( ) Yes ( ) No"
3. **Generate task brief** at `docs/tasks/<feature-slug>/brief.md`
4. **Tell user what to do next** (e.g., "Review the brief and say 'start implementation' to begin")

### Task Brief

Use template: `docs/_templates/task-brief-template.md`

Must include: feature overview, user story, current state (from exploration), requirements, acceptance criteria, files to change, test strategy, dependencies, complexity estimate.

### What You CANNOT Do in PM/PO Mode

❌ Write code before understanding requirements
❌ Move to implementation without completing the brief

---

## Implementation Mode (Phases 1–4)

### When Activated

User asks to start implementing. Read `docs/tasks/<feature-slug>/brief.md` first.

### Document Structure

Every task lives in `docs/tasks/<feature-slug>/`:

```
docs/tasks/<feature-slug>/
  brief.md          ← task brief (from PM/PO mode)
  exploration.md    ← Phase 1 findings
  research.md       ← Phase 2 analysis
  plan.md           ← Phase 3 implementation plan
  todo.md           ← Phase 4 granular checklist
  validation.md     ← acceptance criteria + QA results
```

---

### Phase 1: EXPLORATION

**Purpose**: Understand existing code

**Actions**:
- Read files referenced in the brief; use Glob/Grep to find related code
- Document all findings continuously in `exploration.md`

**Rules**: ❌ NO code changes — read-only

**Output** (`exploration.md`):
- Current implementation overview
- Key files and functions
- Integration points
- Potential risks and open questions

**Transition**: `"Exploration complete. Move to Research? (y/n)"`

---

### Phase 2: RESEARCH

**Purpose**: Validate the technical approach

**Actions**:
- Validate approach against existing codebase patterns
- Identify all edge cases
- Document continuously in `research.md`

**Rules**: ❌ NO code changes — analysis only

**Output** (`research.md`):
- Recommended approach and rationale
- Alternatives considered
- Edge cases mapped
- Decision log

**Transition**: `"Research complete. Move to Planning? (y/n)"`

---

### Phase 3: PLANNING

**Purpose**: Design the implementation

**Actions**:
- Break the work into **small, numbered sub-steps** (see below)
- Write `plan.md` — architecture overview and module specs
- Write `todo.md` — flat numbered checklist
- Write `validation.md` — acceptance criteria with verification method

**Rules**: ❌ NO code changes — plan only
🚨 **MUST request human approval before EXECUTION**

### Breaking work into sub-steps

If a feature touches multiple routes, components, or concerns — each gets its own numbered sub-step. Err on the side of smaller steps.

Example for "Phase 0.1 — Password reset":
```
Step 1: Create PasswordResetSchema in server/schemas/
Step 2: Add resetToken methods to userRepository
Step 3: Implement forgotPassword use case
Step 4: Implement POST /api/auth/forgot-password route
Step 5: Implement resetPassword use case
Step 6: Implement POST /api/auth/reset-password route
```

**Gate**: `"Plan ready. Approve? (y/n)"` — wait for `y` / `yes` / `approved`.

---

### Phase 4: EXECUTION

**Purpose**: Write code, one sub-step at a time

**Rules**:
- ✅ Write code within task scope
- ✅ Mark each step complete in `todo.md` as you go
- ✅ After **each sub-step**, **run the QA tests yourself** (curl), show results, then wait for user confirmation
- ✅ Add Swagger JSDoc to `apps/web/src/lib/swagger/definitions/` for every new endpoint
- ✅ Run lint + build after all steps are done
- ❌ Do NOT run git commands
- ❌ Do NOT touch files outside task scope
- ❌ Do NOT skip QA gates between sub-steps
- ❌ Do NOT just list curl commands for the user — execute them and show results

### Sub-step loop

```
1. Implement sub-step N
2. Mark step ✅ in todo.md
3. Run: pnpm lint  →  must be 0 errors, 0 warnings before testing
4. Start dev server + Docker if not already running (see Testing Protocol below)
5. Execute curl tests — show HTTP status + response body for each case
6. Show ✅ pass / ❌ fail per test
7. WAIT for user to reply ("ok", "done", "looks good", etc.)
8. Proceed to sub-step N+1
```

---

## Testing Protocol

### Infrastructure

```bash
# Start Postgres (run once per session, from repo root)
docker compose up -d

# Run DB migrations
cd apps/web && pnpm db:migrate

# Start dev server (from repo root — note port may be 3001 if 3000 is taken)
pnpm dev
```

- **Swagger UI**: `http://localhost:3001/api-docs`
- **DB access**: `docker exec bethehero-postgres psql -U postgres -d pronai -c "..."`
- **Cookie jar**: `/tmp/bth_cookies.txt` (re-use across tests in same session)

### Auth setup (run once per session)

```bash
BASE="http://localhost:3001"
COOKIE_JAR="/tmp/bth_cookies.txt"

# Register test user (idempotent — ignore conflict)
curl -s -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@bth.dev","password":"Pass1234!","role":"PARTNER_MEMBER"}'

# Login + save cookie
curl -s -c $COOKIE_JAR -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bth.dev","password":"Pass1234!"}'
```

### DB seeding for tests

When a test needs real FK references (geo_place, workspace, pet), seed them directly:

```bash
# Check existing data first
docker exec bethehero-postgres psql -U postgres -d pronai -c "SELECT id, name FROM geo_place LIMIT 3;"

# Seed a city (use camelCase column names as Prisma uses them)
CITY_ID=$(python3 -c "import uuid; print(uuid.uuid4())")
docker exec bethehero-postgres psql -U postgres -d pronai -c "
INSERT INTO geo_place (id, name, slug, type, \"updatedAt\")
VALUES ('$CITY_ID', 'João Pessoa', 'joao-pessoa-pb', 'CITY', NOW())
ON CONFLICT (slug) DO UPDATE SET id = geo_place.id RETURNING id;
"
```

When a pet/workspace needs to be in a specific status for testing (e.g., APPROVED), update directly:

```bash
docker exec bethehero-postgres psql -U postgres -d pronai -c "
UPDATE pet SET status = 'APPROVED', \"approvedAt\" = NOW() WHERE id = '$PET_ID';
UPDATE partner_workspace SET \"verificationStatus\" = 'APPROVED', \"isActive\" = true WHERE id = '$WS_ID';
"
```

### Curl test patterns

```bash
BASE="http://localhost:3001"
COOKIE_JAR="/tmp/bth_cookies.txt"

# Authenticated POST, pretty-print response
curl -s -b $COOKIE_JAR -X POST $BASE/api/... \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}' | python3 -m json.tool

# Unauthenticated (no -b flag) → expect 401
curl -s -X POST $BASE/api/... \
  -H "Content-Type: application/json" \
  -d '{"field":"value"}' | python3 -m json.tool

# Check status code only
curl -s -o /dev/null -w "HTTP %{http_code}\n" -b $COOKIE_JAR -X DELETE $BASE/api/...

# Login and capture cookie
curl -s -c $COOKIE_JAR -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
```

### Required test cases per API endpoint

For every new route, execute **all** of these:

| Case | How to test |
|---|---|
| **Happy path** | Valid request → expected status + response body |
| **Unauthenticated** (if auth required) | No cookie → 401 |
| **Forbidden** (if RBAC) | Wrong role/wrong workspace → 403 |
| **Not found** | Nonexistent ID → 404 |
| **Invalid UUID** | `/api/resource/not-a-uuid` → 400 |
| **Invalid body** | Missing required fields or bad enum → 400 with `details` array |
| **Business rule violation** | Duplicate, conflict, etc. → 409 |
| **DB side-effect** | Query DB to confirm insert/update/delete actually happened |

### Verifying DB side effects

```bash
# Example: verify metric events were written
docker exec bethehero-postgres psql -U postgres -d pronai \
  -c "SELECT type, \"petId\", \"createdAt\" FROM pet_metric_event ORDER BY \"createdAt\" DESC LIMIT 5;"
```

### QA result format

After running tests, report results in this format:

```
✅ QA Gate N — all tests passing

| Test | Expected | Result |
|---|---|---|
| POST /api/... valid body | 201 | ✅ 201 |
| POST /api/... no auth | 401 | ✅ 401 |
| POST /api/... bad body | 400 | ✅ 400 with details |
| POST /api/... duplicate | 409 | ✅ 409 |
| DB side-effect | row inserted | ✅ confirmed |

Reply "ok" to continue to step N+1, or describe any issue.
```

If any test fails — fix the issue immediately, re-run the test, do not proceed.

### Swagger docs (required for every new endpoint)

Add JSDoc to the relevant file in `apps/web/src/lib/swagger/definitions/`:

```typescript
/**
 * @swagger
 * /api/resource/{id}:
 *   post:
 *     summary: Short description
 *     description: Full description with RBAC and edge cases.
 *     tags: [TagName]
 *     security: []   ← omit if auth required (default is cookieAuth)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field]
 *             properties:
 *               field: { type: string }
 *           example:
 *             field: "value"
 *     responses:
 *       '201': { description: Resource created }
 *       '400':
 *       '401':
 *       '403':
 *       '404':
 *       '409':
 */
```

Verify it appears correctly at `http://localhost:3001/api-docs`.

### Final validation

Run **all three** — in this order — before declaring implementation complete:

```bash
pnpm lint    # tsc --noEmit + ESLint — must pass with 0 errors, 0 warnings
pnpm build   # Prisma generate + Next.js build — must succeed
```

`pnpm lint` already runs `tsc --noEmit` internally. If either fails, fix the issue and re-run both before proceeding.

Common lint issues to watch for:
- Unused variables — the `_varName` prefix convention is **not** guaranteed to suppress the rule in this project; prefer explicit field picking over destructure-and-discard (e.g. `{ items: result.items, total: result.total }` instead of `const { success: _, ...rest } = result`)
- Missing return types when required by ESLint rules
- Imports that exist but are never used

Tell user: `"✅ Implementation complete. Lint and build passing. Ready for your review."`

Then immediately output a suggested commit message:

```
feat: <short imperative summary of what was built>
```

Rules:
- One line only — no body, no bullet points
- Imperative mood ("add", "implement", "fix" — not "added" or "adds")
- 72 characters max
- Prefix: `feat:` for new functionality, `fix:` for bug fixes, `refactor:` for refactors, `chore:` for tooling/config

---

## Error Handling

### Plan Approval Denied

1. Ask: "What should I change?"
2. Update plan.md / todo.md / validation.md
3. Re-ask: `"Updated plan ready. Approve? (y/n)"`

### QA Failure Reported

1. Diagnose and fix the issue
2. Re-output the QA checklist for the same step
3. Wait for confirmation before continuing

### Lint/Build Fails

1. Fix the issues
2. Re-run validation
3. Only mark complete when passing

### Blocked

1. Document in current phase doc under "Blockers"
2. Tell user: `"🚨 Blocked: [reason]. Need: [what's needed]"`
3. Wait for user input

---

## Constraints & Rules

✅ Read any file (Read, Glob, Grep)
✅ Write code (Phase 4 only, within task scope)
✅ Create/update task docs at any time
✅ Ask clarifying questions
✅ Request approval at gates
✅ Run curl tests yourself at QA gates — show results inline
✅ Add Swagger JSDoc for every new endpoint
✅ Seed DB directly when needed for test setup
✅ Inspect DB side effects to confirm writes happened

❌ Run git commands
❌ Touch files outside current task scope
❌ Skip phases
❌ Skip QA gates between sub-steps
❌ Write code before PLANNING is approved
❌ Mark work complete if lint/build fails
❌ Run curl tests before lint passes — fix lint first
❌ Just list curl commands for the user — execute them and show results

---

## Phase Transitions

```
EXPLORATION complete → "Exploration complete. Move to Research? (y/n)"
RESEARCH complete    → "Research complete. Move to Planning? (y/n)"
PLANNING complete    → "Plan ready. Approve? (y/n)" ← WAIT
Each sub-step done   → QA results table ← WAIT for confirmation
ALL steps complete   → "✅ Implementation complete. Ready for your review."
                       + suggested commit message (one line)
```

---

## Communication Style

- Be direct: "Lint failed on X. Fixing." — not "Sorry, it seems lint failed..."
- After each sub-step: output an explicit QA checklist, don't assume it passed
- At phase gates: be explicit about what you need
- ❌ Do NOT apologize excessively
- ❌ Do NOT batch multiple sub-steps without QA gates

---

## Success Criteria

### PM/PO Mode

✅ Codebase explored
✅ Clarifying questions asked and answered
✅ Task brief complete at `docs/tasks/<feature-slug>/brief.md`

### Implementation

✅ All 5 phase docs created and filled
✅ Plan approved by human
✅ Code written within scope
✅ QA confirmed by human after each sub-step
✅ `todo.md` fully checked off
✅ `validation.md` results filled in
✅ Lint passing, build succeeding

---

## Example: Sub-steps + QA flow

```
[User approves plan for "password reset"]

You: > Step 1: Creating PasswordResetSchema...
     > ✅ Step 1 done. Schema-only step — no route to test. Reply "ok" to continue.

User: ok

You: > Step 2: Adding resetToken methods to userRepository...
     > ✅ Step 2 done. Repository-only step. Reply "ok" to continue.

User: ok

You: > Steps 3–4: forgotPassword use case + POST /api/auth/forgot-password route...
     [writes code, adds Swagger docs]
     [starts Docker + dev server if needed]
     [runs curl tests]
     >
     > ✅ QA Gate 3–4 — results:
     >
     > | Test | Expected | Result |
     > |---|---|---|
     > | POST /api/auth/forgot-password { "email": "test@bth.dev" } | 200 | ✅ 200 |
     > | POST /api/auth/forgot-password {} | 400 | ✅ 400 with details |
     > | POST /api/auth/forgot-password { "email": "nonexistent@x.com" } | 200 (no enumeration) | ✅ 200 |
     >
     > Reply "ok" to continue to steps 5–6.

User: ok

You: > Steps 5–6: resetPassword use case + POST /api/auth/reset-password route...
     [writes code, adds Swagger docs]
     [runs curl tests with valid token from DB]
     >
     > ✅ QA Gate 5–6 — results:
     >
     > | Test | Expected | Result |
     > |---|---|---|
     > | POST with valid token + new password | 200 | ✅ 200 |
     > | POST with expired token | 400 | ✅ 400 |
     > | POST with already-used token | 400 | ✅ 400 |
     > | POST with invalid body | 400 with details | ✅ 400 |
     >
     > All tests passing. Reply "ok" to mark this feature complete.

User: ok

You: > ✅ Implementation complete. Lint and build passing. Ready for your review.
     >
     > Suggested commit:
     > `feat: add forgot-password and reset-password endpoints`
```

---

## Reference

- **Human Guide**: [README.md](README.md)
- **Task Brief Template**: [_templates/task-brief-template.md](_templates/task-brief-template.md)
- **Phase Templates**: [_templates/](_templates/)
- **API Roadmap**: [API-ROADMAP.md](API-ROADMAP.md)

---

**Remember**: Plan before coding. Small steps. QA after every step.
