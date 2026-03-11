# Feature Development Workflow

**Build features with Claude Code using a phased approach**

---

## 💬 How to Start a Feature

### Step 1: Clarify (Chat with Claude)

```
Enter PM/PO mode.

Feature: [Describe what you want to build]
```

Claude will:
- Explore the codebase
- Ask clarifying questions
- Generate a task brief at `frontend/docs/tasks/<feature-name>/brief.md`

### Step 2: Approve Plan

Claude will explore, research, and create a plan. When asked:

```
Claude: "Implementation plan ready. Approve? (y/n)"
You: y
```

### Step 3: Let Claude Code

Claude writes the code automatically.

### Step 4: Review & Commit

Review the changes, then commit when ready.

---

## 🎯 The 6-Phase Workflow

```
Phase 0: Clarify    → Chat with Claude (PM/PO mode)
Phase 1: Explore    → Claude reads existing code
Phase 2: Research   → Claude analyzes approach
Phase 3: Plan       → Claude creates plan → YOU APPROVE ✅
Phase 4: Execute    → Claude writes code
Phase 5: Review     → You review and commit
```

**Your job**: Answer questions (Phase 0), Approve plan (Phase 3), Review and commit (Phase 5)

**Claude's job**: Everything else

---

## 🔥 Real Example

```
You: "Enter PM/PO mode. Feature: Add search bar to Digital Agents page"

Claude: [Explores code, asks questions]
        Q1: Should search be real-time?
        Q2: Which tabs to search? [Reports] [Missions] [About]

You: [Answer questions]

Claude: ✅ Task brief generated at frontend/docs/tasks/digital-agents-search/brief.md

Claude: [Phase 1-4 automatically]
        ✅ Done! Lint passing, build succeeds.

You: [Review changes and commit]
```

---

## 📋 Common Commands

```bash
# Development (hierarchical: remotes boot first, then host)
pnpm dev              # Host + Agents remote
pnpm dev:host         # Host only (no MF remotes)
pnpm dev:avo          # Host + Agents + AVO remotes

# Check status
git status
pnpm lint
pnpm build

# Validate code
pnpm lint:fix
pnpm test:unit
```

---

## 🤔 FAQ

**Q: Do I need to read all the docs?**
A: No, just this page.

**Q: Can I skip PM/PO mode?**
A: Yes for trivial changes (1-2 files). Use it for complex features.

**Q: When should I use PM/PO mode?**
A: Use it when:
- Requirements are vague
- Backend changes might be needed
- Feature is complex (3+ files)

---

## 📂 File Structure

```
Manufacturing-AI/
├── frontend/
│   ├── docs/
│   │   ├── README.md (this file)
│   │   ├── CLAUDE-INSTRUCTIONS.md (for AI)
│   │   ├── tasks/<feature>/brief.md (generated)
│   │   ├── tasks/<feature>/YYYY-MM-DD-phase.md (logs)
│   │   └── _templates/ (templates)
│   └── src/ (your code)
```

---

## ⚡ Cheat Sheet

### Start Feature
```
"Enter PM/PO mode. Feature: [description]"
```

### Check Status
```bash
git status                  # Current status
pnpm lint && pnpm build     # Validate
```

### Commit Template
```bash
git commit -m "<type>: <summary>

<optional details>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `chore`

---

## 🚨 Troubleshooting

### Lint fails
```bash
pnpm lint:fix
```

### Build fails
```bash
rm -rf node_modules .cache
pnpm install
pnpm build
```

---

## 📖 For Claude: AI Instructions

Claude should read: **[CLAUDE-INSTRUCTIONS.md](CLAUDE-INSTRUCTIONS.md)**

That file contains:
- PM/PO mode protocols
- Phase responsibilities
- What Claude can/cannot do
- Documentation requirements

---

## 📋 Templates

- **[Task Brief Template](_templates/task-brief-template.md)** - PM/PO phase output
- **[Phase Template](_templates/phase-template.md)** - Implementation phase docs
- **[Claude Context Template](_templates/claude-context-template.txt)** - Task constraints

---

## 🎬 Timeline Example

```
09:00  PM/PO mode (Feature) - 10 min
09:10  Phases 1-3 (auto) - 40 min
09:50  YOU: Approve plan
09:50  Phase 4: Claude codes (auto) - 2 hours
12:00  YOU: review + commit - 10 min
```

---

**That's it! Start your first feature now:**

```
"Enter PM/PO mode. Feature: [your feature description]"
```
