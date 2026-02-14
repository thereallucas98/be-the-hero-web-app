# BeTheHero — Style Guide v1.0

## Identidade

BeTheHero é um movimento + plataforma organizada.
A identidade visual equilibra:

- Acolhimento
- Confiança
- Comunidade
- Estrutura

Sem parecer infantil. Sem parecer corporativo frio.
Visual moderno, humano e responsável.

---

## Tipografia

### Marca (Outfit)

- **Fonte:** Outfit
- **Pesos:** 700 (Bold) ou 800 (ExtraBold)
- **Uso:** Logo, Hero titles, grandes chamadas
- **Letter spacing:** -1%
- **Classe Tailwind:** `font-display`

### Sistema UI (Roboto)

- **Fonte:** Roboto
- **Pesos:** 400 (corpo), 500 (subtítulos), 600 (botões), 700 (títulos médios)
- **Classe Tailwind:** `font-sans` (padrão do body)

---

## Escala Tipográfica

| Uso           | Desktop | Mobile | Classe           |
|---------------|---------|--------|------------------|
| Hero          | 48px    | 32px   | `text-hero`      |
| Section Title | 32px    | 24px   | `text-section-title` |
| Subsection    | 24px    | —      | `text-subsection` |
| Body          | 16px    | 16px   | `text-body`      |
| Small         | 14px    | —      | `text-small`     |
| Caption       | 12px    | —      | `text-caption`   |

**Line-height:** Títulos 120–130%, Corpo 150%

---

## Paleta de Cores

### Hero Orange (Primária)

| Token               | Hex       | Uso                          |
|---------------------|-----------|------------------------------|
| `hero-orange`       | #F25C3B   | Botões, CTAs, destaques      |
| `hero-orange-hover` | #E14A2A   | Hover                        |
| `hero-orange-light` | #FFE7E2   | Backgrounds claros           |

### Deep Navy (Confiança)

| Token            | Hex     | Uso                    |
|------------------|---------|------------------------|
| `deep-navy`      | #1C2740 | Header, títulos        |
| `deep-navy-hover`| #141C2E | Hover                  |
| `deep-navy-light`| #E8EDF5 | Backgrounds            |

### Responsible Green

| Token                  | Hex     | Uso (status positivo)  |
|------------------------|---------|------------------------|
| `responsible-green`    | #2E7D5B | Doação/adoção confirmada |
| `responsible-green-light` | #E6F3EC | Backgrounds         |

### Warm Support Yellow

| Token             | Hex     | Uso (avisos, pendências) |
|-------------------|---------|---------------------------|
| `warm-yellow`     | #F2B705 | Avisos                    |
| `warm-yellow-light` | #FFF4CC | Backgrounds            |

### Neutros

| Token           | Hex     |
|-----------------|---------|
| `white`         | #FFFFFF |
| `bg-page`       | #F8FAFC |
| `border-default`| #E2E8F0 |
| `text-primary`  | #2D3748 |
| `text-secondary`| #718096 |

---

## Border Radius

| Elemento | Valor  | Classe Tailwind  |
|----------|--------|------------------|
| Cards    | 16px   | `rounded-card`   |
| Botões   | 12px   | `rounded-button` |
| Inputs   | 10px   | `rounded-input`  |
| Badges   | 20px   | `rounded-badge`  |

---

## Botões

- **Primário:** Hero Orange, texto branco, Roboto 600, radius 12px, sombra leve
- **Secundário:** Branco, borda Deep Navy, texto Deep Navy, radius 12px
- **Terciário:** Texto Deep Navy, hover com underline

---

## Direção Visual

Priorizar: fotos reais, pessoas reais, animais reais, luz natural, expressões autênticas.
Evitar: excesso de ilustração infantil, cores gritantes, estética caricata.
