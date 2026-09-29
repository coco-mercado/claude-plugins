# mini-apps

Plugin de Claude Code para crear mini apps de Coco Wallet describiéndolas: el agente las scaffoldea, las corre con hot reload, abre el túnel de preview y las publica en el catálogo de la wallet.

## Instalación

Dentro de Claude Code:

```
/plugin marketplace add coco-mercado/claude-plugins
/plugin install mini-apps@coco-plugins
```

Requisito: **Node ≥ 20**. Nada más — no hace falta ningún token por ahora, y el túnel de preview se maneja solo (si no tenés `cloudflared`, el MCP lo descarga automáticamente la primera vez).

Ni siquiera para generar íconos con IA hace falta una API key: la generación corre en el gateway de Coco, no en tu máquina. Lo mismo con el correo — tu mini app puede mandar mails sin crear cuenta en ningún proveedor.

## MCP incluido

El server [`@cocowallet/miniapp-mcp`](https://www.npmjs.com/package/@cocowallet/miniapp-mcp) (`miniapp-publisher`), con estas herramientas:

| Tool | Qué hace |
|------|----------|
| `start_mini_app` | Bootstrapea todo: scaffold del starter (Next.js + SDK + theme de Coco), dev server con hot reload, túnel público y publicación en el catálogo de develop |
| `list_mini_apps` | Lista tus mini apps con status, preview URL y carpeta local |
| `publish_mini_app` | Publica una app al catálogo (túnel local o URL fija de prod) |
| `republish_mini_app` | Actualiza la entrada del catálogo (nueva URL, título, ícono) |
| `generate_mini_app_icon` | Genera el ícono/logo de la app con `gpt-image-2`, usando los íconos glass de la wallet como referencia de estilo, y lo publica en el catálogo. Sin API keys: corre server-side |
| `stop_mini_app` | Para el dev server y el túnel |
| `create_notification` | Define (o actualiza) una notificación push + in-app de la mini app: copy con `{{placeholders}}`, `path` de deep link, `cron` opcional a nivel app y `webhookUrl` opcional para valores por usuario (firmado HMAC) |
| `list_notifications` · `pause_notification` · `resume_notification` · `delete_notification` | Gestión de las notificaciones definidas |
| `send_notification` | Envío inmediato a addresses/userIds que activaron notificaciones (para probar; es lo mismo que hace tu servidor con `POST /notifications/send`) |
| `list_notification_deliveries` | Historial de envíos con estado y motivo, para depurar "¿por qué no le llegó?" |
| `create_email_template` | Define (o actualiza) un correo de la mini app: asunto y cuerpo por **bloques** con `{{placeholders}}`, renderizado con el theme de Coco. Sin cuenta de proveedor ni API key |
| `list_email_templates` · `delete_email_template` | Gestión de las plantillas de correo |
| `preview_email` | Renderiza el correo **sin enviarlo** y deja el HTML en un archivo para abrirlo en el navegador |
| `send_email` | Envía a direcciones concretas, con `idempotencyKey` para no duplicar. Es el espejo de `POST /email/send` desde tu servidor |
| `list_emails` · `list_email_unsubscribes` | Historial de correos (estado y motivo) y quién se dio de baja |
| `create_event` | Declara un evento de la mini app para **RD Station**. El gateway le pone el nombre (`miniapp-<slug>-<event>`) y resuelve el contacto del usuario |
| `list_events` · `pause_event` · `delete_event` | Gestión del catálogo de eventos |
| `send_test_event` | Dispara un evento de prueba para verificar el circuito hasta RD Station (crea un contacto real: usá tu correo) |
| `list_event_deliveries` | Log de disparos con estado y motivo, para responder "¿por qué esto no aparece en RD?" |
| `restart_tunnel` | Reabre el túnel si se cayó |
| `close_tunnel` | Cierra el túnel dejando el dev server corriendo |

## Skills incluidas

| Skill | Qué hace |
|-------|----------|
| `/mini-apps:ui-kit` | El theme de Coco Wallet: colores del design system, Poppins y tema oscuro. Se activa sola al crear o modificar UI |
| `/mini-apps:frontend-design` | Guía de diseño de Anthropic para UIs distintivas, que no parezcan plantilla |
| `/mini-apps:payments` | Cómo cobrar: transacciones, batches, **auto-swap** (cubrir el saldo corto del usuario con sus otras monedas), bolívares por Pago Móvil y los errores a manejar |
| `/mini-apps:notifications` | Cómo avisarle al usuario con la mini app cerrada: push + centro de notificaciones de la wallet, opt-in nativo, schedules por usuario ("cada semana"), cron a nivel app, envío desde tu servidor ("cuando gana") y el webhook firmado para valores por usuario |
| `/mini-apps:contacts` | Cómo pedirle al usuario que elija a una persona (a quién pagar, invitar, enviar): `pickContact()` abre el selector nativo de la wallet con búsqueda y la mini app recibe solo el contacto elegido; `getContacts()` quedó deprecado |
| `/mini-apps:email` | Cómo mandar correo **sin cuenta de proveedor ni API key**: plantillas por bloques con el theme de Coco, de dónde sale la dirección del usuario, el envío desde tu servidor, la baja obligatoria y cómo depurar "no me llegó" |
| `/mini-apps:events` | Qué eventos de la mini app registrar para marketing (el embudo, no los clics), la nomenclatura que impone el gateway, dónde disparar cada uno (cliente = intención, servidor = plata) y cómo depurar "no aparece en RD Station" |
| `/mini-apps:email-design` | El diseño de esos correos: qué bloque usa cada contenido, jerarquía, asunto y preheader, patrones listos (recibo, código, bienvenida, resumen) y el checklist antes de guardar |

## Ejemplo

Con el plugin instalado, pedile a Claude:

> "Creá una mini app llamada **Cafecito** para recibir propinas en USDC, con botones de $1, $3 y $5."

En menos de un minuto está corriendo y publicada: abrí la wallet (flavor dev) y aparece en el catálogo. Después iterá conversando: *"agregale una pantalla de gracias con confetti"* — hot reload, sin re-publicar.
