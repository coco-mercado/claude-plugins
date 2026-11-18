# Pre-save checklist

Run through this with the rendered preview open. Each item is a failure seen in real inboxes, not a style preference.

## Content
- [ ] One job. The title says what happened; nothing below restates it.
- [ ] Exactly one button, and it's the only link. No secondary links.
- [ ] The button label says what happens next, not "Click aquí".
- [ ] No code, token or password in the subject — it shows on the lock screen.
- [ ] No promised deadline or response time that nothing enforces.

## Notification pattern (`html`)
- [ ] Order: lockup → hero → title → lead → «Siguientes pasos» → button. Nothing else: no eyebrow, stat pills, tips, sign-off or footnote.
- [ ] `header: false` on the template, so the gateway's header row doesn't sit on top of the lockup.
- [ ] The hero matches the state (success, waiting, money, needs changes, closed).
- [ ] Title: one sentence with `{{nombre}}`. Lead: one or two sentences that add to it.
- [ ] Steps mirror the state: what happened is done (green check), exactly one next (white number) that matches the button, the rest later (grey). Numbers count the done rows.
- [ ] Every text node in `gm-s`/`gm-d` spans, every `background-color` with its `linear-gradient`, no colored borders, no green text.
- [ ] Your own `text` version, in the same order as the HTML.
- [ ] Params that people type (names) are escaped on your server — `html` inserts them as-is.

## Blocks
- [ ] The payload (amount, code, receipt) is in `stat` / `code` / `rows`, not buried in a paragraph.
- [ ] At most one `button`; at most one `heading`.

## Subject and preheader
- [ ] Subject ≤ ~60 visible characters, with the identifier (`#1234`, the brand) when there is one.
- [ ] Preheader adds information; it does not repeat the subject.
- [ ] Both read correctly with real values, not with `{{placeholders}}` showing.

## Rendering
- [ ] Previewed with **realistic** params (a long name, `$1.234,56`, a long campaign name) — not "test" / "123".
- [ ] `missingParams` is empty: a missing param renders as nothing.
- [ ] Nothing wraps badly at phone width: the title, long codes, long names.
- [ ] Images are hosted PNGs at 2x with `width`, `height` and `alt`; the email still makes sense with images off.
- [ ] Total HTML well under ~102 KB — past that Gmail clips the end, taking the unsubscribe link with it.

## Theme
- [ ] Only the palette in SKILL.md. Green only on the button and the done checks.
- [ ] Spanish, in the same register as the app's screens, short.

## Deliverability (`references/deliverability.md`)
- [ ] ≤ 20 params per recipient — only the ones the template uses.
- [ ] SpamAssassin score at the shell's baseline (~1.1, `FONT_INVIS_MSGID`) and nothing above it.
- [ ] A real send to yourself landed in the inbox, checked on a phone and in dark mode.

## Trust
- [ ] The person can tell in one second why they got this (their action or their state is named).
- [ ] Footer intact — the gateway's sender line + unsubscribe. Don't add your own.
- [ ] Nothing pretends to be the wallet itself: this is the mini app writing, next to Coco Wallet's logo, not as Coco Wallet. Don't imitate wallet security notices or ask for credentials, a seed phrase or a PIN — no legitimate Coco email ever does.
