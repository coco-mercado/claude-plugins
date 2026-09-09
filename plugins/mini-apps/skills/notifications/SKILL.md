---
name: notifications
description: Use ALWAYS when a Coco mini app wants to reach the user later — remind them, report a result, celebrate a win, nudge a deposit — with a push notification and an entry in the wallet's notification center, even when the mini app is closed. Covers the three ways to trigger one (per-user schedule from the SDK, app-level cron, server-to-server send from your own backend), the opt-in rules, the copy with placeholders, the signed webhook for per-user values, and how to debug "it didn't arrive". Also when the user says "notify the user", "send a push", "remind them every 15 days", "tell them when they win", "add notifications to the mini app", "schedule a notification", "webhook de notificaciones", or in Spanish "avisale al usuario", "mandá un push", "recordatorio", "notificación cada X días", "que le avise cuando gane", "agregar notificaciones a la mini app", "agendar una notificación".
---

# Notifications in a Coco mini app

A mini app runs inside the wallet, so it can't run in the background and it can't send push on its own. The wallet can: a notification defined for your mini app arrives as a **push + an entry in the wallet's notification center**, and tapping it **reopens your mini app** on the path you choose.

Three pieces, and you own only the copy and the trigger:

1. **The definition** — copy, deep link path and optional cron/webhook. Created with the MCP tool `create_notification`. Free text from the client is never sent: every notification is a definition with a `key`.
2. **The opt-in** — `MiniApp.notifications.enable()` shows the **wallet's** native consent sheet. Nobody receives anything without accepting. The user can turn it off from the mini app's top-bar menu at any time.
3. **The trigger** — one of the three below.

## 1. Define the notification (MCP)

Ask the assistant to run `create_notification` for the mini app:

| Field | What it is |
|---|---|
| `key` | Stable id inside the mini app (`yield_report`, `bet_won`). The SDK and your server refer to it. |
| `title` / `body` | ≤ 80 / ≤ 240 chars, with `{{placeholders}}`. |
| `path` | Where the wallet opens the mini app on tap (`/mis-apuestas`). |
| `cron` | Optional. App-level schedule → **every** user who enabled notifications. Minimum once an hour in production. |
| `webhookUrl` | Optional. Your server is asked for per-user params right before each send (see below). |

Repeating the call with the same `key` updates the copy. `list_notifications`, `pause_notification`, `resume_notification` and `delete_notification` manage them; `list_notification_deliveries` is the debugging tool.

Copy is Spanish, voseo, short. Numbers as the user reads them (`$0,42`).

## 2. Ask for the opt-in — after value, never on open

```ts
if (MiniApp.notifications.isSupported()) {           // sync: false on older wallets
  try {
    await MiniApp.notifications.enable();             // native sheet the first time
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('USER_REJECTED:')) return; // they said no
  }
}
```

Call it right after the action the notification is about — the first deposit, the first bet — and inside the success path, never blocking it. `USER_REJECTED:` is a real answer: don't ask again this session. Already enabled ⇒ no sheet, it just returns `{ enabled: true, pushPermission }`. `pushPermission: 'denied'` means the OS blocks push; the aviso still shows in the wallet's notification center.

## 3. Trigger it

### Per-user schedule (SDK) — "every 15 days since their deposit"

```ts
await MiniApp.notifications.schedule({ key: 'yield_report', every: '15d' });
```

`every` is `"<n>m|h|d|w"`, or pass a `cron`. Idempotent for the same key + recurrence, so an "ensure" on every deposit is fine. `list()` / `cancel(id)` manage them (cancel on full withdrawal). Errors: `NOTIFICATIONS_DISABLED:` (no opt-in yet), `INVALID_PARAMS:`, `NOTIFICATIONS_FAILED:` (unknown key, limits).

### App-level cron — "every Monday to everyone"

Set `cron` on the definition. Nothing to do in code besides the opt-in.

### Server-to-server send — "when they win"

Your route handler or Vercel Cron detects the event and calls the gateway. Only users who enabled notifications receive it; the rest come back as `skipped: NOT_SUBSCRIBED`.

```ts
await fetch(`${process.env.COCO_GATEWAY_URL}/notifications/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.COCO_GATEWAY_TOKEN}` },
  body: JSON.stringify({
    slug: 'batea',
    key: 'bet_won',
    to: [{ address }],                                  // MiniApp.getAddress() — same on every chain
    params: { match: 'Marlins vs. Nationals', amount: '12,50' },
    idempotencyKey: `bet_won:${betId}`,                 // the gateway dedupes on this
  }),
});
```

