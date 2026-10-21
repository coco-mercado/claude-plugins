# Coco Mini Apps

Plugin para crear mini apps de Coco Wallet describiéndolas en una conversación con Claude. Trae el conector de Coco (`https://mcp.cocowallet.app/mcp`), que crea la app en un workspace en la nube, la previsualiza dentro de la wallet y la publica en el catálogo, y las skills que le enseñan a Claude a construirla bien: UI kit, pagos, notificaciones, correo, eventos y contactos.

Funciona en claude.ai, Cowork y Claude Code. No hace falta instalar Node ni nada en tu máquina.

## Instalación

**claude.ai (y Cowork):** Customize › Plugins › Add › **Add marketplace** → `coco-mercado/claude-plugins` → instala **Coco Mini Apps**. Después, en la pestaña **Connectors** del plugin, conecta *coco-mini-apps* e inicia sesión con tu wallet. El plugin aparece también en Claude Code (como `coco-mini-apps@synced`) si usas la misma cuenta.

**Claude Code:** `claude plugin marketplace add coco-mercado/claude-plugins` y `claude plugin install coco-mini-apps@coco-plugins`. La primera vez que Claude use el conector te pedirá iniciar sesión.

**Actualizar:** Update en la ficha del plugin (claude.ai) o `claude plugin update coco-mini-apps@coco-plugins` (Claude Code).

## Uso

Pídele a Claude, por ejemplo:

> "Crea una mini app llamada **Cafecito** para recibir propinas en USDC, con botones de $1, $3 y $5."

Claude la crea, te comparte un link que la abre dentro de Coco Wallet y sigue iterando sobre lo que le pidas. Las skills se activan solas según la tarea (por ejemplo `payments` al cobrar o `ui-kit` al tocar pantallas).

| Skill | Para qué |
|---|---|
| `sdk` | El bridge `@cocowallet/miniapp-sdk`: dirección del usuario, pagos USDC en Polygon, firmas, contactos, notificaciones, correo |
| `ui-kit` | El theme de Coco Wallet: colores, Poppins y tema oscuro |
| `frontend-design` | Diseño distintivo, que no parezca plantilla |
| `payments` | Cobrar y pagar: transacciones, batches, auto-swap, bolívares por Pago Móvil y errores |
| `notifications` | Push y centro de notificaciones de la wallet, con la mini app cerrada |
| `contacts` | Elegir a una persona con el selector nativo de la wallet |
| `email` | Mandar correo sin cuenta de proveedor ni API key |
| `email-design` | El diseño de esos correos |
| `events` | Eventos de la mini app para marketing (RD Station) |

## Datos

El conector manda a Coco el código de la mini app, su configuración (título, ícono, notificaciones, correos, eventos) y la dirección de tu wallet para identificarte. El plugin no guarda nada por su cuenta y no incluye claves ni secretos.
