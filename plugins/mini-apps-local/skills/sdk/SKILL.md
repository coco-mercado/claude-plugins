---
name: sdk
description: How to build a Coco Wallet mini app — using the @cocowallet/miniapp-sdk bridge (wallet address, USDC payments on Polygon, signing, contacts, activity feed, push notifications, email) inside the mini app's Next.js project. Use whenever writing or editing a Coco mini app's code.
---

# Building a Coco Wallet mini app

This project runs inside the **Coco Wallet WebView**. It talks to the wallet through
`@cocowallet/miniapp-sdk` (already installed). The user's wallet is a **Particle smart
account on Polygon mainnet (chainId 137), ERC-4337, with gas paid by Coco's paymaster**
(transactions are gasless for the user).

## Ground rules

- Edit `src/app/page.tsx` (and add components/routes as needed). It's a normal Next.js 14
  App Router project with Tailwind preconfigured.
- Components that call the SDK must be client components — start the file with `"use client";`.
- The SDK only works inside the wallet WebView. Outside it, every method rejects with
  `NO_BRIDGE`. Guard dev-only UI if needed:
  ```ts
  const inWallet = typeof window !== 'undefined' && !!(window as any).flutter_inappwebview;
  ```
- The chain is **always Polygon (137)** — do not target Base or other chains.
- The SDK is vendored at `src/lib/miniapp-sdk.ts` and aliased to `@cocowallet/miniapp-sdk` in
  `tsconfig.json` — import it by the package name, never edit the vendored file (it's generated).

## SDK reference

```ts
import { MiniApp } from '@cocowallet/miniapp-sdk';
```

| Method | Returns | Notes |
|--------|---------|-------|
| `getAddress()` | `{ address, chainId }` | Smart account; `chainId === 137`. |
| `getUserInfo()` | `UserInfo` | Full profile. See below — most fields are `null` when the user hasn't filled them in, never as a sign of a failed call. |
| `sendTransaction({ to, data?, value? })` | `{ hash }` | Gas paid by Coco. `value` hex or decimal string; `"0x0"` for none. |
| `sendTransactionBatch(txs)` | `{ hash }` | Atomic ERC-4337 batch, one nonce (e.g. approve + call). |
| `signMessage(message)` | `{ signature }` | `personal_sign` with the smart account's owner EOA. To check it on the server, `verifyMessage` alone always fails: use `references/verify-signature.md`. |
| `signTypedData(data)` | `{ signature }` | EIP-712 (e.g. USDC permit). |
| `pickContact({ title?, onlyCocoUsers? })` | `PickedContact \| null` | Native contact sheet (saved, phone book, search by email/wallet/phone); only the picked contact is shared; `null` = user closed it. `{ name, phone (E.164 with "+"), walletAddress, email (only when the user searched by it), isCocoUser, source }`. Check `capabilities().includes('contacts.pick')`. |
| `getContacts()` | `WalletContact[]` | **Deprecated → `pickContact`.** `{ name, phone }` (digits, no "+"); still works on old mini apps. |
| `saveContact({ name, phoneCountryCode, phoneNumber })` | `{ success }` | Backend-backed. |
| `recordTransaction({ txHash, amount, tokenSymbol, direction?, chainId?, comment?, ... })` | `{ success }` | Adds the tx to the wallet activity feed. Best-effort. **`direction: 'in'` when the mini app pays the user** (prize, refund, yield); default `'out'` charges them. Without it an incoming tx renders as negative. **`chainId` when the tx is not on Polygon** (e.g. `8453`): default 137, and a Base hash recorded as Polygon links to an explorer page that does not exist. |
| `setTitle(title \| null)` | `void` | Host top-bar title; `null` resets. |
| `setCanGoBack(value)` | `void` | Show/hide the host back-arrow. |
| `sendWhatsAppNotification({ to, template, params, source? })` | `{ success, messageId? }` | Pre-approved template only; never free text. |
| `notifications.isSupported()` | `boolean` | **Sync.** `false` on wallets older than this feature — skip the rest. |
| `notifications.enable()` / `disable()` / `status()` | `{ enabled, pushPermission }` | Opt-in (native consent sheet) / opt-out / read state. |
| `notifications.schedule({ key, every? \| cron?, startAt?, params? })` | `NotificationSchedule` | Per-user recurring notification (`every: "15d"`). Idempotent per key + recurrence. |
| `notifications.list()` / `cancel(id)` | `NotificationSchedule[]` / `{ success }` | This user's schedules. |

### Picking a contact

To ask the user for ONE recipient (who to pay, invite, send an order to) use `pickContact`, don't build your own contact selector: the wallet shows its native sheet with search, and your app only receives the picked contact. Cancelling resolves `null` (not an error). Only one native sheet is open at a time — await the pick before calling `sendTransaction`, or you get `BUSY:`.

```ts
if (MiniApp.capabilities().includes('contacts.pick')) {
  const contact = await MiniApp.pickContact({ title: 'Elige a quién invitar' });
  if (contact) setRecipient(contact);   // null → user closed the sheet
}
```

### `getUserInfo()` — profile shape

```ts
interface UserInfo {
  name: string;                       // firstName + lastName
  avatar: string | null;
  phone: string | null;               // E.164 without "+"
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  dateOfBirth: string | null;         // "YYYY-MM-DD"
  gender: string | null;
  location: { country, city, state, street, postalCode } | null;
  phoneVerified: boolean;             // passed phone OTP
  phoneCountryCode: string | null;    // e.g. "+58"
  phoneCountryName: string | null;
  referralCode: string | null;
  identity: {
    verified: boolean;                // completed KYC with at least one provider
    providers: string[];              // e.g. ["bridge"]
    documentType: string | null;      // as entered in the profile — "V", "E", "P", ...
    documentNumber: string | null;    // as entered in the profile — cédula/RIF/passport
    verifiedName: string | null;      // confirmed by the KYC provider (Sumsub)
    verifiedDocumentType: string | null;
    verifiedDocumentNumber: string | null;
  };
}
```

`name`/`firstName`/`lastName` and `documentType`/`documentNumber` are **self-reported** —
the user can put anything there. To gate a feature on actual identity, check
`identity.verified === true` first; only then trust `identity.verifiedName` /
`identity.verifiedDocumentType` / `identity.verifiedDocumentNumber`, which come from the
KYC provider, not from what the user typed into their profile.

`documentNumber`/`verifiedDocumentNumber` are sensitive PII — the wallet shows the user
exactly what your mini app read, in its own "shared data" screen, so only ask for the
profile when your flow actually needs it. If the field you need is `null`, that means the
user doesn't have it loaded — never mistake it for a failed call (that surfaces as
`PROFILE_UNAVAILABLE:` instead).