`COCO_GATEWAY_URL` and `COCO_GATEWAY_TOKEN` land in `.env.local` when you create a notification and are injected into Vercel by `deploy_mini_app`. **Server-only** — never `NEXT_PUBLIC_*`. Try it first with the tool `send_notification` to your own address.

For a Vercel Cron: `vercel.json` with `"crons": [{ "path": "/api/cron/check-wins", "schedule": "*/10 * * * *" }]` (include `framework`, `buildCommand` and `installCommand` too — the gateway only writes its defaults when the file doesn't exist), and check `Authorization: Bearer ${CRON_SECRET}` in the handler.

## Per-user values computed at send time (webhook)

"How much did they earn" changes every day, so it can't live in `params`. Set `webhookUrl` on the definition: before each send the gateway POSTs `{ slug, key, userId, address, scheduleId, fireAt, params }` and merges the `params` you return. Answer `{ skip: true }` to not send this time (no deposit, nothing new).

The request is signed — verify it or anyone can make your server compute things:

```ts
// src/app/api/notifications/yield/route.ts
import { createHmac, timingSafeEqual } from 'node:crypto';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verify(raw: string, sig: string | null, ts: string | null): boolean {
  if (!sig || !ts || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const expected = `sha256=${createHmac('sha256', process.env.COCO_WEBHOOK_SECRET!).update(`${ts}.${raw}`).digest('hex')}`;
  return expected.length === sig.length && timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verify(raw, req.headers.get('x-coco-signature'), req.headers.get('x-coco-timestamp'))) {
    return new Response('bad signature', { status: 401 });
  }
  const { address } = JSON.parse(raw) as { address: string };
  const earned = await readEarned(address);             // your logic (on-chain, DB, …)
  if (earned <= 0) return Response.json({ skip: true });
  return Response.json({ params: { earned: earned.toFixed(2).replace('.', ',') } });
}
```

`COCO_WEBHOOK_SECRET` is shown once by `create_notification` and written to `.env.local`; set it in Vercel too. Timeout 5 s; `5xx` is retried, `4xx` is not.

## The two reference implementations

- **Cochinito** — definition `yield_report` with a webhook that reads the vault on-chain. On the first successful deposit: `enable()` → `schedule({ key: 'yield_report', every: '15d' })`. On full withdrawal: `cancel`. Copy: *"Tu Cochinito generó ${{earned}} USDC 🐷 — Ya tenés ${{balance}} USDC ahorrando al {{apy}}% anual. Sumá otro depósito y hacé crecer el rendimiento."*
- **Batea** — definition `bet_won`, `path: '/mis-apuestas'`. After the first bet: `enable()`. A Vercel Cron every 10 min asks the gateway for the subscribed addresses (`GET /notifications/subscribers?slug=batea`), checks the Azuro subgraph for `Won` bets, and `POST /notifications/send` with `idempotencyKey: bet_won:<betId>`. Copy: *"¡Ganaste! 🏆 — Tu apuesta en {{match}} pagó ${{amount}} USDT. Entrá a Batea para cobrar."*

## When it doesn't arrive

`list_notification_deliveries` (filter by `address`) answers it:

| Status / reason | Meaning |
|---|---|
| `sent`, `push: no_token` | Delivered to the wallet; the user has no push token (in-app center only). |
| `pending` | Queued; the gateway ticks every minute. |
| `suppressed / WEBHOOK_SKIP` | Your webhook answered `skip`. |
| `suppressed / RATE_LIMIT` | Daily cap (10 per user, 5 000 per mini app). |
| `suppressed / UNSUBSCRIBED` · `DEF_PAUSED` | User opted out · notification paused. |
| `failed / WEBHOOK_*` | Your webhook failed (bad signature check, timeout, bad JSON). |
| nobody in the list | The user never enabled notifications: `send` returned them in `skipped: NOT_SUBSCRIBED`. |

## Testing

Use the **dev** wallet: the develop gateway accepts `every: '1m'` and the tool `send_notification` reaches your own address once you enabled notifications in the mini app. In production the minimum interval is one hour. A short `every` never ships.

## Don't

- Don't call `enable()` on open, and don't loop on `USER_REJECTED:`.
- Don't build your own consent UI — the sheet is the wallet's on purpose.
- Don't put a changing value in `params`; use the webhook.
- Don't expose `COCO_GATEWAY_TOKEN` / `COCO_WEBHOOK_SECRET` to the client.
- Don't send without `idempotencyKey` from a cron — you'll double-notify on every run.
