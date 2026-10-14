---
name: events
description: Use ALWAYS when a Coco mini app needs to register what happens inside it so marketing can segment and automate on it — events into RD Station. Covers choosing the 5-8 events that matter (the funnel, not every click), the naming the gateway enforces (`miniapp-<slug>-<event>`), declaring them with `create_event`, where to fire each one (client for intent, server for money), the props that reach the contact's RD fields, and how to debug "it doesn't show up in RD". Also when the user says "add events", "track this", "analytics for the mini app", "RD Station", "conversion", "funnel", "measure the mini app", or in Spanish "agregar eventos", "que aparezca en RD Station", "medir la mini app", "trackear", "embudo", "conversiones", "saber cuánta gente llega hasta acá".
---

# Events from a Coco mini app into RD Station

RD Station is where Coco's marketing team segments contacts and builds automations. A mini app can put its own facts in there — *this person created a savings plan*, *this person placed their first bet* — and from then on marketing can write to them, score them or enroll them in a workflow.

What you own is **which facts matter** and **where to fire them**. The gateway owns the name, the contact and the credential.

## The one thing to understand first

**RD Station has a single contact base for all of Coco.** No projects, no properties, no separate workspaces — the Cochinito event and the Batea event land in the same place as the ones from the WhatsApp bot and the store. That is why the gateway, not you, builds the name:

```
you declare:   plan_creado
marketing sees: miniapp-cochinito-plan_creado     + tags: miniapp, miniapp-cochinito
```

That prefix is what lets marketing segment *one app* (`conversión contiene miniapp-cochinito-`), *one event*, or *every mini app at once* (`contiene miniapp-`). It is also why the event key takes no dashes: the dash is the separator.

And the second thing: **conversion events in RD are never deleted.** A typo, a plural you regret, a test event named `prueba` — it stays in the account marketing uses, forever. Which is why every event has to be declared before it can be fired.

## 1. Choose the events — the funnel, not the clicks

Five to eight events per mini app. If you are writing the tenth, you are logging behaviour, not marketing facts; that belongs in your own analytics.

Fill in this shape:

| Step | Question it answers | Example (Cochinito) |
|---|---|---|
| Entry | Who came in at all? | `app_abierta` |
| Intent | Who tried? | `plan_iniciado` |
| Action | Who did the thing? | `plan_creado` |
| **Money** | Who committed value? | `deposito_confirmado` |
| Return | Who came back? | `deposito_repetido` |
| Exit | Who left, and from where? | `retiro_total` |

The money step is the one marketing actually asks for. The others exist so a drop-off has a shape — "800 opened, 120 started a plan, 31 deposited" is a conversation; "31 deposits" is a number.

Name them in Spanish, in the past tense, as facts: `plan_creado`, not `crear_plan` or `click_boton_plan`.

## 2. Declare them (MCP)

Ask the assistant to run `create_event`, one per event:

| Field | What it is |
|---|---|
| `event` | The key: `[a-z0-9_]`, no dashes, ≤ 40 (`plan_creado`). |
| `label` | Readable name for whoever builds the segmentation ("Plan de ahorro creado"). |
| `description` | **When exactly** it fires. The person writing the automation reads this, not your code. |
| `props` | Facts about the event: `[{ name: 'monto', type: 'number', field: 'cf_monetary' }]`. |

About `props`:

- They describe **the fact, never the person**. Amount, plan, match, token — yes. Email, phone, name, document — no: the gateway resolves the contact, you never send PII.
- Only a prop with `field: "cf_..."` reaches the contact's record in RD, and **that custom field must already exist in the account** (`contact_custom_fields_list` on the RD MCP shows them; `cf_monetary`, `cf_merchant`, `cf_order_id` and friends are already there). A prop without `field` stays in the gateway's log — useful for debugging, invisible to marketing.
- Firing a prop that was not declared is rejected. That is deliberate: the catalog has to keep describing the event, or nobody knows what can be asked of it.

The first `create_event` mints the mini app's two credentials and writes them to `.env.local`: `COCO_EVENT_TOKEN` (server) and `NEXT_PUBLIC_COCO_EVENT_TOKEN` (browser). They are shown once.

