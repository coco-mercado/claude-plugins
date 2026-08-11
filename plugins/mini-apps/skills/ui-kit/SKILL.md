---
name: ui-kit
description: Use ALWAYS before creating, adding or modifying any UI in a Coco mini app — screens, components, buttons, cards, lists, modals, forms, styles — and when configuring the project's Tailwind or CSS. Applies the Coco Wallet theme (color tokens, Poppins typography, spacing, radius, dark theme) so the mini app respects the wallet's look. Also when the user says "use the UI kit", "the app theme", "Coco style", "make it look like the wallet", or in Spanish "usa el UI kit", "el theme de la app", "estilo Coco", "que se vea como la wallet".
---

# Coco Wallet theme — Mini Apps

Mini apps run inside a WebView of the Coco wallet (a Flutter app, dark theme). This skill defines the **theme**: the tokens every UI must respect. It does not define layouts or components — each mini app's design is free and should have its own identity (don't imitate the wallet's screens), always within these tokens.

## Rules

1. **Dark theme only.** Page background `#181818`. Never light backgrounds or a light mode.
2. **Poppins always.** The product's only font, weights 400/500/600/700.
3. **Don't invent colors.** Use the tokens below; if one is missing, pick the closest semantic one — not a new hex.
4. **Green `#00AF71` = primary action and success.** Use it with intent, not as decoration.
5. **Touch targets ≥ 44px**; it's a touch mobile app inside a WebView.
6. **The layout is yours.** With these tokens, design a UI with its own identity for the mini app — don't replicate the wallet's home or screens.

## Setup (check this first)

The theme uses Tailwind's **default theme** extended **with Coco's colors only**. New scaffolds (`@cocowallet/miniapp-mcp` ≥ 0.3.3) already ship it; if `theme.extend.colors` doesn't exist in `tailwind.config.ts` (older scaffold), add it:

**IMPORTANT:** Next doesn't hot-reload `tailwind.config.ts` — after editing it, restart the dev server (`stop_mini_app` + `start_mini_app`); otherwise the token classes don't compile and the UI renders unstyled.

**`tailwind.config.ts`** (colors only; don't touch spacing, radius or the rest of the theme):

```ts
theme: {
  extend: {
    colors: {
      bg: '#181818',
      surface: '#2C2D2F',
      card: '#222222',
      'card-border': '#333333',
      divider: '#353434',
      green: { DEFAULT: '#00AF71', light: '#24D683', highlight: '#0A2E1F' },
      error: '#EE4F39',
      warning: '#E48B1E',
      info: '#89AEE5',
      txt: '#FFFFFF',
      'txt-secondary': '#C1C1C1',
      'txt-muted': '#8A9E96',
      'txt-subtle': '#9CA3AF',
      'txt-disabled': '#71717B',
      purple: '#A257FA',
    },
  },
},
```

**`layout.tsx`** — dark body with the tokens, and Poppins from Google Fonts:

```tsx
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
...
<body className="min-h-screen bg-bg text-txt antialiased font-[Poppins,system-ui,sans-serif]">
```

If the WebView ignores Tailwind's `font-weight`, force them in `globals.css` (`.font-bold { font-weight: 700 !important; }`, etc.).

## Color tokens

| Semantics | Class | Hex | Flutter origin |
|-----------|-------|-----|----------------|
| Page background | `bg-bg` | `#181818` | `surfaceDarkest` |
| Raised surface | `bg-surface` | `#2C2D2F` | `surfaceDark` |
| Card / container | `bg-card` + `border-card-border` | `#222222` / `#333333` | `cardBg` / `cardBorder` |
| Divider | `divider` | `#353434` | `cardDivider` |
| Primary / success | `green` | `#00AF71` | `buttonPrimaryBg`, `statusSuccess` |
| Light green (accents) | `green-light` | `#24D683` | `textConnected` |
| Highlighted success background | `green-highlight` | `#0A2E1F` | `highlightedSuccess` |
| Error | `error` | `#EE4F39` | `statusError` |
| Warning | `warning` | `#E48B1E` | `statusWarning` |
| Info | `info` | `#89AEE5` | `statusInfo` |
| Primary text | `txt` | `#FFFFFF` | `textPrimary` |
| Secondary text | `txt-secondary` | `#C1C1C1` | `textSecondary` |
| Muted text | `txt-muted` | `#8A9E96` | `textMuted` |
| Subtle text | `txt-subtle` | `#9CA3AF` | `cardSubtitleLight` |
| Disabled text | `txt-disabled` | `#71717B` | `infoCardText` |
| Focus accent | `purple` | `#A257FA` | `focusPurple` |

## Typography

Poppins (design base: 375px wide):

| Role | Size | Weight |
|------|------|--------|
| Screen title | 20–24px | 700 |
| Section title | 16px | 600 |
| Body | 14px | 400 |
| Caption / secondary | 12px | 400 |
| Hero figure | 32–36px | 700 |

## Spacing and radius

Use Tailwind's **default scale** (`p-4`, `gap-3`, `rounded-lg`, `rounded-xl`, `rounded-full`…). Wallet references: page horizontal padding 16px (`px-4`), cards at roughly `rounded-2xl` (16px), pill buttons (`rounded-full`).

## Checklist before shipping UI

- [ ] No hex outside the tokens (search for `#` in your diff and justify each one)
- [ ] Background `#181818`, no white flashes or light mode
- [ ] Poppins everywhere; weights with the forced `.font-*` classes
- [ ] Green only for primary action / success
- [ ] Touch targets ≥ 44px; secondary text `#C1C1C1` or lighter on dark background
- [ ] The design has its own identity — it's not a copy of the wallet's screens
