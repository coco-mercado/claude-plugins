# Quality pass for Coco mini app UI

Run this after the screen works and before you call it done. It never changes the theme: every fix uses the tokens in `SKILL.md`.

## States (each screen and control)

- **Loading:** skeletons with the final layout in `bg-card`, not spinners on a blank page. Show determinate progress when you know it.
- **Empty:** one sentence saying what goes here plus the action that fills it.
- **Error:** say what happened and how to fix it, in `text-error`, next to where it happened. Errors don't apologize and always offer a way out (retry, edit, go back).
- **Disabled:** `txt-disabled`, plus the reason when it isn't obvious.
- **Pressed / active:** visible feedback in under 150 ms (opacity or scale), so a tap never feels ignored inside the WebView.
- **Success:** confirmation with the same verb as the button ("Pagar" → "Pagado").

## Accessibility

- Contrast: body text ≥ 4.5:1, large text and controls ≥ 3:1. On `#181818`, `txt-secondary` and lighter are safe; `txt-disabled` is only for disabled.
- Never use color alone for meaning: pair green/red with a sign, an icon or a word (crucial for gains and losses).
- Icon-only buttons need `aria-label`. Every input has a `<label>`.
- Use native `<button>` and `<a>`. No `div` with `onClick`.
- Touch targets ≥ 44px, even when the icon is smaller (pad the hit area).
- Respect `prefers-reduced-motion`.
- Set `<html lang="es">`.

## Motion

- Motion explains something (an item enters, a sheet opens, a value changes). It's never decoration.
- 100–150 ms for feedback, 200–300 ms for small transitions, ≤ 400 ms for sheets and pages.
- Ease-out when entering, ease-in when leaving.
- Animate only `transform` and `opacity`; never `width`, `height`, `top` or `left`.
- Never block input while something animates.

## Layout and mobile

- Design at 375 px and check 320 px: nothing clipped, nothing scrolling sideways.
- `px-4` page padding. Primary action reachable by the thumb (bottom of the screen) when the flow allows.
- Respect the safe area at the bottom (`pb-[env(safe-area-inset-bottom)]`) for fixed bars.
- Long values (addresses, amounts) truncate with a way to see them in full.
- Numbers use `tabular-nums` so they don't jump while updating.

## Copy

- Spanish, sentence case, plain verbs. The button says exactly what happens ("Pagar 5 USDC", not "Continuar").
- Name things the way the user knows them: "saldo", "enviar". Never contracts, gas or RPC.
- A destructive action asks for confirmation or allows undo, and looks different from the primary one.

## Review

Before shipping, review the screen as a critic: rank the problems by user impact, fix the high ones, and prefer the cheapest fix (delete, use the native element, reuse a token) before adding anything new.
