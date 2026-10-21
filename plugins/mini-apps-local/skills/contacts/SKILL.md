---
name: contacts
description: Use ALWAYS when a Coco mini app needs the user to choose a person — who to pay, invite, gift, split with or send an order to — or asks for the user's contacts or phone book. Covers `MiniApp.pickContact()` (the wallet's native contact picker sheet), the `PickedContact` shape, cancellation, the BUSY rule when chaining "pick → pay", the capability check for older wallets, and why `getContacts()` is deprecated. Also when the user says "pick a contact", "choose a recipient", "contact list", "access the phone book", "select who to send to", or in Spanish "elegir un contacto", "seleccionar destinatario", "lista de contactos", "acceder a la agenda", "a quién le envío", "que elija un contacto".
---

# Picking a contact in a Coco mini app

Don't build a contact list. Call `MiniApp.pickContact()`: the wallet opens its **native sheet**, the same one it uses to send money. It has search by name, phone, email or wallet address, the saved contacts, and the phone book checked against Coco. The user taps one person, and **your mini app receives only that contact**. It never sees the rest of the list.

```ts
import { MiniApp } from '@cocowallet/miniapp-sdk';

const contact = await MiniApp.pickContact({ title: 'Elige a quién invitar' });
if (!contact) return;          // user closed the sheet — not an error
setRecipient(contact);
```

## Options

| Option | Default | What it does |
|---|---|---|
| `title` | `"Selecciona un destinatario"` (same as the wallet's send flow) | Sheet title, ≤ 60 chars. Say what the pick is for. |
| `onlyCocoUsers` | `false` | `true` hides the phone-book section and lists only Coco users. Use it when you will pay or tag a wallet. |

## What you get back

```ts
interface PickedContact {
  name: string;                 // display name
  phone: string | null;         // E.164 WITH "+", e.g. "+584141234567"
  walletAddress: string | null; // Coco smart account when known
  email: string | null;         // only if the user searched by that email
  isCocoUser: boolean;          // false → a phone-book contact outside Coco
  source: 'saved' | 'phonebook' | 'search';
}
```

- **To pay the contact**, you need `walletAddress`. Use `onlyCocoUsers: true`, or handle `walletAddress === null`. For example, offer to invite them by WhatsApp using `phone`.
- **Don't expect an email.** It is `null` unless the user typed it in the search.

## Rules

1. **Cancelling resolves `null`.** Closing the sheet with the ×, a drag down, a tap outside or the back button resolves `null`. It doesn't throw, so don't show an error.
2. **One native sheet at a time.** While the picker is open, a second `pickContact`, `sendTransaction` or signature call rejects with `BUSY:`. To chain *pick → pay*, **await the pick first**, then call the payment (see `/coco-mini-apps:payments`).
3. **Older wallets.** Before this method existed, the call rejected with `PICK_CONTACT_UNSUPPORTED:`. Check the capability first and fall back to your own phone or wallet input:
   ```ts
   if (MiniApp.capabilities().includes('contacts.pick')) {
     const c = await MiniApp.pickContact();
   } else {
     showManualRecipientInput();
   }
   ```
4. **Other errors.** `NO_SESSION:` means there is no user session. `INVALID_PARAMS:` means `title` isn't a string or is too long, or `onlyCocoUsers` isn't a boolean.
5. **It's fine to call it on load.** The wallet always shows the sheet, and the user always makes the choice.

## `getContacts()` is deprecated

`getContacts()` returned the user's whole address book to the mini app, with `phone` as digits only and no `+`. It still works for existing mini apps, but **new code uses `pickContact()`**. It's more private: the user shares one person, not their whole agenda. It's also the same picker the user already knows from the wallet.

Needs `@cocowallet/miniapp-sdk` ≥ 0.14.0. For vendored copies, run `npm run sync-sdk`.