`list_events` shows what is declared, `pause_event` cuts a noisy one without touching code, `delete_event` removes the declaration (what already reached RD stays).

## 3. Fire them — client for intent, server for money

### From the WebView

```ts
import { MiniApp } from '@cocowallet/miniapp-sdk';

MiniApp.track('plan_iniciado');
MiniApp.track('plan_creado', { monto: 25, plan: 'semanal' });
```

No `await`, no promise, never throws. Outside the wallet, unconfigured or with the gateway down it simply does nothing — a marketing event must never break or slow a product flow. The user's address is resolved by the SDK.

**A browser event is not proof of anything.** It is forgeable, an adblocker eats it and a closed tab loses it. Use it for screens, intent and abandonment.

### From your server

```ts
// src/app/api/deposits/route.ts
import { coco } from '@cocowallet/miniapp-sdk/server';

const receipt = await confirmDeposit(body);            // the fact actually happened

await coco.events.track({
  event: 'deposito_confirmado',
  userId,                                              // or address
  props: { monto: receipt.amount },
  idempotencyKey: `deposito:${receipt.txHash}`,        // a retried webhook must not count twice
});
```

Anything that is money, on-chain or irreversible goes here, after it is confirmed — never on the optimistic click. Pass `idempotencyKey` whenever the trigger can repeat (a webhook retry, a cron, a double tap).

`coco.events.track` does not throw on a user without email: it returns `{ status: 'skipped', reason: 'no_contact' }`. Don't wrap it in logic that undoes the deposit.

## Who the event belongs to

You send `address` or `userId`; the gateway looks up the wallet user and takes the email from there. Your code never touches PII, and a mini app can't inject invented leads into the marketing base.

If that user has no email in the wallet — or the address is not a Coco user at all — the event is recorded as `skipped: no_contact` and nothing goes to RD. That is not a bug to work around: RD identifies contacts by email, so there is nobody to attribute it to.

## Verify it end to end

1. `send_test_event` with **your own** email — it creates a real contact in Coco's real RD account.
2. `list_event_deliveries` to see the status.
3. On the RD MCP: `get_contact_by_id_email` to get the uuid, then `get_contact_events(uuid, event_type: 'CONVERSION')`. The conversion should read `miniapp-<slug>-<event>`.
4. Then the real thing: run the mini app in the wallet, do the flow, and check the deliveries with `source: 'client'` / `'server'`.

## When it doesn't show up in RD

`list_event_deliveries` answers it:

| Status / reason | Meaning |
|---|---|
| `sent` | It reached RD; `rdEventUuid` is the receipt. If marketing doesn't see it, the segmentation is the problem, not the event. |
| `skipped / no_contact` | That user has no email in the wallet (or the address isn't a Coco user). |
| `skipped / no_rd_key` | The gateway has no `RDSTATION_API_KEY` — nothing is reaching RD from anywhere. |
| `skipped / paused` · `duplicate` | Event paused · same `idempotencyKey` already counted. |
| `skipped / contact_rate_limit` | That contact hit the daily cap for this mini app — usually a loop firing on every render. |
| `pending` | RD answered 429/5xx; it retries at 1, 5 and 15 minutes. |
| `failed / RD_4xx` | RD rejected the payload — the message carries its reason (a `cf_` field that doesn't exist in the account is the usual one). |
| nothing at all | The event never left: the key isn't declared (`400 UNKNOWN_EVENT`), or `NEXT_PUBLIC_COCO_EVENT_TOKEN` is missing from the build. |

## Don't

- Don't invent the full name — you declare `plan_creado`, the gateway owns `miniapp-<slug>-`.
- Don't send email, phone, name or document in `props`. The gateway resolves the contact.
- Don't fire on every render or every scroll: it burns the contact's daily cap and buys nothing.
- Don't trust a client event for anything that is money.
- Don't `await MiniApp.track(...)` — it returns nothing on purpose.
- Don't put `COCO_EVENT_TOKEN` (the secret one) in a `NEXT_PUBLIC_*` variable.
- Don't declare events "just in case": each one is a name marketing will live with forever.
