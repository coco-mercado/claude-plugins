---
name: email-design
description: "Use ALWAYS when designing, reviewing or improving the LOOK of a Coco mini app's email templates — before creating one with create_email_template, and whenever an email \"looks off\", plain, cramped, generic or unlike the wallet. Turns a wall of paragraphs into a structured email in Coco's theme (dark #181818, Poppins, green #00AF71), picks the right blocks, fixes hierarchy and copy, and verifies it against the checklist and a real preview. Also when the user says \"make the email nicer\", \"improve the template design\", \"align the email to the theme\", \"mejorá el diseño del correo\", \"que el mail se vea como la app\", \"el correo se ve feo\", \"revisá el template\", \"diseñá el correo\", or asks for a receipt/welcome/code email to look professional."
---

# Designing mini app emails

The gateway already guarantees the *shell*: dark background, Poppins, the green, the header with the app's icon, the footer with the unsubscribe link, tables that survive Gmail and Outlook. What it cannot guarantee is the part that decides whether an email works — **what goes in it, in what order, and what the person is supposed to do**. That's this skill.

Mechanics of sending (tools, params, the server call) live in `/mini-apps:email`. Load that one too if you're wiring the send.

## The pass

Work in this order. Each step is cheap; skipping to "make it pretty" is what produces emails nobody reads.

### 1. Name the job

One email, one job. Write it in a sentence before touching blocks: *"tell Ana her order is ready and give her the pickup code"*. If the sentence needs an "and also", that's a second email — or a section that can be cut. A receipt that also announces a promo converts on neither.

Then decide the single action. Every email gets **at most one** `button`; secondary paths go as links inside `text`. Four equal buttons is the same as none.

### 2. Choose blocks by what the content *is*

The block catalog and what each one is for: `references/blocks.md`. The short version:

| The content is… | Block | Not |
|---|---|---|
| The one number that matters (amount earned, total) | `stat` | a paragraph with a bold number |
| A code the person must read and type | `code` | `text` with backticks |
| Order/receipt facts | `rows` | a paragraph listing them |
| Steps or what's included | `list` | comma-separated prose |
| Legal, disclaimers, "if this wasn't you" | `note` | same-size `text` |

A paragraph that only wraps a number is the most common miss: it buries the thing the person opened the email for.

### 3. Structure it

```
heading    what happened, in the person's words
text       one or two lines of context. Not three.
stat/code/rows   the payload
button     the single action
note       the fine print
```

Openings the reader already knows ("Te escribimos para informarte que…") are deletable — the heading said it. Cut every sentence that restates the heading.

### 4. Subject and preheader

The subject says what happened, with the identifier: *"Tu pedido #1234 está listo"*. The preheader **adds** — the code, the total, the deadline — it never repeats the subject. Both are what the person sees before opening, and most emails are judged there.

Spanish, voseo, short. Numbers as the user reads them (`$0,42`, not `0.42`).

### 5. Render it and look at it

```
preview_email { name: "<app>", key: "<key>", params: { …realistic values… } }
```

Open the file. **An email cannot be reviewed by reading its markup** — you're checking rhythm, weight and spacing, which only exist rendered. Use realistic params: "Ana" and "$1.234,56", never "test" and "123", because real values are what break a layout.

### 6. Check it against the list

Run through `references/checklist.md` before saving the template. It catches the failures that only show up in somebody's inbox: images off by default, a 42-character code wrapping, a button that means nothing out of context.

## Starting points

`assets/patterns.json` has four block sets that already follow all of the above — **receipt**, **code**, **welcome** and **summary**. Adapt the closest one instead of starting from an empty array; they exist so a new email starts at "good" rather than at "a wall of `text` blocks".

## Theme, concretely

The tokens are the wallet's (same ones `/mini-apps:ui-kit` gives the mini app's screens), applied by the renderer:

| Role | Token | Where it shows |
|---|---|---|
| Background / card | `#181818` / `#222222` | the shell |
| Primary text | `#FFFFFF` | headings |
| Body text | `#C1C1C1` | paragraphs |
| Muted | `#8A9E96` | notes, footer, `rows` labels |
| Green | `#00AF71` | the button, `stat` frame, bullets |

**Don't reach for the `html` escape hatch to add colors.** The green is the action and success color; using it as decoration is what makes an email look like a template. If a design seems to need a token that isn't here, it needs a different block, not a new hex.

## Improving an email that already exists

1. `list_email_templates` → read the current `subject`, `preheader` and `blocks`.
2. `preview_email` with realistic params → look at what's actually shipping.
3. Name the job (step 1). Most real problems are structural: three jobs in one email, or the payload buried in prose.
4. Rewrite the blocks, re-preview, and put the two renders side by side before saving.
5. `create_email_template` with the same `key` — it updates in place, no redeploy.

Tell the user what changed and why in one or two lines ("el monto pasó a `stat` y saqué el segundo botón"), not a list of every tweak.
