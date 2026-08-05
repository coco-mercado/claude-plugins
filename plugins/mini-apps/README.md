# mini-apps

Plugin de Claude Code para crear mini apps de Coco Wallet describiéndolas: el agente las scaffoldea, las corre con hot reload, abre el túnel de preview y las publica en el catálogo de la wallet.

## Instalación

Dentro de Claude Code:

```
/plugin marketplace add coco-mercado/claude-plugins
/plugin install mini-apps@coco-plugins
```

Requisito: **Node ≥ 20**. Nada más — no hace falta ningún token por ahora, y el túnel de preview se maneja solo (si no tenés `cloudflared`, el MCP lo descarga automáticamente la primera vez).

Solo para generar íconos con IA (`generate_mini_app_icon`) hace falta una `OPENAI_API_KEY` exportada en tu shell antes de abrir Claude Code — el plugin la pasa al MCP. El resto de las herramientas funciona sin ella.

## MCP incluido

El server [`@cocowallet/miniapp-mcp`](https://www.npmjs.com/package/@cocowallet/miniapp-mcp) (`miniapp-publisher`), con estas herramientas:

| Tool | Qué hace |
|------|----------|
| `start_mini_app` | Bootstrapea todo: scaffold del starter (Next.js + SDK + theme de Coco), dev server con hot reload, túnel público y publicación en el catálogo de develop |
| `list_mini_apps` | Lista tus mini apps con status, preview URL y carpeta local |
| `publish_mini_app` | Publica una app al catálogo (túnel local o URL fija de prod) |
| `republish_mini_app` | Actualiza la entrada del catálogo (nueva URL, título, ícono) |
| `generate_mini_app_icon` | Genera el ícono/logo de la app con `gpt-image-2`, usando los íconos glass de la wallet como referencia de estilo, y lo publica en el catálogo. Necesita `OPENAI_API_KEY` |
| `stop_mini_app` | Para el dev server y el túnel |
| `restart_tunnel` | Reabre el túnel si se cayó |
| `close_tunnel` | Cierra el túnel dejando el dev server corriendo |

## Skills incluidas

| Skill | Qué hace |
|-------|----------|
| `/mini-apps:ui-kit` | El theme de Coco Wallet: colores del design system, Poppins y tema oscuro. Se activa sola al crear o modificar UI |
| `/mini-apps:frontend-design` | Guía de diseño de Anthropic para UIs distintivas, que no parezcan plantilla |

## Ejemplo

Con el plugin instalado, pedile a Claude:

> "Creá una mini app llamada **Cafecito** para recibir propinas en USDC, con botones de $1, $3 y $5."

En menos de un minuto está corriendo y publicada: abrí la wallet (flavor dev) y aparece en el catálogo. Después iterá conversando: *"agregale una pantalla de gracias con confetti"* — hot reload, sin re-publicar.
