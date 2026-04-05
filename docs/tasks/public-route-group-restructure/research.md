# Research — Public Route Group Restructure

## Decision 1 — What to do with `(public)/layout.tsx`

**Options:**
- A) Delete it — each sub-group gets its own layout
- B) Keep it empty as a pass-through `<>{children}</>`

**Decision: A — delete it.**

An empty pass-through layout adds a file with no purpose. Next.js does not require a layout at every route group level — if none exists, it falls through to the root layout. Deleting keeps the structure clean.

---

## Decision 2 — Named export in the current layout

Current `(public)/layout.tsx` exports both `PublicLayout` (named) and `default`.
The named export is unused by Next.js — only `default` is consumed by the router.

**Decision:** The new `(marketing)/layout.tsx` exports `default` only — drop the named export.

---

## Decision 3 — `(detail)/layout.tsx` content

**Options:**
- A) `export default function DetailLayout({ children }) { return <>{children}</> }`
- B) No layout file at all (fall through to root)

**Decision: A — explicit bare layout.**

Makes the intent clear to future developers: detail pages deliberately have no nav shell. Without the file, someone might wonder if the missing header/footer is a bug. The explicit file documents the decision.

---

## Summary

Pure file moves + two trivial layout files. No logic, no import, no API changes.
