# Block catalog

Every block is rendered by the gateway with the wallet's tokens. You choose *which*, not *how*. Ordered by how often they earn their place.

## `heading`
```json
{ "type": "heading", "text": "Tu pedido está listo" }
```
22px / 700 / white. One per email, at the top, saying what happened. A second `heading` means the email has two jobs — or that a `divider` + `text` would do.

## `text`
```json
{ "type": "text", "text": "Hola {{nombre}}, ya podés pasar a buscarlo por {{local}}." }
```
15px / 24px line-height / `#C1C1C1`. One or two sentences. Three paragraphs of `text` in a row is the signal that the payload belongs in a `stat`, `rows` or `list`.

## `stat`
```json
{ "type": "stat", "value": "$0,42", "label": "ganado esta semana" }
```
34px green number in a framed panel. For **the** number the email is about — the amount earned, the total, the balance. Two `stat`s compete; if you need two numbers, they're `rows`.

## `code`
```json
{ "type": "code", "value": "4821", "label": "código de retiro" }
```
Monospaced, 26px, letter-spaced, boxed. For something the person reads off the screen and types somewhere else. Keep it short — 4 to 8 characters read cleanly on a phone; a 40-character token wraps and becomes unusable. Long tokens belong in a `button` link, not in a `code`.

## `rows`
```json
{ "type": "rows", "rows": [
  { "label": "Pedido", "value": "#1234" },
  { "label": "Total",  "value": "$12,50" }
] }
```
Label left (muted), value right (bold white), hairline between rows. The receipt block. Up to about six rows; past that nobody reads them, and the ones that matter should be in the heading or a `stat`.

## `button`
```json
{ "type": "button", "text": "Ver el pedido", "url": "https://cafecito.app/pedidos/{{orden}}" }
```
Green pill, white text. **One per email.** The label says what happens on the other side ("Ver el pedido", "Cobrar"), never "Click aquí" — the label is read out of context by screen readers and skimmers alike. `http(s)` or `mailto` only; anything else is dropped at render time.

## `list`
```json
{ "type": "list", "items": ["Café filtrado 250g", "Molienda para prensa"] }
```
Green bullets. Steps, what's included, what changed. Keep items to one line each.

## `note`
```json
{ "type": "note", "text": "Si no fuiste vos, ignorá este correo." }
```
13px muted. Fine print, disclaimers, "this link expires in 15 minutes". Last, after the button. Not a place to hide something the person needs.

## `divider`
```json
{ "type": "divider" }
```
Hairline. Separates two sections of the *same* job. Two dividers in one email usually means two emails.

## `image`
```json
{ "type": "image", "url": "https://…/mapa.png", "alt": "Mapa del local", "width": 400 }
```
Full-width, rounded. **Images are off by default in most clients**, so an image may never be seen: never put text, a code or an amount inside one, and always write `alt`. Decorative headers cost load time and gain nothing — use one only when the image *is* the content (a map, a ticket QR, a product shot).

## The `html` escape hatch

`html` replaces the whole body with your own markup, still wrapped in the Coco shell and sanitized (no `<script>`, no `on*` handlers, no non-http URLs). Use it when the content genuinely doesn't fit the blocks — a two-column comparison, an embedded table from another system. Everything you gain in freedom you lose in client compatibility and theme consistency, so it is the last option, not the first.
