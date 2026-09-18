---
name: email
description: Use ALWAYS when a Coco mini app needs to send email — a receipt, an order confirmation, a welcome, a code, a summary, a recovery link, an invoice, anything that has to survive outside the wallet. Covers sending WITHOUT a provider account and WITHOUT any API key (the gateway sends through Coco's Resend account from <slug>@mail.cocowallet.app), the block-based templates that render in the wallet's theme, where the user's address comes from, the server-only send, the mandatory unsubscribe, and how to debug "it never arrived". Also when the user says "send an email", "email the receipt", "mandale un correo", "enviar mail", "correo de confirmación", "recibo por mail", "notificar por email", "agregar correo a la mini app", "Resend", "SMTP", "transactional email", or asks for a confirmation/receipt the user can keep.
---

# Email in a Coco mini app

A mini app can email its users **without creating an account anywhere and without holding an API key**. The gateway sends through Coco's Resend account, from a verified domain, and hands you back the provider's verdict. Same rule as icons, deploys and databases: paid credentials never touch the builder's machine.

**Email or notification?** A push notification is for *now, inside the wallet* ("you won", "your yield is ready") and dies in the notification center. Email is for what the person keeps or reads elsewhere: receipts, order confirmations, codes, monthly summaries, anything they may forward or search for months later. When in doubt: would they look for it in their inbox a week later? Then it's email. Many flows want both — see `/mini-apps:notifications`.

## 1. Define the email (MCP)

Ask the assistant to run `create_email_template`:

| Field | What it is |
|---|---|
| `key` | Stable id inside the mini app (`order_receipt`, `welcome`, `withdraw_code`). Your server sends by this name. |
| `subject` | ≤ 150 chars, with `{{placeholders}}`. Concrete beats clever: *"Tu pedido #{{orden}} está listo"*. |
| `preheader` | The line the inbox shows next to the subject. **Complement** the subject, never repeat it. |
| `blocks` | The body (below). |
| `fromName` | Display name only — the mailbox is always `<slug>@mail.cocowallet.app`. |
| `replyTo` | Where a reply goes, if you read replies. |

Repeating the call with the same `key` updates the copy — no redeploy, the template lives in the gateway.

### The body is blocks, not HTML

```
blocks: [
  { type: 'heading', text: 'Tu pedido está listo' },
  { type: 'text',    text: 'Hola {{nombre}}, ya podés pasar a buscarlo.' },
  { type: 'code',    value: '{{codigo}}', label: 'código de retiro' },
  { type: 'rows',    rows: [{ label: 'Total', value: '${{total}}' }, { label: 'Local', value: '{{local}}' }] },
  { type: 'button',  text: 'Ver el pedido', url: 'https://cafecito.app/pedidos/{{orden}}' },
  { type: 'note',    text: 'Si no fuiste vos, ignorá este correo.' },
]
```

Available: `heading`, `text`, `button`, `stat` (a big number), `code` (monospaced, for codes), `list`, `rows` (label/value, for receipts), `note`, `divider`, `image`.

The gateway renders them in the wallet's theme — `#181818`, Poppins, green `#00AF71` — as tables that Gmail and Outlook actually support, and writes the plain-text alternative for you. **Don't hand-write email HTML**: mail clients have no flexbox, no grid, no external CSS, and Gmail clips anything over ~102 KB. There is an `html` escape hatch (sanitized, wrapped in the same shell) for the rare layout blocks can't express.

For the copy and layout decisions themselves — hierarchy, one primary action, when a `stat` beats a paragraph — load `/mini-apps:email-design`.

## 2. Look at it before sending

```
preview_email { name: "Cafecito", key: "order_receipt", params: { nombre: "Ana", orden: "1234" } }
```

Renders it with the real layout, writes the HTML to a local file and tells you which `{{placeholders}}` had no value. **You cannot evaluate an email by reading its markup** — open the file. Do this on the first version and after every copy change.

## 3. Send it

### From the mini app's server — the only correct place

The gateway token is a credential: it goes in a route handler, never in the browser, never in a `NEXT_PUBLIC_*` var.

```ts
// src/app/api/orders/[id]/ready/route.ts
import { coco } from '@cocowallet/miniapp-sdk/server';

await coco.email.send({
  key: 'order_receipt',
  to: [{ email, params: { nombre, orden, total, codigo } }],
  idempotencyKey: `order_receipt:${orden}`,   // the gateway dedupes on this
});
```

`COCO_GATEWAY_URL`, `COCO_MINIAPP_SLUG` and `COCO_EMAIL_TOKEN` land in `.env.local` when you create a template, and `deploy_mini_app` injects them into Vercel — the helper reads them itself. **Email never accepts an anonymous request**: sending from a domain verified for all of Coco without a credential would be an open relay, so the gateway mints a send token for your mini app the first time you create a template and shows it once. Lost or leaked ⇒ `rotate_email_token` (and re-deploy, so the deployed app gets a fresh one too). It **throws if it is ever constructed in the browser**, because that token is Coco's, not the user's. The tool `send_email` does the same thing from the assistant — use it to send yourself the first one.

The three triggers all look like that call: your own API (above), a webhook from another system (same call inside the webhook handler, `idempotencyKey` derived from the event id — webhooks retry), and a cron (one call with up to 50 recipients, each with their own `params`).

### Where the address comes from

```ts
const { email } = await MiniApp.getUserInfo();   // the user's Coco account email — may be null
```

`null` means the user has no email on file, not that the call failed. Fall back to asking for it in your own form. Whatever the source, the address is the user's: send what they asked for, not what you'd like them to read.

## 4. The unsubscribe is not optional

Every email carries a footer with the mini app's name and a signed unsubscribe link (`List-Unsubscribe` + Gmail's one-click). Someone who unsubscribes comes back in `skipped` as `UNSUBSCRIBED` and **cannot** be emailed again from that mini app — the opt-out is per mini app, so the rest keep working normally. `list_email_unsubscribes` shows who; its `remove` argument exists for your own test address, not for bringing users back.

