# mini-apps

Plugin de Claude Code para crear mini apps de Coco Wallet describiéndolas: el agente las crea, las corre con hot reload, te da el link para verlas **dentro de Coco Wallet** y las despliega a producción.

Desde la v1.0 todo corre en el **conector remoto de Coco**: el código vive en un sandbox en la nube, no en tu máquina. No hace falta Node, ni túnel, ni ningún token.

## Instalación

### Claude Code

```
/plugin marketplace add coco-mercado/claude-plugins
/plugin install mini-apps@coco-plugins
```

### claude.ai (sin plugin)

*Settings → Connectors → Add custom connector* con esta URL:

```
https://gateway-mcp-production-3feb.up.railway.app/mcp
```

Las skills de abajo también llegan por el conector: Claude las lee con la tool `get_skill`, y las tenés como prompts (`/ui-kit`, `/payments`, …).

## Conectar tu cuenta

La primera vez que el conector se usa, Claude abre una página con un **QR**:

1. Escanealo con el teléfono donde tenés Coco Wallet (o tocá "Abrir Coco Wallet" si estás en el teléfono).
2. Se abre "Conectar con Claude" dentro de la wallet. Verificá que el código sea el mismo que ves en la compu.
3. Tocá **Aprobar** y firmá.

No se escribe ningún PIN ni contraseña en la web. La sesión dura mientras la uses: no vas a tener que volver a conectar cada día.

## Herramientas del conector

| Tool | Qué hace |
|------|----------|
| `create_mini_app` | Crea la mini app desde el starter (Next.js + SDK + theme de Coco), la levanta en un sandbox con hot reload y la publica en el catálogo de develop. Devuelve `walletLink` para abrirla dentro de Coco Wallet |
| `write_files` · `read_file` · `list_files` · `delete_file` | Editar el código. Los archivos quedan guardados en el servidor: no se pierden aunque el sandbox se apague |
| `get_logs` · `run_command` | Logs del dev server y `install` / `typecheck` / `lint` / `build` en el sandbox |
| `get_preview` · `start_mini_app` · `stop_mini_app` | Link de preview; volver a levantar el sandbox (se apaga solo sin uso) o apagarlo |
| `deploy_mini_app` | Despliega a producción (Vercel) y publica la URL estable en el catálogo. Tarda 1–3 min: devuelve un `jobId` |
| `get_job` | Estado de un trabajo largo (deploy, ícono, creación) |
| `list_my_mini_apps` · `list_mini_apps` | Tus mini apps del conector · el catálogo publicado |
| `generate_mini_app_icon` | Genera el ícono con IA en el gateway (sin API keys) y lo publica |
| `create_notification` · `list_notifications` · `pause_notification` · `resume_notification` · `delete_notification` · `send_notification` · `list_notification_deliveries` | Notificaciones push + in-app |
| `create_email_template` · `list_email_templates` · `delete_email_template` · `preview_email` · `send_email` · `list_emails` · `list_email_unsubscribes` · `rotate_email_token` | Correo desde `<slug>@mail.cocowallet.app`, sin cuenta de proveedor |
| `create_event` · `list_events` · `pause_event` · `delete_event` · `send_test_event` · `list_event_deliveries` | Eventos para RD Station |
| `claim_mini_app` | Asociar a tu cuenta una mini app que publicaste antes con el MCP local |
| `get_skill` · `whoami` | Leer una skill · con qué cuenta estás conectado |

Los tokens propios de cada app (correo, eventos, webhook de notificaciones) los guarda el conector cifrados y los pone solo en el `.env.local` del sandbox; vos no tenés que copiar nada.

### Si venís del MCP local (v0.x)

- Tus apps siguen publicadas. Para administrarlas desde el conector, reclamalas una vez: *"reclamá Batea con el COCO_EMAIL_TOKEN de su .env.local"* (`claim_mini_app`).
- Las herramientas ahora identifican la app por `slug` en vez de `name`.
- Si preferís seguir con la carpeta local y el túnel, el MCP local sigue publicado: `claude mcp add miniapp-local -- npx -y @cocowallet/miniapp-mcp@latest`.

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

En menos de un minuto está corriendo: abrí el `walletLink` en el teléfono y la ves dentro de Coco Wallet (flavor dev). Después iterá conversando: *"agregale una pantalla de gracias con confetti"* — hot reload, sin re-publicar. Cuando te guste: *"desplegala"*.
