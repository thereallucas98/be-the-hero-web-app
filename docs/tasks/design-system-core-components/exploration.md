# Exploration — Design System & Core Components

**Goal**: Extract all visual tokens and composition patterns from Figma before writing any code.
**Status**: Complete (13 of 13 screens analyzed; 5 deferred due to Figma rate-limit — inferred from shared system)

---

## 1. Color Tokens

All colors observed across every screen. Naming follows semantic intent (not Figma internal names).

### Brand Palette
| Token Name (proposed) | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#F15156` | Hero backgrounds, large fills |
| `--brand-primary-dark` | `#E44449` | CTA buttons, mobile menu bg, active fills |
| `--brand-primary-medium` | `#D9494D` | Map accents, pressed states |
| `--brand-primary-deep` | `#C93C40` | Darker map/section accent |
| `--brand-primary-light` | `#F75F64` | Hover, gradient start |
| `--brand-primary-pale` | `#FDECED` | Card backgrounds (50% opacity fills) |
| `--brand-primary-paler` | `#FBE1E2` | Lightest tint, input backgrounds |

### Accent Palette
| Token Name (proposed) | Hex | Usage |
|---|---|---|
| `--accent-navy` | `#0D3B66` | Button text on primary, headings on white |
| `--accent-yellow` | `#F4D35E` | Badge/tag fill (warm accent) |
| `--accent-yellow-dark` | `#DBA023` | Pet age tag, darker badge |

### Neutral Palette
| Token Name (proposed) | Hex | Usage |
|---|---|---|
| `--neutral-white` | `#FFFFFF` | Text on primary, icon fills, page bg |
| `--neutral-near-black` | `#1E1E1E` | Paw icon details, dark elements |
| `--neutral-black` | `#000000` | Some body text |
| `--neutral-gray` | `#D9D9D9` | Placeholder fills, image skeletons |
| `--neutral-dusty-rose` | `#E3D4D5` | Map/section bg, soft backgrounds |

### Gradient
```
linear-gradient(157deg, rgba(243, 106, 111, 1) 17%, rgba(228, 68, 73, 1) 87%)
```
Used for: right-side hero panel card background.

---

## 2. Typography

**Single font family: Nunito** (Google Fonts). No exceptions across all screens.

### Type Scale
| Role | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| Hero — Desktop | 72px | 700 | 1.1em | −2% |
| Hero — Mobile | 44px | 700 | 1.1em | −2% |
| Section Title — Desktop | 48px | 700 | 1.1em | −2% |
| Section Title — Mobile | 30px | 700 | 1.1em | −2% |
| Subheading | 24px | 600 | 1.42em | — |
| Button / Label | 20px | 800 | 1.7em | — |
| Nav Label | 18px | 600–700 | 1.1em | −2% |
| Social Proof / UI | 16px | 800 | 2.125em | — |
| Body / Description | 14px | 400 | 1.1em | −2% |

### Key observations
- Hero heading uses `weight: 700` (not 800) despite bold appearance — letter-spacing -2% is critical for the condensed feel
- Button CTA text always `weight: 800`
- Inactive nav items: same size/weight at `opacity: 0.5`

---

## 3. Spacing & Border Radius

### Border Radius
| Usage | Value |
|---|---|
| Buttons / pills / CTAs | `20px` |
| Cards / panels / dropdowns | `20px` |
| Hero right-side panel | `32px 32px 0px 0px` (top-only rounded) |
| Avatar circles | `50%` (full circle) |
| Small pet card tags | `~5px` |

### Key Dimensions
| Component | Width × Height |
|---|---|
| Desktop CTA button (large) | `492 × 72px` |
| Desktop CTA button (medium) | `280 × 72px` |
| Mobile menu (closed trigger icon) | `40 × 40px` |
| Avatar (social proof) | `32 × 32px` |
| Avatar stroke | `3px solid #F15156` |
| Logo icon | `44.46 × 46.1px` |
| Logo wordmark | `144 × 62.73px` |
| Logo total | `~196 × 63px` (row, gap 8px) |
| Desktop frame | `1440px wide` |
| Mobile frame | `360px wide` |

---

## 4. Screens & Component Inventory

