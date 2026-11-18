# The notification pattern, ready to copy

The `html` body of a state notification: brand lockup → hero → title → lead → «Siguientes pasos» → one button. It is the markup the Creadores mini app ships (`creadores` repo, `apps/api/docs/email-templates`), generalized. It survives the gateway's sanitizer unchanged and already follows the Gmail dark-mode rules below, so **change the slots and the copy, not the structure.**

Slots in `UPPER_CASE` are filled once, when you write the template. `{{placeholders}}` are filled per send, from `params`.

## 1. Images first

Every image is a **hosted PNG at 2x** with explicit `width`/`height` and an `alt` that reads well with images off (most clients start that way): the lockup reads "Cafecito × Coco Wallet", the hero reads the state ("Pago listo para cobrar").

| Slot | File | Shown at |
|---|---|---|
| `APP_LOGO_URL` | the mini app's logo, square PNG, 104×104. The catalog icon works (`iconUrl` in `list_mini_apps`) if it's a PNG | 52×52 |
| `COCO_LOGO_URL` | the Coco Wallet logo, 498×84 (see below) | 166×28 |
| `HERO_URL` | one PNG per state, 288×288, transparent background | 144×144 |

Host them in the mini app itself: `public/email/` in the Next.js project is served at `<production URL>/email/<file>` once the app is deployed. Never a sandbox URL (`*.vercel.run`) — it sleeps — and never rename or delete a file once an email used it: images load when the person opens the email, maybe months later.

The Coco Wallet logo has no shared host yet. The copy Creadores serves is `https://creadores.cocowallet.app/email/logo-coco-wallet.png`; download it once into your own `public/email/` instead of hotlinking another app's deploy:

```sh
curl -sfo public/email/logo-coco-wallet.png https://creadores.cocowallet.app/email/logo-coco-wallet.png
```

The hero is the image of the **state**, not of the person: success, waiting, money, needs changes, closed. One family of images, same style as the app's icon, so the five states read as a set. If the app has no art for a state, ask the user for it — the connector doesn't generate images — or leave the hero row out. A stock photo is worse than no hero.

## 2. The fragment

