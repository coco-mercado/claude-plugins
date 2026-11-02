# Sections of the knowledge base, with examples

Examples use a savings mini app, "Cochinito". Content is in Spanish because that is what users and support read.

## objective

```json
{
  "problem": "Ayuda a ahorrar en dólares de a poco: el usuario elige una meta y aparta un monto fijo cada semana desde su saldo de Coco.",
  "audience": "Usuarios de Coco Wallet que quieren proteger sus ahorros de la inflación sin abrir una cuenta en el exterior."
}
```

## mainAction

One action: the one most users come for. Steps are what the user does and sees, in order, with the real button labels.

```json
{
  "name": "Ahorrar",
  "steps": [
    { "title": "Crear la meta", "detail": "Toca \"Nueva meta\", escribe el nombre y el monto objetivo en USD." },
    { "title": "Elegir el aporte", "detail": "Elige cuánto apartar cada semana (mínimo 1 USD) y el día." },
    { "title": "Confirmar", "detail": "Revisa el resumen y toca \"Empezar a ahorrar\". Coco pide confirmar el primer aporte con tu PIN." },
    { "title": "Ver el progreso", "detail": "La meta aparece en la pantalla principal con el total ahorrado y la próxima fecha de aporte." }
  ]
}
```

## rules

Take each one from the code: look for constants (`MIN_`, `MAX_`, `FEE`), zod or form validations, amounts in `sendTransaction` calls, currency lists and country checks.

```json
[
  { "kind": "limit", "text": "Aporte mínimo: 1 USD; máximo por aporte: 500 USD." },
  { "kind": "fee", "text": "Sin comisión por aportar. Retirar antes de la fecha de la meta cobra 1 % del monto retirado." },
  { "kind": "currency", "text": "Se ahorra en USDC. Si no tienes USDC, Coco cubre el aporte con tus otras monedas al tipo de cambio del momento." },
  { "kind": "requirement", "text": "Necesitas tener la verificación de identidad aprobada en Coco." },
  { "kind": "country", "text": "Disponible en todos los países donde opera Coco Wallet." },
  { "kind": "restriction", "text": "Máximo 5 metas activas por usuario." }
]
```

## faq

Questions real users would ask support, especially about money, failures and timing. 5-15 is a good range. Cover at least:

- how much it costs (or that it's free),
- what happens if a payment fails or the balance isn't enough,
- how to get the money back or cancel,
- how long things take,
- where to see the history.

```json
[
  { "q": "¿Cuánto cuesta usar Cochinito?", "a": "Ahorrar no tiene costo. Solo si retiras antes de la fecha de tu meta se cobra el 1 % de lo que retires." },
  { "q": "¿Qué pasa si no tengo saldo el día del aporte?", "a": "El aporte de esa semana no se hace y te avisamos con una notificación. Tu meta sigue activa y el siguiente aporte se intenta en la fecha de siempre." }
]
```

## screens

The 2-6 screens a user goes through for the main action, with what support needs to recognize them from a user's description.

```json
[
  { "route": "/", "caption": "Inicio: lista de metas con su progreso y el botón \"Nueva meta\"." },
  { "route": "/metas/nueva", "caption": "Formulario de la meta: nombre, monto objetivo, aporte semanal y día." }
]
```

## notes

Markdown. Things like:

- what the user sees when something fails, and what support should tell them;
- how refunds or reversals work and who can do them;
- dependencies on other services (a partner, an exchange) and what happens when they are down;
- known limitations of the current version.
