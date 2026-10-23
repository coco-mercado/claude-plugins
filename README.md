<img src="plugins/coco-mini-apps/.claude-plugin/icon.png" alt="" width="72" />

# Coco plugins for Claude

Official [Coco Wallet](https://cocowallet.app) plugins for Claude. Build, preview, and publish Coco Wallet mini apps from a conversation in claude.ai, Cowork, or Claude Code.

> [!NOTE]
> This repo is published automatically from Coco's internal platform repo, so pull requests here are overwritten. For help, go to [cocowallet.app/contacto](https://cocowallet.app/contacto).

## Plugins

| Plugin | What it includes |
|---|---|
| [`coco-mini-apps`](plugins/coco-mini-apps) | The Coco connector, the Coco skills, and an optional local mode for the Coco team. |

## Install

**claude.ai and Cowork:** go to **Customize → Plugins → Add → Add marketplace**, enter `coco-mercado/claude-plugins`, and install **Coco Mini Apps**. Then connect **coco-mini-apps** in the plugin's **Connectors** tab and approve access from your Coco Wallet.

**Claude Code:**

```bash
claude plugin marketplace add coco-mercado/claude-plugins
claude plugin install coco-mini-apps@coco-plugins
```

Setup details, example prompts, and the list of skills are in the [plugin README](plugins/coco-mini-apps).

## Update

- **claude.ai:** Customize → Plugins → Coco Mini Apps → **Update**.
- **Claude Code:** `claude plugin update coco-mini-apps@coco-plugins`.

<details>
<summary>Installed it as <code>mini-apps</code>?</summary>

The plugin was renamed to `coco-mini-apps` in October 2026. In Claude Code:

```bash
claude plugin uninstall mini-apps@coco-plugins
claude plugin marketplace update coco-plugins
claude plugin install coco-mini-apps@coco-plugins
```

In claude.ai, remove Coco Mini Apps and install it again from the marketplace.

</details>

<details>
<summary>Using <code>mini-apps-local</code>?</summary>

It's now the local mode of `coco-mini-apps`. In Claude Code:

```bash
claude plugin uninstall mini-apps-local@coco-plugins
claude plugin marketplace update coco-plugins
claude plugin install coco-mini-apps@coco-plugins
```

Then set `COCO_MINIAPPS_LOCAL=1` in your environment and restart Claude Code.

</details>