## USDC payments (the common case)

Native USDC on Polygon: **`0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`**, **6 decimals**.
Encode a `transfer` with `viem` and send it as the tx `data`:

```ts
'use client';
import { MiniApp } from '@cocowallet/miniapp-sdk';
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem';

const USDC = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as const;

async function payUsdc(to: `0x${string}`, amount: string) {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to, parseUnits(amount, 6)], // 6 decimals
  });
  const { hash } = await MiniApp.sendTransaction({ to: USDC, data, value: '0x0' });
  // Show it in the wallet activity feed (optional, best-effort).
  // `direction` defaults to 'out' (the app charged the user). Pass 'in' when you
  // are paying the user, or the activity feed will show the amount as negative.
  MiniApp.recordTransaction({
    txHash: hash,
    amount: Number(amount),
    tokenSymbol: 'USDC',
    direction: 'out',
  }).catch(() => {});
  return hash;
}
```

### Approve + call atomically (batch)

```ts
await MiniApp.sendTransactionBatch([
  { to: USDC, data: approveData, value: '0x0' },
  { to: CONTRACT, data: callData, value: '0x0' },
]);
```

## Always handle states

Cover: loading the wallet, confirming, success (show `hash`, link to
`https://polygonscan.com/tx/<hash>`), and errors. Error messages are prefixed:
`USER_REJECTED:`, `INSUFFICIENT_GAS_FUNDS:`, `NO_SESSION:`, `INVALID_PARAMS:`, `TX_FAILED:`,
`TIMEOUT:`, `NO_BRIDGE:`. Branch on the prefix to give friendly copy (e.g. "Saldo insuficiente").