Example copy: Creadores' "money ready" email. Pass the whole thing as `html`:

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
<tr><td align="center" style="padding:20px 0 26px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr><td valign="middle"><img src="APP_LOGO_URL" width="52" height="52" alt="APP_NAME" style="display:block;width:52px;height:52px;border:0;outline:none;text-decoration:none;border-radius:14px;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:16px;font-weight:600;color:#FFFFFF;text-align:center;" /></td><td valign="middle" class="t-2" style="padding:0 16px;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;line-height:24px;font-weight:500;color:#ABB0AE;"><span class="gm-s"><span class="gm-d">&times;</span></span></td><td valign="middle"><img src="COCO_LOGO_URL" width="166" height="28" alt="Coco Wallet" style="display:block;width:166px;height:28px;border:0;outline:none;text-decoration:none;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:16px;font-weight:600;color:#FFFFFF;text-align:center;" /></td></tr></table></td></tr>
<tr><td align="center" style="padding:0;"><img src="HERO_URL" width="144" height="144" alt="Pago listo para cobrar" style="display:block;width:144px;height:144px;margin:0 auto;border:0;outline:none;text-decoration:none;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:18px;color:#ABB0AE;text-align:center;" /></td></tr>
<tr><td style="padding:18px 4px 0 4px;"><h1 class="t-white" style="margin:0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:28px;line-height:34px;font-weight:600;letter-spacing:-0.02em;color:#FFFFFF;text-align:center;"><span class="gm-s"><span class="gm-d">{{nombre}}, tienes {{monto}} para cobrar</span></span></h1></td></tr>
<tr><td style="padding:12px 6px 0 6px;"><p class="t-2" style="margin:0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;line-height:25px;color:#C1C1C1;text-align:center;"><span class="gm-s"><span class="gm-d">Tu video cumplió su tiempo de conteo y revisión. Cóbralo en USDC a tu Coco Wallet.</span></span></p></td></tr>
<tr><td style="padding:28px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="b-card" bgcolor="#252527" style="background-color:#252527;background-image:linear-gradient(#252527,#252527);border-radius:24px;padding:22px 20px 8px 20px;"><p class="t-white" style="margin:0 0 6px 0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:19px;line-height:24px;font-weight:600;letter-spacing:-0.02em;color:#FFFFFF;"><span class="gm-s"><span class="gm-d">Siguientes pasos</span></span></p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td width="40" valign="top" style="width:40px;padding:14px 14px 14px 0;"><div class="b-green" style="width:40px;height:40px;border-radius:20px;background-color:#00AF71;background-image:linear-gradient(#00AF71,#00AF71);text-align:center;font-family:Arial,sans-serif;font-size:18px;line-height:40px;font-weight:700;color:#FFFFFF;"><span class="gm-s"><span class="gm-d">&#10003;</span></span></div></td><td valign="middle" style="padding:14px 0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;"><div class="t-white" style="font-size:16px;line-height:21px;font-weight:600;color:#FFFFFF;"><span class="gm-s"><span class="gm-d">Pago liberado</span></span></div><div class="t-2" style="padding-top:3px;font-size:14px;line-height:20px;color:#ABB0AE;"><span class="gm-s"><span class="gm-d">{{monto}} en USDC.</span></span></div></td></tr>
<tr><td colspan="2" height="1" style="height:1px;line-height:1px;font-size:1px;padding:0;background-color:#333335;background-image:linear-gradient(#333335,#333335);"></td></tr>
<tr><td width="40" valign="top" style="width:40px;padding:14px 14px 14px 0;"><div class="b-chip" style="width:40px;height:40px;border-radius:20px;background-color:#2F3032;background-image:linear-gradient(#2F3032,#2F3032);text-align:center;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:17px;line-height:40px;font-weight:600;color:#FFFFFF;"><span class="gm-s"><span class="gm-d">2</span></span></div></td><td valign="middle" style="padding:14px 0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;"><div class="t-white" style="font-size:16px;line-height:21px;font-weight:600;color:#FFFFFF;"><span class="gm-s"><span class="gm-d">Abre Mis videos</span></span></div><div class="t-2" style="padding-top:3px;font-size:14px;line-height:20px;color:#ABB0AE;"><span class="gm-s"><span class="gm-d">En Creadores, dentro de Coco Wallet.</span></span></div></td></tr>
<tr><td colspan="2" height="1" style="height:1px;line-height:1px;font-size:1px;padding:0;background-color:#333335;background-image:linear-gradient(#333335,#333335);"></td></tr>
<tr><td width="40" valign="top" style="width:40px;padding:14px 14px 14px 0;"><div class="b-chip" style="width:40px;height:40px;border-radius:20px;background-color:#2F3032;background-image:linear-gradient(#2F3032,#2F3032);text-align:center;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:17px;line-height:40px;font-weight:500;color:#ABB0AE;"><span class="gm-s"><span class="gm-d">3</span></span></div></td><td valign="middle" style="padding:14px 0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;"><div class="t-white" style="font-size:16px;line-height:21px;font-weight:600;color:#FFFFFF;"><span class="gm-s"><span class="gm-d">Toca Cobrar</span></span></div><div class="t-2" style="padding-top:3px;font-size:14px;line-height:20px;color:#ABB0AE;"><span class="gm-s"><span class="gm-d">El dinero entra a tu Coco Wallet.</span></span></div></td></tr>
</table></td></tr></table></td></tr>
<tr><td style="padding:26px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="b-green" bgcolor="#00AF71" align="center" height="56" style="height:56px;mso-padding-alt:18px 24px;background-color:#00AF71;background-image:linear-gradient(#00AF71,#00AF71);border-radius:28px;"><a href="{{link}}" style="display:block;padding:18px 24px;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:28px;text-align:center;"><span class="gm-s"><span class="gm-d">Cobrar mis {{monto}}</span></span></a></td></tr></table></td></tr>
</table>
```

## 3. The step rows

Each row of the card is one line of the fragment above; a 1 px separator row goes **between** rows (not before the first or after the last). The number is the row's position, done rows included: one done row, then the next step is `2`.

| State | Circle | Number / mark | Detail line |
|---|---|---|---|
| **done** | `class="b-green"`, `#00AF71`, Arial 18 px 700 | `&#10003;` in white | optional |
| **next** | `class="b-chip"`, `#2F3032`, 17 px **600**, `color:#FFFFFF` | its position | yes — what to do |
| **later** | `class="b-chip"`, `#2F3032`, 17 px **500**, `color:#ABB0AE` | its position | yes |

