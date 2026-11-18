# Before the first real send

A well-designed email in the spam folder has no design. Every mini app sends from `mail.cocowallet.app`, so one app's spammy template costs every other app too. Do this once per template, and again after any change to its structure.

## 1. The template itself

- **One link: `{{link}}`.** The button is the only `href` in your body. The gateway adds the unsubscribe link to the footer; nothing else. Extra links (social icons, "ver en el navegador", a second CTA) are spam-filter surface and split the click.
- **A plain-text version you wrote** (`text`), with the same words in the same order and the link spelled out. Blocks derive a good one; for `html` the derived one is crude.
- **≤ 20 params per recipient**, keys `[A-Za-z0-9_]`, values ≤ 200 characters. One more key fails the whole send with a validation error, so pass only the params the template uses — not the whole user object.
- **Images hosted over https**, with `width`, `height` and `alt`. No text, code or amount inside an image.
- **No promise you can't keep** in the subject, preheader or body: deadlines, response times, amounts that may change.

## 2. Score it with SpamAssassin

Postmark's spam check is free and needs no account: it takes a raw MIME message and returns the SpamAssassin score and the rules that fired. Build the message from what `preview_email` returns (`subject`, `html`, `text`, `from`), with realistic params, saved as `preview.html` and `preview.txt`:

```js
// spamcheck.mjs — node spamcheck.mjs preview.html preview.txt "Asunto" "App <slug@mail.cocowallet.app>"
import { readFileSync } from 'node:fs';
const [html, text, subject, from] = process.argv.slice(2);
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n');
const raw = [
  `From: ${from}`, 'To: test@example.com',
  `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
  `Date: ${new Date().toUTCString()}`, `Message-ID: <${Date.now()}@mail.cocowallet.app>`,
  'MIME-Version: 1.0', 'Content-Type: multipart/alternative; boundary="coco"', '',
  '--coco', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(readFileSync(text, 'utf8')),
  '--coco', 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(readFileSync(html, 'utf8')),
  '--coco--', '',
].join('\r\n');
const res = await fetch('https://spamcheck.postmarkapp.com/filter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: raw, options: 'long' }),
});
// The response has raw control characters inside its strings: strip them before parsing.
const out = JSON.parse((await res.text()).replace(/[\u0000-\u001f]+/g, ' '));
console.log('score', out.score);
for (const r of out.rules ?? []) if (Number(r.score) !== 0) console.log(r.score, r.description);
```

**Read the score against the baseline, not against zero.** Any email in the Coco shell scores about **1.1**, from one rule: `FONT_INVIS_MSGID` ("Invisible text + suspicious message ID"), caused by the hidden preheader the gateway adds. The notification pattern scores exactly that. Anything above the baseline is yours to fix — read the rules that fired (a subject in capitals, a link whose text is a different URL, lots of image and little text, no plain-text part) and fix the template until only the baseline is left.

## 3. Send a real one to yourself

```
send_email { slug: "<app>", key: "<key>", to: [{ email: "<your address>", params: { …realistic values… } }] }
```

(`name` instead of `slug` in the local MCP.) Then, in the inbox:

- It landed in **Inbox**, not Spam. A Gmail tab (Updates, Promotions) isn't spam; the spam folder is a stop.
- **On a phone**, in the Gmail app: nothing wraps badly, the button is full width, the title fits in two or three lines.
- **In dark mode** (phone and desktop): the card still reads as a card, text stays white/grey, the green stays green.
- **With images off**: the alts read as a sentence ("Cafecito × Coco Wallet", "Pago listo para cobrar") and the email still makes sense.
- The button opens the right screen inside the wallet.

The daily cap is 20 emails per recipient, test sends included. If you unsubscribe yourself while testing, `list_email_unsubscribes` with `remove` brings your address back.
