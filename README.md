# Coco Mini Apps para Claude

Plugin oficial de [Coco Wallet](https://cocowallet.app) para crear, probar y publicar mini apps desde una conversación con Claude. Trae el conector de Coco (crear la app, editar, desplegar, ícono, notificaciones, correo) y las guías de Coco (UI kit, pagos, notificaciones, correo, eventos, contactos) que Claude usa solo cuando hacen falta.

> Este repo se publica automáticamente desde el repo interno de la plataforma. No abras PRs aquí.

## Instalar en claude.ai o en la app de Claude

1. Ve a **Customize → Plugins** ([claude.ai/customize/plugins](https://claude.ai/customize/plugins)).
2. **Add → Add marketplace** y escribe `coco-mercado/claude-plugins`.
3. Instala **Coco Mini Apps** (`mini-apps`).
4. En la pestaña **Connectors** del plugin, conecta **coco-mini-apps** y aprueba el acceso desde tu Coco Wallet.

Listo: pídele a Claude "crea una mini app de Coco que…". El plugin también aparece en Claude Code con la misma cuenta.

## Instalar en Claude Code

```
claude plugin marketplace add coco-mercado/claude-plugins
claude plugin install mini-apps@coco-plugins
```

La primera vez que uses una herramienta del conector, Claude Code abre el login con Coco Wallet.

## Actualizar

- **claude.ai:** Customize → Plugins → Coco Mini Apps → Update.
- **Claude Code:** `claude plugin update mini-apps@coco-plugins` (o activa auto-update del marketplace en `/plugin`).

## Plugins

| Plugin | Para quién |
|---|---|
| `mini-apps` | Builders de mini apps: conector remoto de Coco + guías. |
| `mini-apps-local` | Equipo de Coco: las mismas guías con el MCP local (stdio). Requiere credenciales internas. |
