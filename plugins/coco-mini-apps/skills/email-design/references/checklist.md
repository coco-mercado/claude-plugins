# Pre-save checklist

Run through this with the rendered preview open. Each item is a failure seen in real inboxes, not a style preference.

## Content
- [ ] One job. The heading says what happened; nothing below restates it.
- [ ] Exactly one `button`. Secondary paths are links inside `text`.
- [ ] The payload (amount, code, receipt) is in `stat` / `code` / `rows`, not buried in a paragraph.
- [ ] The button label says what happens next, not "Click aquí".
- [ ] No code, token or password in the subject — it shows on the lock screen.

## Subject and preheader
- [ ] Subject ≤ ~60 visible characters, with the identifier (`#1234`) when there is one.
- [ ] Preheader adds information; it does not repeat the subject.
- [ ] Both read correctly with real values, not with `{{placeholders}}` showing.

## Rendering
- [ ] Previewed with **realistic** params (long name, `$1.234,56`, a real order id) — not "test" / "123".
- [ ] No `{{placeholder}}` left unrendered: `preview_email` lists what's missing, and a missing one renders empty.
- [ ] Nothing wraps badly at phone width: long codes, long product names, long addresses.
- [ ] Images (if any) have `alt`, and the email still makes sense with images off.
- [ ] Total HTML well under ~102 KB — past that Gmail clips the end, taking the unsubscribe link with it.

## Theme
- [ ] No hardcoded colors outside the tokens (only possible via the `html` escape hatch — if you did, justify it).
- [ ] Green used for the action, not as decoration.
- [ ] The tone matches the mini app's screens: Spanish, voseo, short.

## Trust
- [ ] The person can tell in one second why they got this (their action is named).
- [ ] Footer intact — app name + unsubscribe. Never bypass it with raw `html`.
- [ ] Nothing pretends to be the wallet itself: this is the mini app writing, not Coco Wallet. Don't imitate wallet security notices or ask for credentials, a seed phrase or a PIN — no legitimate Coco email ever does.
