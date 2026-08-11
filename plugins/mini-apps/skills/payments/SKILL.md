---
name: payments
description: Usar SIEMPRE que una mini app de Coco cobre, pague o mueva dinero — sendTransaction, batches, cubrir el saldo corto del usuario con sus otras monedas (requiredFunds), cobrar en bolívares por Pago Móvil, registrar la operación en la wallet y manejar los errores. También cuando el usuario diga "que pueda cobrar", "los pagos fallan por saldo insuficiente", "que acepte otras monedas", "cobrar en bolívares", "agregar pagos a la mini app".
---

# Pagos en una mini app de Coco

La mini app corre dentro de la wallet, así que el usuario **ya tiene cuenta y saldo**: no hay onboarding, ni seed phrases, ni pedirle gas. El gas lo cubre el paymaster de Coco.

Todo pasa por `@cocowallet/miniapp-sdk`.

## Cobrar

```ts
const { hash } = await MiniApp.sendTransaction({
  to: USDC,
  data: encodeTransfer(comercio, monto),
  chainId: CHAIN_IDS.BASE,
});
```

Varias transacciones que deben pasar juntas o no pasar → `sendTransactionBatch(txs, { chainId })`. Es un único UserOp: una firma, y o entran todas o ninguna.

`chainId` acepta Polygon (137, default) y Base (8453). Va **a nivel del batch**, no por transacción.

## El usuario no tiene saldo en tu token

Es el caso más común y el que más ventas rompe: el usuario tiene plata, pero en otra moneda o en otra red. De los 16 tokens que la wallet le muestra, 14 viven fuera de Polygon.

Declará lo que el pago necesita y la wallet cubre el faltante convirtiendo desde las otras monedas del usuario, en una sola confirmación y sin que salga de tu mini app:

```ts
await MiniApp.sendTransaction({
  to: USDC,
  data: encodeTransfer(comercio, monto),
  chainId: CHAIN_IDS.BASE,
  requiredFunds: { token: 'USDC', amount: '0.05' },
});
```

- `token` — el símbolo como lo muestra la wallet (`'USDC'`, `'USDT'`).
- `amount` — unidades humanas, **string**. Es lo que el usuario necesita **tener**, no la suma de tus transacciones: si cobrás 0.05 y además hacés un `approve`, son 0.05.
- En un batch va en las opciones del batch.

Declararlo es el opt-in y quitarlo lo apaga. La wallet **nunca adivina** el monto desde tu calldata.

### ⚠️ No valides el saldo por tu cuenta para abortar

Este es el error que hace que la funcionalidad no se active nunca. Si tu mini app lee el balance y lanza un error **antes** de llamar a `sendTransaction`, la wallet no ve el pago y no puede ofrecer nada.

Suele haber más de un corte y en archivos distintos — un preflight en la lógica de pago y un botón deshabilitado en la pantalla de monto. Hay que revisar los dos.

Podés mantener el aviso visual ("te faltan X"), pero **no debe bloquear**. Dejá pasar la transacción y manejá el error que devuelva la wallet.

## Errores que hay que manejar

| Código | Qué significa | Qué mostrar |
|---|---|---|
| `INSUFFICIENT_FUNDS` | No alcanza ni convirtiendo | Ofrecer recargar |
| `FUNDING_FAILED` | No se pudo convertir. **No se cobró nada** | Reintentar |
| `FUNDING_PENDING` | La conversión va en camino a la wallet del usuario. La plata **está a salvo**, el pago no se completó | Pedirle que reintente en un momento |
| `USER_REJECTED` | Canceló la confirmación | Volver sin ruido |
| `TX_FAILED` | La transacción falló en la cadena | Reintentar |

Llegan como `Error` con el mensaje en formato `CODIGO: texto`.

## Saber qué soporta la wallet que te hospeda

Tu mini app se despliega sola, así que puede correr en una wallet anterior al campo que querés usar. `capabilities()` es **síncrono** a propósito:

```ts
if (MiniApp.capabilities().includes('funding.autoSwap')) {
  // mostrar "pagá con tus otras monedas"
}
```

Gateá con esto cualquier UI propia y podés publicar antes de que salga la wallet nueva: en las viejas mantenés tu comportamiento actual y se activa solo cuando llegue.

## Cobrar en bolívares (Venezuela)

```ts
const r = await MiniApp.requestPagoMovilPayout({
  amountUsd: 12.5,
  beneficiary: { phone, documentId, bankCode, bankName },
  reference: 'pedido-123',
});
```

Cobra en USD desde el saldo del usuario y entrega bolívares por Pago Móvil a la cuenta del comercio, con confirmación nativa de la wallet y fondos protegidos por escrow. Con `batchTransactions` (máx 3) acoplás llamadas a tu propio contrato al cobro, en un batch atómico de una sola firma.

Guía: https://cocowallet.mintlify.app/mini-apps/guias/paga-en-bolivares

## Dejar rastro en la wallet

```ts
await MiniApp.recordTransaction({
  txHash: hash,
  amount: 0.05,
  tokenSymbol: 'USDC',
  comment: 'Pedido #123',
});
```

Sin esto, el usuario ve el movimiento en su actividad sin contexto de qué compró.

## Probar

Necesitás la wallet **dev** y una cuenta con saldo insuficiente en el token que cobrás, y saldo suficiente en otra moneda en **Polygon, Base, Arbitrum u Optimism**. Ethereum y BNB están excluidos como origen: su gas hace que fondear montos chicos cueste más que el monto.

Si el origen está en otra red, la operación tarda ~30 s con un indicador de progreso, pero **sin pedir una segunda confirmación**.