This is what keeps `mail.cocowallet.app` — shared by every mini app — out of spam folders. One app blasting unwanted mail degrades delivery for all of them.

## When it doesn't arrive

`list_emails` (filter by `to`) answers it:

| Status / reason | Meaning |
|---|---|
| `sent` with a `providerId` | Resend accepted it. If the user doesn't see it, it's their spam folder or a typo in the address — not a send failure. |
| `skipped / UNSUBSCRIBED` | They opted out of this mini app. Nothing to fix. |
| `skipped / DUPLICATE` | Same `idempotencyKey` as an earlier send. Usually your retry working as intended. |
| `skipped / RATE_LIMIT` | Daily cap: 20 per recipient, 2000 per mini app. |
| `failed` with `VALIDATION_ERROR` | Resend rejected it — most often the domain isn't verified in that environment, or the address is malformed. |
| `mode: "noop"` in the response | The gateway has no `RESEND_API_KEY` (a fresh local/dev setup). Nothing was sent; ask for the key to be configured. |

## Copy

Spanish, voseo, short. Numbers as the user reads them (`$0,42`). Say the one thing that happened in the subject, and put the action in a single button — an email with four equal buttons has no action at all.

## Don't

- Don't send from the browser, and don't expose `COCO_GATEWAY_TOKEN` to the client.
- Don't send bulk or marketing mail from a mini app: this is transactional email for something the user did.
- Don't loop over recipients with one call each — pass up to 50 in `to`, each with their own `params`.
- Don't send from a cron without `idempotencyKey`; every run will email everyone again.
- Don't put a code, a token or a password in the subject — it shows up on the lock screen.
- Don't re-subscribe someone who unsubscribed.