The three rows in the fragment are one of each, in that order. To build another state, copy the row you need and change only the text, the number and — between next and later — the two values in bold. A row without a detail drops the whole `<div class="t-2" …>…</div>`.

How the state maps to the rows:

| State | Example (Creadores) | Rows |
|---|---|---|
| success | access approved | ✓ Acceso aprobado · **2** Graba tu video · 3 Publícalo · 4 Cobra |
| waiting | request received | ✓ Solicitud enviada · **2** Revisamos tu video · 3 Elige un formato |
| money | ready to claim | ✓ Pago liberado · **2** Abre Mis videos · 3 Toca Cobrar |
| needs changes | changes requested | ✓ Revisamos tu video (detail: `{{motivo}}`) · **2** Haz los cambios · 3 Lo revisamos otra vez |

## 4. The plain-text version

Always pass `text` yourself: without it the gateway derives one from the HTML, crudely. Same order, same words, the link spelled out:

```
{{nombre}}, tienes {{monto}} para cobrar

Tu video cumplió su tiempo de conteo y revisión. Cóbralo en USDC a tu Coco Wallet.

Siguientes pasos
✓ Pago liberado: {{monto}} en USDC.
2. Abre Mis videos: en Creadores, dentro de Coco Wallet.
3. Toca Cobrar: el dinero entra a tu Coco Wallet.

Cobrar mis {{monto}}: {{link}}
```

## 5. Saving it

```
create_email_template {
  slug: "<app>", key: "claim_ready",
  subject: "Tienes {{monto}} para cobrar",
  preheader: "Tu video ya cumplió su tiempo de revisión. Cóbralo en USDC a tu Coco Wallet.",
  header: false,
  html: "<table role=\"presentation\" …",     // the fragment, as one string
  text: "{{nombre}}, tienes {{monto}} …"
}
```

`{{link}}` is a param like any other. For a button that opens the mini app inside the wallet, pass the app's `walletLink` (`get_preview` returns it), adding `?path=/the/screen` to land on a specific screen.

## What the gateway does to your `html`

Checked against `gateway/src/email/validate.ts` (`sanitizeHtml`) and `render.ts`:

- **Kept tags:** `table thead tbody tr td th p br b strong i em u a span div h1 h2 h3 h4 ul ol li img hr blockquote small code pre`. Any other tag is removed and its inner text stays — so no `<center>`, `<font>`, `<head>` or `<body>` of your own.
- **Kept attributes:** all of them (`style`, `class`, `bgcolor`, `align`, `valign`, `width`, `height`, `colspan`, `role`, `alt`…) except `on*` handlers.
- **Links and images:** an `href`/`src` survives if it's `http(s)` / `mailto` or starts with `{{`; anything else becomes `#`.
- **Removed with their content:** HTML comments — including Outlook's `<!--[if mso]>` conditionals — and `<style>`, `<script>`, `<iframe>`, `<form>`, `<link>`, `<meta>`, `<base>`, `<object>`, `<embed>`. Your CSS can only be inline `style`.
- **Wrapped:** the fragment goes inside a padded cell of the Coco shell (20 px each side, 600 px max width), after the header row if it's on and before the footer.
- **Params are inserted as-is in `html`** — not escaped, unlike in blocks. If a value can contain `<`, `>` or `&` (a name someone typed), escape it on your server before sending it.
- Runs of spaces and tabs collapse to one space; the HTML may be up to 100 000 characters.

The classes do work: the shell's own `<style>` defines `gm-s`/`gm-d` (Gmail app dark mode) and `t-white`, `t-2`, `t-muted`, `b-card`, `b-chip`, `b-green` (Outlook dark mode, which repaints them with the gateway's tokens).

## Gmail dark mode rules

The Gmail app inverts colors in dark mode but leaves background images alone. The fragment survives it because:

- every `background-color` is followed by the same color as `background-image:linear-gradient(c,c)`;
- every text node sits in `<span class="gm-s"><span class="gm-d">…</span></span>`;
- there are no colored borders — separators are 1 px rows with a background;
- no text is green — colored text can't be protected and turns pink. Green lives only in backgrounds (the button, the done check).

Keep all four when you edit: a new paragraph without the spans, or a `border:1px solid #333335`, is exactly what breaks in a phone in dark mode.
