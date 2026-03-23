# Exploration — Sprint F1: Public Marketing Pages

## Figma Screens Analyzed

### Home / Hero (GmOkZ9Epiz0PyK2jUMHiWD / 201:2) — desktop 1440×820
- Background: `#F15156` full page
- **Nav**: Logo (paw + wordmark, white) at top-left. Location pill (PE/Recife) top-right area.
- **Hero left**: "Leve a felicidade para o seu lar" — 72px Nunito 700 white, line-height 1.1, letter-spacing -2%
- **Subtext**: "Encontre o animal de estimação ideal para seu estilo de vida!" — 24px Nunito 600 white
- **Social proof**: 4 avatars (32×32, 3px `#F15156` stroke, overlapping) + "324 amigos na sua cidade" Nunito 800 16px white
- **CTA button**: 280×72px, `#E44449`, `border-radius: 20px`, text "Busque um amigo:" 16px + location selector
- **Hero right**: Pet illustration SVG (592×305px) at x:736, y:193

### Landing Variant (R53haW9oTKnx7ucm3mP80N / 1:6) — desktop 1440×812
- Same brand colors confirmed
- **CTA**: 492×72px, `#E44449`, text "Acesse agora" Nunito 800 20px centered, text color `#0D3B66` (navy)
- **Social proof group**: avatars left, "324 amigos na sua cidade" right, Nunito 800 16px white
- **Gradient panel** (right side): `linear-gradient(157deg, rgba(243,106,111,1) 17%, rgba(228,68,73,1) 87%)`, 592×541px, `border-radius: 20px`
- Photo: 464×552px pet photo (removebg)

### Landing LP (R53haW9oTKnx7ucm3mP80N / 1:180) — full-page white bg
- **Features section**: white bg
- Section title: 48px Nunito 700 `#0D3B66`, letter-spacing -2%
- 3 feature cards, each: `#FDECED` fill @ 50% opacity, `border-radius: 20px`, emoji (30px) + description (14px Nunito 400 `#000000`)
- Card content:
  - 🐕 "O FindAFriend é um produto desenvolvido para você encontrar o animal de estimação ideal ao seu estilo de vida!"
  - 🐈 "ONGs cadastram os bichinhos disponíveis para adoção informando características como: porte, nível de energia, nível de independência, sociabilidade e gênero."
  - 🦮 "Filtre os bichinhos de acordo com suas preferências e lifestyle. Depois é só entrar em contato com a ONG para agendar uma visita e conhecer pessoalmente seu match perfeito!"
- Section subtitle: 48px, "Um app não, uma caixinha de amigos..."

### Mobile Landing (R53haW9oTKnx7ucm3mP80N / 1:1059) — 360×1941px
- Same structure, hero text 44px (not 72px)
- Mobile hero text style: Nunito 700 44px, line-height 1.1, letter-spacing -2%
- Full-width CTA button
- Feature cards stacked vertically

### Mobile Dropdown Menu (R53haW9oTKnx7ucm3mP80N / 1:150) — 360×283px
- Background: `#E44449`
- `border-radius: 0px 0px 20px 20px` (bottom-rounded only)
- Logo top-left (31.4×32.56 px — small version)
- Close (X) icon top-right, 40×40px
- Nav items column, gap 12px, x:20, y:107:
  - "Home" — Nunito 700 18px white (active state)
  - "Sobre o app" — Nunito 600 18px white @ 50% opacity
  - "Animais disponíveis" — same inactive
  - "Sobre a FindAFriend" — same inactive
  - "contato" — same inactive
- Separator: white 1px stroke, 20% opacity, at y:80

## Existing Code State

### Route structure
- Only `app/page.tsx` exists (placeholder component)
- No `(public)` route group yet
- No `components/features/` directory

### Components available
- All design system components done (Sprint F0)
- `Logo`, `LogoIcon`, `LogoWordmark` available
- `Button`, `Badge`, `Card`, `Avatar`, `Input`, `Label`, `Select`, `Dialog` available

### No conflicting code
- No existing nav, no existing landing page structure
- Clean slate for `(public)` route group