## Notifications (push + in-app, even when the mini app is closed)

The wallet can notify the user later — a push plus an entry in its notification center that
reopens this mini app on tap. Three pieces, and the SDK owns only the second and third:

1. **The copy** is defined by the mini app's owner with the MCP tool `create_notification`
   (one `key` per notification, `{{placeholders}}`, optional `path`, optional app-level `cron`,
   optional `webhookUrl`). Ask the assistant to run it; the SDK never sends free text.
2. **Opt-in**: `MiniApp.notifications.enable()` shows the wallet's native consent sheet. Call it
   right after an action of value (first deposit, first bet) — never on open. `USER_REJECTED:`
   is a real answer. Nothing is ever sent to a user who didn't enable.
3. **Trigger**: a per-user schedule from the SDK, the definition's `cron` (every subscriber), or
   your own server calling the gateway.

```ts
'use client';
import { MiniApp } from '@cocowallet/miniapp-sdk';

export async function ensureYieldReport() {
  if (!MiniApp.notifications.isSupported()) return;          // old wallet: skip silently
  try {
    await MiniApp.notifications.enable();
    await MiniApp.notifications.schedule({ key: 'yield_report', every: '15d' }); // idempotent
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('USER_REJECTED:')) return;
    console.warn('notifications', err);                        // best-effort, never block the flow
  }
}
```

Errors: `NOTIFICATIONS_UNSUPPORTED:` (old wallet — answered immediately, never a timeout),
`NOTIFICATIONS_DISABLED:` (`schedule()` before `enable()`), `NOTIFICATIONS_FAILED:` (gateway).

### Server-side: send when something happens

Your route handlers / crons can send a defined notification to specific users by their wallet
`address` (what `getAddress()` returns — the same on every chain). Only users who enabled
notifications receive it; the rest come back in `skipped` as `NOT_SUBSCRIBED`.
`COCO_GATEWAY_URL` and `COCO_GATEWAY_TOKEN` land in `.env.local` when a notification is created
and are injected into Vercel by `deploy_mini_app`. Never expose them as `NEXT_PUBLIC_*`.

```ts
// src/app/api/cron/check-wins/route.ts  (+ "crons" in vercel.json)
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('unauthorized', { status: 401 });
  }
  const winners = await findFreshWins();                     // your own logic
  const res = await fetch(`${process.env.COCO_GATEWAY_URL}/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.COCO_GATEWAY_TOKEN}` },
    body: JSON.stringify({
      slug: 'batea',
      key: 'bet_won',
      to: winners.map((w) => ({ address: w.address })),
      params: { match: 'Marlins vs. Nationals', amount: '12,50' },
      idempotencyKey: `bet_won:${betId}`,                    // the gateway dedupes on this
    }),
  });
  return Response.json(await res.json());
}
```

### Server-side: fresh params per user (webhook)

When the copy needs a value computed at send time (yield earned, streak, balance), the owner sets
a `webhookUrl` on the definition. Before each send the gateway POSTs
`{ slug, key, userId, address, scheduleId, fireAt, params }` and merges the `params` you return;
answer `{ skip: true }` to not send this time. Verify the signature — the secret arrived in
`.env.local` as `COCO_WEBHOOK_SECRET` (set it in Vercel too):

```ts
// src/app/api/notifications/yield/route.ts
import { createHmac, timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verify(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  if (!signature || !timestamp) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;   // ±5 min
  const expected = `sha256=${createHmac('sha256', process.env.COCO_WEBHOOK_SECRET!).update(`${timestamp}.${rawBody}`).digest('hex')}`;
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verify(raw, req.headers.get('x-coco-signature'), req.headers.get('x-coco-timestamp'))) {
    return new Response('bad signature', { status: 401 });
  }
  const { address } = JSON.parse(raw) as { address: string };
  const earned = await readEarnedOnChain(address);            // your own logic
  if (earned <= 0) return Response.json({ skip: true, reason: 'nothing earned' });
  return Response.json({ params: { earned: earned.toFixed(2) } });
}
```