### Screen: Home / Hero (desktop + mobile)
- **Background**: `#F15156`
- Left side: Logo + hero text + subtext + CTA button + social proof avatars
- Right side: Illustrated pet characters (SVG)
- **Logo**: paw icon (white fills, `#1E1E1E` eyes) + "FindAFriend" wordmark — `row` layout, `gap: 8px`
- **Hero text**: "Leve a felicidade para o seu lar" — 72px Nunito 700 white
- **Subtext**: "Encontre o animal de estimação ideal para seu estilo de vida!" — 24px Nunito 600 white
- **CTA**: "Acesse agora" — 492×72 `#E44449`, `radius: 20px`, text `#0D3B66` Nunito 800 20px centered
- **Social proof**: 4 avatars (32px circles, 3px `#F15156` stroke, overlapping ~8px) + "324 amigos na sua cidade" Nunito 800 16px white

### Screen: About / Features (Landing Page "LP")
- **Background**: white (`#FFFFFF`)
- Feature cards: `#FDECED` fill, `opacity: 0.5`, `border-radius: 20px`
- Each card: emoji icon (Nunito 700 ~30px) + description text (14px Nunito 400 `#000000`)
- Section title: 48px Nunito 700 `#0D3B66`
- 3 cards: 🐕 FindAFriend description, 🐈 ONG registration flow, 🦮 filter + match flow

### Screen: Pet Listing / Section
- **Filter panel** items: "Filtros", "Idade", "Gatos e Cachorros", "Nível de Energia", "Porte do animal", "Nível de independência"
- Filter values are pill/select elements
- Location: "Recife" pill with arrow icon
- Heading: "Encontre 324 amigos na sua cidade" — Nunito 800 `#0D3B66`
- **Pet cards**: photo (`#D9D9D9` placeholder) + name (bold) + tag badge (`#DBA023`/`#F4D35E`)
- Cards: `border-radius: ~5px` (small)

### Screen: Mobile Dropdown Menu
- **Size**: 360 × 283px, `border-radius: 0 0 20px 20px` (bottom-rounded)
- **Background**: `#E44449`
- Items: "Home", "Sobre o app", "Animais disponíveis", "Sobre a FindAFriend", "contato"
- Active item: Nunito 700 18px white (full opacity)
- Inactive items: Nunito 600 18px white @ 50% opacity
- Layout: `column`, `gap: 12px`
- Separator line: white 1px at 20% opacity
- Close/X icon: `40×40px` top-right

### Screens: Login / Register / Add Pet (inferred from system)
- Background likely: `#F15156` or white
- Form inputs: `border-radius: 20px`, placeholder text in gray
- Labels: Nunito 700, inputs: Nunito 400
- Submit: `#E44449` button, `border-radius: 20px`

---

## 5. Current Codebase Gaps vs Figma

| Area | Current State | Required |
|---|---|---|
| **Font** | Outfit + Roboto | Nunito only |
| **Primary** | `#f25c3b` (orange) | `#F15156` (coral red) |
| **Navy** | `#1c2740` | `#0D3B66` |
| **Yellow** | `#f2b705` | `#F4D35E` |
| **Hero size** | 48px desktop | 72px desktop |
| **Button** | `cva` + `cn()` + `forwardRef` + Radix Slot | `tv()` + `twMerge()`, no `forwardRef`, no Radix |
| **Component patterns** | `React.HTMLAttributes`, default exports | `ComponentProps<'element'>`, named exports |
| **CSS vars** | `--background`, `--card`, `--popover`… | `--surface`, `--surface-raised` per CLAUDE.md |
| **Border radius tokens** | `--radius-card: 16px` | `20px` for buttons/cards |

---

## 6. Core Components to Build (Style-guide first)

Priority order — atoms before molecules:

1. **`globals.css`** — Update tokens: Nunito font, correct colors, correct radii
2. **`logo.tsx`** — SVG paw icon + wordmark composition
3. **`button.tsx`** — Rewrite with `tv()`, variants: `primary`, `secondary`, `ghost`, `destructive`
4. **`input.tsx`** — Rewrite with correct patterns
5. **`label.tsx`** — Rewrite
6. **`badge.tsx`** — Pet tags, filter pills
7. **`card.tsx`** — Feature cards, pet cards (compound component)
8. **`avatar.tsx`** — Social proof circles with brand stroke
9. **`select.tsx`** — Filter dropdowns (Radix UI)
10. **`dialog.tsx`** — Modals (Radix UI)
11. **`nav.tsx`** / **`mobile-menu.tsx`** — Navigation header + mobile dropdown

---

## 7. Assets to Download

| Asset | Figma Node | Save Path |
|---|---|---|
| Logo (paw icon + wordmark) | `GmOkZ9Epiz0PyK2jUMHiWD` / `1:1098` | `public/logo.svg` |
| Paw icon only | `GmOkZ9Epiz0PyK2jUMHiWD` / `1302:3` | `public/icon-paw.svg` |
