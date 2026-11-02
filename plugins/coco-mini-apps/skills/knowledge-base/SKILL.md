---
name: knowledge-base
description: "Use ALWAYS when a Coco mini app's knowledge base has to be written or brought up to date — the document Coco's customer support uses to answer users, and the FAQ the wallet shows under \"Preguntas y respuestas\". The connector flags it as out of date after code changes (`knowledgeBase.stale` in write_files, update_mini_app or publish_mini_app). Covers what goes in each section (objective, main action step by step, rules and fees, FAQ, screens, notes), how to pull limits and fees from the code instead of inventing them, and writing FAQ answers for end users. Also when the user says \"document the mini app\", \"write the FAQ\", \"update the docs for support\", \"knowledge base\", or in Spanish \"documentá la mini app\", \"base de conocimiento\", \"preguntas frecuentes\", \"preguntas y respuestas\", \"que soporte sepa cómo funciona\", \"actualizá la documentación\"."
---

# Knowledge base of a Coco mini app

Every mini app has one knowledge base, stored by the gateway. Two readers depend on it:

- **Coco's customer support** (people and an automated agent) answer users with it. If it is stale, they give wrong answers about money.
- **The wallet** shows its `faq` section to users in the mini app's ⋮ menu → "Preguntas y respuestas".

If nobody updates it within a few hours, the platform writes a version from the code on its own (`updatedBy: "auto"` in `get_knowledge_base`). Treat that as a draft: check it against what you know about the app and correct it.

The connector marks it **stale** whenever the app's code, title or published URL changes, and adds `knowledgeBase: { stale: true }` to the responses of `write_files`, `update_mini_app` and `publish_mini_app`. Update it **once, when a change is finished**, not after every file.

## Workflow

1. `get_knowledge_base({ slug })`: read what is there. Keep what is still true.
2. Read the code that the change touched (`read_file`), plus anything that defines rules: constants, validations, amounts, fees, supported currencies or countries, error messages.
3. `update_knowledge_base({ slug, ...sections })` with **only the sections that changed**. Each section you send replaces the stored one entirely, so send the whole list (all `rules`, all `faq`), not just the new items.
4. Check `missing` in the response. A first version should cover every section.

Write everything in **Spanish**, the language of the wallet's users and of support.

## Sections

| Section | What it holds |
|---|---|
| `objective` | `problem`: what it solves, in one or two sentences. `audience`: who it is for. |
| `mainAction` | `name` of the main action (Ahorrar, Comprar, Pagar, Recargar…) and its `steps` from opening the app to the confirmation, as the user sees them: button labels, what they type, what they get. |
| `rules` | One entry per fact, with `kind`: `limit`, `fee`, `requirement`, `country`, `currency`, `restriction`. |
| `faq` | `q`/`a` pairs for end users. Shown in the wallet as written. |
| `screens` | Main screens: `route` (e.g. `/`, `/ahorrar`) and a `caption` of what the user sees there. The platform screenshots each route on the deployed app after every new version (`screenshots` in `get_knowledge_base`); `refresh_screenshots` asks for new ones if the look changed but the knowledge base didn't. |
| `notes` | Anything support needs that fits nowhere else (Markdown): what happens if a payment fails, how refunds work, who to escalate to, known limitations. |

Details and examples for each section: [references/sections.md](references/sections.md). Run [references/checklist.md](references/checklist.md) before calling `update_knowledge_base`.

## Rules that matter

- **Never invent a number.** Limits, fees, minimums, timings and currencies come from the code (or from the user). If the code doesn't say it and the user doesn't know, leave it out and mention the gap in `notes`.
- **Payments:** if the app moves money, read the `payments` skill's model before describing it (USDC on Polygon, `requiredFunds` paying with other coins, bolívares through Pago Móvil). Say who receives the money and when it is final.
- **FAQ for the user, not for developers.** No "SDK", "endpoint", "Polygon", "smart contract" or "gas" in answers. Write "tu saldo", "tu cuenta de Coco", "la confirmación".
- **Answers stand alone.** The wallet shows one question at a time: don't write "como dijimos arriba".
- **No personal data or secrets** anywhere: no emails, wallet addresses, API keys or internal URLs.
- A FAQ answer that needs a person ends with what to do: "Escríbenos desde Perfil → Habla con nosotros".