## Email (receipts, codes, summaries — what the user keeps)

A push notification is for *now, inside the wallet*; email is for what the person keeps or
searches for later: a receipt, an order confirmation, a pickup code, a monthly summary.
Sending needs **no provider account and no API key** — the gateway sends through Coco's own
Resend account from `<slug>@mail.cocowallet.app`.

Ask the MCP for a template with `create_email_template`: a `key`, a `subject`, and the body
as **blocks** (`heading`, `text`, `button`, `stat`, `code`, `list`, `rows`, `note`,
`divider`, `image`), all accepting `{{placeholders}}`. The gateway renders them in the
wallet's theme with tables that Gmail and Outlook support, and writes the plain-text
alternative. Don't hand-write email HTML: mail clients have no flexbox, no grid, no external
CSS. Look at it with `preview_email` before sending — an email can't be judged from its
markup.

Send from a **route handler**, never from the browser:

```ts
// src/app/api/orders/[id]/ready/route.ts
import { coco } from '@cocowallet/miniapp-sdk/server';

export async function POST(req: Request) {
  const { email, nombre, orden } = await req.json();

  await coco.email.send({
    key: 'order_receipt',
    to: [{ email, params: { nombre, orden } }],
    idempotencyKey: `order_receipt:${orden}`,   // retries and double taps don't duplicate
  });

  return Response.json({ ok: true });
}
```

The user's address comes from `MiniApp.getUserInfo()` (`email` may be `null` — then ask for
it in your own form). `COCO_GATEWAY_URL`, `COCO_MINIAPP_SLUG` and `COCO_EMAIL_TOKEN` are
already in `.env.local` and get injected on deploy; the helper reads them itself and throws
if it is ever constructed in the browser.

Every email carries the mini app's name and an unsubscribe link. Someone who opts out comes
back in `skipped` as `UNSUBSCRIBED` and cannot be emailed again from this mini app — that is
what keeps the shared sending domain out of spam. `list_emails` is the debugging tool:
`sent` with a `providerId` means Resend took it (if the user doesn't see it, it's their spam
folder), `failed` carries the provider's reason.

Transactional only: something the user did. No bulk, no marketing.

## Database (server-side persistence)

When the app needs to persist data server-side (orders, RSVPs, counters), ask the MCP to
provision one with the `add_database` tool (idempotent). It creates a Postgres (Neon) with a
`dev` branch for local work — the connection string lands in this project's `.env.local` as
`DATABASE_URL` — and a production branch that `deploy_mini_app` wires up automatically on
deploy (its credential never touches this machine).

Then install the serverless driver and use it ONLY from route handlers, never from client
components (`DATABASE_URL` must not leak to the browser):

```bash
npm install @neondatabase/serverless
```

```ts
// src/app/api/orders/route.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`;
  return Response.json(orders);
}
```

Create tables with a plain `CREATE TABLE IF NOT EXISTS ...` on first use (or a small
`src/app/api/setup/route.ts` you hit once). Local dev uses the `dev` branch, so schema
experiments never touch production data.

## Deploy to production

`deploy_mini_app` (MCP tool) packs this project's source and deploys it server-side to a
stable production URL — no Vercel account or token needed on this machine. The catalog shows
the dev tunnel while it's alive and falls back to the production URL when the dev server
stops. Re-run it on each stable version (same URL).

## Don't

- Don't add a wallet-connect / web3 provider — the wallet IS the provider via the bridge.
- Don't hardcode private keys, RPC signing, or other chains.
- Don't send raw WhatsApp text — only `template` + `params`.
- Don't send email from the browser or expose `COCO_EMAIL_TOKEN` to the client.
- Don't read `DATABASE_URL` in client components or expose it as `NEXT_PUBLIC_*`.
- Don't call `MiniApp.notifications.enable()` on open — ask after an action of value, and respect `USER_REJECTED:`.
- Don't expose `COCO_GATEWAY_TOKEN` / `COCO_WEBHOOK_SECRET` to the client; they're server-only.
- Don't edit `src/lib/miniapp-sdk.ts` by hand — it's generated from the SDK package.
