# Checklist before update_knowledge_base

- [ ] I read the current version with `get_knowledge_base` and kept what is still true.
- [ ] Every section I send is complete (it replaces the stored one): all `rules`, all `faq`.
- [ ] Every number (limit, fee, minimum, time) comes from the code or the user. None is a guess.
- [ ] If the app moves money: it says in which currency, who receives it, the fees, and what happens when the balance isn't enough.
- [ ] `mainAction.steps` goes from opening the app to the confirmation, with the real button labels.
- [ ] The FAQ covers cost, failures, cancelling or getting money back, timing and history.
- [ ] FAQ answers have no technical words (SDK, API, Polygon, gas, contract) and each one makes sense on its own.
- [ ] Questions that need a person end with "Escríbenos desde Perfil → Habla con nosotros".
- [ ] Everything is in Spanish.
- [ ] No emails, wallet addresses, keys or internal URLs.
- [ ] After the call, `missing` is empty (or I told the user what is missing and why).
