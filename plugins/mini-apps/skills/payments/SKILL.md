---
name: payments
description: Use ALWAYS when a Coco mini app charges, pays or moves money — sendTransaction, batches, covering the user's short balance with their other coins (requiredFunds), charging in bolívares via Pago Móvil, recording the operation in the wallet, and handling the errors. Also when the user says "let it charge", "payments fail with insufficient funds", "accept other coins", "charge in bolívares", "add payments to the mini app", or in Spanish "que pueda cobrar", "los pagos fallan por saldo insuficiente", "que acepte otras monedas", "cobrar en bolívares", "agregar pagos a la mini app".
---

# Payments in a Coco mini app

The mini app runs inside the wallet, so the user **already has an account and a balance**: no onboarding, no seed phrases, no asking them for gas. Coco's paymaster covers the gas.

Everything goes through `@cocowallet/miniapp-sdk`.

## Charging

```ts
const { hash } = await MiniApp.sendTransaction({
  to: USDC,
  data: encodeTransfer(merchant, amount),
  chainId: CHAIN_IDS.BASE,
});
```

For several transactions that must land together or not at all → `sendTransactionBatch(txs, { chainId })`. It's a single UserOp: one signature, and either all of them land or none does.

`chainId` accepts Polygon (137, the default) and Base (8453). It goes **on the batch**, not on each transaction.

## The user has no balance in your token

This is the most common case and the one that kills the most sales: the user has money, just in another coin or another chain. Of the 16 tokens the wallet shows them, 14 live outside Polygon.

Declare what the payment needs and the wallet covers the gap by converting from the user's other coins, in a single confirmation and without them leaving your mini app:

```ts
await MiniApp.sendTransaction({
  to: USDC,
  data: encodeTransfer(merchant, amount),
  chainId: CHAIN_IDS.BASE,
  requiredFunds: { token: 'USDC', amount: '0.05' },
});
```

- `token` — the symbol as the wallet shows it (`'USDC'`, `'USDT'`).
- `amount` — human units, as a **string**. It's what the user needs to **hold**, not the sum of your transactions: if you charge 0.05 and also run an `approve`, it's 0.05.
- In a batch it goes in the batch options.

Declaring it is the opt-in and removing it is the off switch. The wallet **never guesses** the amount from your calldata.

### ⚠️ Don't pre-check the balance and bail out

This is the mistake that keeps the feature from ever kicking in. If your mini app reads the balance and throws **before** calling `sendTransaction`, the wallet never sees the payment and can't offer anything.

There is usually more than one bail-out, in different files — a preflight in the payment logic and a disabled button on the amount screen. Both need to go.

Keep the visual warning ("you're short X") if you want, but it **must not block**. Let the transaction through and handle whatever error the wallet returns.

## Errors to handle

| Code | What it means | What to show |
|---|---|---|
| `INSUFFICIENT_FUNDS` | Not enough even after converting | Offer to top up |
| `FUNDING_FAILED` | The conversion failed. **Nothing was charged** | Retry |
| `FUNDING_PENDING` | The conversion is on its way to the user's wallet. The money **is safe**, the payment didn't complete | Ask them to retry shortly |
| `USER_REJECTED` | They cancelled the confirmation | Go back quietly |
| `TX_FAILED` | The transaction failed on-chain | Retry |

They arrive as an `Error` whose message is `CODE: text`.

## Knowing what the hosting wallet supports

Your mini app ships on its own, so it can run on a wallet older than the field you want to use. `capabilities()` is **synchronous** on purpose:

```ts
if (MiniApp.capabilities().includes('funding.autoSwap')) {
  // show "pay with your other coins"
}
```

Gate any UI of your own with this and you can ship before the new wallet is out: on older ones you keep your current behaviour, and it turns on by itself when the wallet arrives.

## Charging in bolívares (Venezuela)

```ts
const r = await MiniApp.requestPagoMovilPayout({
  amountUsd: 12.5,
  beneficiary: { phone, documentId, bankCode, bankName },
  reference: 'order-123',
});
```

Charges in USD from the user's balance and delivers bolívares over Pago Móvil to the merchant's account, with a native wallet confirmation and funds protected by escrow. With `batchTransactions` (max 3) you attach calls to your own contract to the charge, in an atomic batch with a single signature.

Guide: https://cocowallet.mintlify.app/mini-apps/guias/paga-en-bolivares

## Leaving a trace in the wallet

```ts
await MiniApp.recordTransaction({
  txHash: hash,
  amount: 0.05,
  tokenSymbol: 'USDC',
  comment: 'Order #123',
});
```

Without this, the user sees the movement in their activity with no clue what they bought.

## Testing

You need the **dev** wallet and an account with an insufficient balance in the token you charge, plus enough balance in another coin on **Polygon, Base, Arbitrum or Optimism**. Ethereum and BNB are excluded as sources: their gas makes funding small amounts cost more than the amount itself.

If the source is on another chain the operation takes ~30 s with a progress indicator, but **without asking for a second confirmation**.
