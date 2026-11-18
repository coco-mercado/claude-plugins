---
name: email-design
description: "Use ALWAYS when designing, reviewing or improving the LOOK of a Coco mini app's email templates — before create_email_template, and whenever an email looks plain, generic or unlike the wallet. State notifications (approved, in review, money ready, expiring) use Coco's pattern: brand lockup, hero, one-line title, short lead, a «Siguientes pasos» card, one green button, header: false. Receipts and codes use blocks. Covers Gmail dark mode and the spam check. Also when the user says \"make the email nicer\", \"improve the template design\", \"mejorá el diseño del correo\", \"que el mail se vea como la app\", \"el correo se ve feo\", \"revisá el template\", \"diseñá el correo\", or asks for a receipt/welcome/notification email to look professional."
---

# Designing mini app emails

The gateway owns the *shell*: the dark page, the hidden preheader, the footer that says who is writing and carries the unsubscribe link, and — unless you turn it off — a header row with the app's icon and name. This skill owns everything inside it: **what the email says, in what order, and the one thing the person is supposed to do.**

Mechanics of sending (tools, params, tokens, the server call) live in `/coco-mini-apps:email`. Load that one too if you're wiring the send.

## Pick the format first

| The email… | Build it with | Start from |
|---|---|---|
| tells the person that **a state changed** and what comes next — access approved, request in review, money ready to claim, changes requested, about to expire, closed. Welcomes too. | the **notification pattern**: `html` + `header: false` | `references/html-pattern.md` |
| **is** the data — a receipt, a code to type, a weekly number | **blocks** | `assets/patterns.json`, `references/blocks.md` |

Blocks are safe and quick, but the renderer decides their look: left-aligned, a 22 px heading, a pill button, no centered hero, no brand lockup, no steps card, and their text doesn't get the Gmail dark-mode protection the pattern has. A state notification built from blocks reads like a form letter. The pattern is the design the Creadores mini app ships, already checked against the gateway's sanitizer, Gmail dark mode and SpamAssassin: **copy it and change the copy, don't redesign it.**

A template has either `blocks` or `html` — when both are stored the gateway renders only `html`. To switch a template back from `html` to blocks, send `html: ""` along with the blocks.

## The notification pattern

Top to bottom, and nothing else:

1. **Brand lockup**, centered: the mini app's logo × the Coco Wallet logo.
2. **Hero**: one image that shows the state — approved, waiting, money, needs changes, closed. The state picks the image, not the copy.
3. **Title**: one sentence, with the person's name. *"{{nombre}}, tu video necesita unos cambios"*.
4. **Lead**: one or two short sentences that add what the title doesn't (the amount, the campaign, what was received).
5. **«Siguientes pasos» card**: 2–4 rows that mirror the state of this notification:
   - **done** — green check: what already happened (usually the event this email reports);
   - **next** — white number: exactly one, and it is what the button does;
   - **later** — grey number: what comes after.

   Numbers are positions and count the done rows: ✓, 2, 3 — not ✓, 1, 2.
6. **One green button**, full width, the only link in the email: `href="{{link}}"`.

Plus a **plain-text version you write** (`text`): same words, same order, the link spelled out. For `html` the gateway's derived one is crude.

**Cut on sight:** eyebrow labels, stat pills or big numbers, tips, a second button or inline links, a sign-off ("El equipo de…"), a footnote ("Recibes este correo porque…"). The gateway's footer already says who writes and how to unsubscribe; repeating it adds length and spam-filter surface, not trust.

### `header: false`

The gateway's header row (icon · name · Coco Wallet) would sit on top of the lockup, so the pattern turns it off. `header` is a boolean on `create_email_template`, `preview_email` and `send_email`, in the remote connector and in the local MCP:

- `false` drops the header row. The preheader and the footer (sender + unsubscribe) always stay.
- It is stored with the template: omitting it on a later update keeps it off; `header: true` brings the row back.
- With `key`, `preview_email` and `send_email` use the stored template's value; their own `header` only applies to inline drafts (no `key`).
- If the connector rejects `header`, its tool list is stale: reconnect it so the tools reload.

## The pass

Each step is cheap; skipping to "make it pretty" is what produces emails nobody reads.

### 1. Name the job and the state

One email, one job, in one sentence before touching markup: *"tell Ana her access was approved and get her to record her first video"*. If it needs an "and also", that's a second email. Then name the **state** (success, waiting, money, needs action, closed) — it decides the hero, which step is done and which is next.

### 2. Write the copy short

- Title: one sentence with `{{nombre}}`. Lead: one or two sentences. Step details: one line each.
- The lead adds; the steps don't repeat the lead.
- **Don't promise what the team can't keep.** No "te respondemos en 12 horas" unless something enforces it — Creadores dropped that line after missing it three times out of three. "Te avisamos por correo apenas tengamos respuesta" is true every time.
- Spanish, in the same register as the mini app's screens (tú or vos — never both in one email). Numbers as the person reads them (`$12,50`).
- The button label says what happens on the other side ("Cobrar mis {{monto}}", "Hacer los cambios"), never "Click aquí", and matches the **next** step.

### 3. Subject and preheader

The subject says what happened, with the identifier when there is one: *"Recibimos tu solicitud para {{marca}}"*. The preheader **adds** — the next step, the amount — and never repeats the subject. Both are what the person sees before opening.

### 4. Render it and look at it

```
preview_email { slug: "<app>", key: "<key>", params: { …realistic values… } }   // `name` instead of `slug` in the local MCP
```

Open the result. **An email can't be reviewed by reading its markup** — rhythm, weight and spacing only exist rendered. Use realistic params ("María Fernanda", "$1.234,56", a long campaign name), never "test" and "123"; real values are what break a layout. `missingParams` lists the placeholders you forgot.

### 5. Check it, then test it for real

Go through `references/checklist.md` with the preview open, then the deliverability steps in `references/deliverability.md`: plain-text version, ≤ 20 params, SpamAssassin score through Postmark's free check, and a real send to yourself that lands in the inbox — on a phone, in dark mode.

## Theme, concretely

The pattern uses the wallet's palette with Poppins:

| Role | Color | Where |
|---|---|---|
| Page | `#181818` | everything behind the content (the gateway paints it) |
| Card | `#252527`, radius 24 | the «Siguientes pasos» card — the only surface |
| Chip | `#2F3032` | the numbered circles |
| Line | `#333335` | 1 px rows between steps (a row with a background, never a border) |
| Green | `#00AF71` | **only** the button (radius 28) and the done checks |
| Title / step titles | `#FFFFFF` | |
| Lead | `#C1C1C1` | |
| Secondary | `#ABB0AE` | step details, the "×" in the lockup, grey numbers |

`#ABB0AE` replaces the kit's darker muted `#8A9E96` for small text: it stays legible on both `#181818` and `#252527`. Green is never text and never decoration — it marks the action and what's already done.

Blocks don't take colors: the renderer applies the gateway's own tokens. If a block-based email seems to need a new color, it needs a different block — or the pattern.

## Improving an email that already exists

1. `list_email_templates` → read the current `subject`, `preheader`, `blocks`/`html` and `header`.
2. `preview_email` with realistic params → look at what's actually shipping.
3. Name the job and the state. Most real problems are structural: three jobs in one email, the payload buried in prose, a state notification built from blocks, or extras (eyebrow, tips, sign-off) that the pattern cuts.
4. Rewrite, re-preview, and put both renders side by side before saving.
5. `create_email_template` with the same `key` — it updates in place, no redeploy.

Tell the user what changed and why in one or two lines ("moved it to the notification pattern: hero for the approved state, steps with the approval done and the first video next, one button"), not a list of every tweak.
