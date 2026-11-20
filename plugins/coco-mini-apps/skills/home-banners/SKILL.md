---
name: home-banners
description: Use ALWAYS when someone wants to manage the promo banners of the Coco Wallet Home carousel — list them, create one, upload its image, change its text, image, mini app or order, hide one or show it again — in dev or in production, without a wallet release. For the Coco team (marketing, product) whose wallet is in BANNER_EDITORS; it is not for mini app builders. Also when the user says "edit the Home banner", "hide the Zelle banner", "add a banner for my mini app", "change the banner text", "upload the banner image", or in Spanish "editá el banner", "subí la imagen del banner", "cambiá la captura del banner", "ocultá el banner de Zelle", "mostrá el banner", "creá un banner para Regalitos", "cambiá el texto del banner", "banners del Home", "carrusel de banners".
---

# Home banners of Coco Wallet

The Home of the wallet shows a carousel of compact banners. Each one promotes a mini app: a phone with a screenshot of the mini app, a title, the mini app's name with an arrow, and an optional glass card with two lines. Tapping the banner opens that mini app.

The content lives in the catalog of each gateway, not in the app: what you change here shows up the next time the user opens the Home, with no release.

Only wallets listed in `BANNER_EDITORS` can use these tools. Anyone else gets `NOT_BANNER_EDITOR`: ask the platform team to add the wallet address.

## Tools

| Tool | What it does |
|---|---|
| `list_banners` | All banners, visible and hidden (`enabled`), in carousel order. Start here to get the ids. |
| `upload_banner_image` | Hosts the screenshot and returns `{ url, bytes, contentType }`. That `url` is the `imageUrl`. |
| `create_banner` | New banner. Visible right away unless `enabled: false`. |
| `update_banner` | Changes only the fields you send. |
| `hide_banner` / `show_banner` | Hides it from the carousel without deleting it / shows it again. |

Every tool takes `env`: **`dev`** (default — the dev app, for trying things) or **`prod`** (the Home every user sees). There is no delete: hide the banner instead.

## Fields

| Field | What it is |
|---|---|
| `title` | Main line, e.g. *Gift cards para consentir*. Keep it around 25 characters, like the existing ones (max 60). |
| `miniAppId` | Slug of the mini app the banner opens — the `id` from `list_mini_apps`. It must exist in that environment's catalog. |
| `label` | Name of the mini app at the bottom, next to the arrow, e.g. *Regalitos*. |
| `imageUrl` | `https` URL of the screenshot shown inside the phone: the `url` that `upload_banner_image` returns. A vertical capture of the mini app's main screen. |
| `badgeLabel` / `badgeValue` | Optional glass card: first line (regular) and second line (bold), e.g. *Depositas* / *Zelle*. `null` or `""` removes them. |
| `order` | Position in the carousel, lowest first. New banners go last. |

Copy is Spanish, short and concrete, like the rest of the wallet.

## The image

Upload it with `upload_banner_image` and pass the returned `url` as `imageUrl`. Send **one** source:

- `data`: the image in base64 (a `data:image/png;base64,` prefix is fine). Use it when the file is on disk: read it and encode it. Shrink it first if it is big (WebP or JPEG, ~1080 px wide): every byte travels in the tool call.
- `sourceUrl`: a public `http(s)` link that downloads the image directly (a shared Drive file, a temporary link). The gateway downloads it and hosts its own copy, so the banner keeps working when that link expires. A link to a viewer page (the Drive preview, a login) fails with `UNSUPPORTED_TYPE`: use the direct-download link.

Only PNG, JPEG or WebP, up to 3 MB. The type is read from the bytes, not from the extension. Errors: `TOO_LARGE` (compress it), `UNSUPPORTED_TYPE` (convert it), `SOURCE_FAILED` (the link did not answer or is not public).

Use the same `env` as the banner: an image uploaded with `env: "prod"` is hosted by the production gateway. When you take a banner from dev to prod, upload the image again with `env: "prod"` and use that new `url` — don't point the production Home at the dev gateway.

Each upload gets a new URL. To change the image of an existing banner, upload the new one and `update_banner` with its `url`.

## How to work

1. `list_banners` in the environment you will touch, to see what is there and get the ids.
2. If there is a new image, `upload_banner_image` with `env: "dev"`.
3. **Try it in dev first**: create or edit with `env: "dev"` (the `imageUrl` from step 2), then open the Home of the dev app and check the text fits and the image looks right.
4. Repeat the same change with `env: "prod"` — `upload_banner_image` with `env: "prod"` first if there is an image. Confirm with the person before touching prod: it changes the Home of every user at once.
5. To take a banner down, `hide_banner` — never recreate it to "reset" it.

The mini app must exist in the catalog of the environment you target: a mini app that is only in dev gives a validation error in prod.

## Don't

- Don't touch `env: "prod"` without the person confirming the exact change.
- Don't put links, prices that change or personal data in the copy.
- Don't put a link from elsewhere straight into `imageUrl`, least of all `http://` or temporary ones (sandbox, expiring signed links): upload it with `upload_banner_image` (`sourceUrl`) and use the URL it returns.
- Don't use a dev image `url` in a production banner.
