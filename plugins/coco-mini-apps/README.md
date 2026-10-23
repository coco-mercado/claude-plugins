<img src=".claude-plugin/icon.png" alt="" width="72" />

# Coco Mini Apps

Build, preview, and publish [Coco Wallet](https://cocowallet.app) mini apps by describing them to Claude. The plugin bundles the Coco connector with skills that teach Claude how to build mini apps the Coco way.

Works in claude.ai, Cowork, and Claude Code. Nothing to install on your machine.

## Features

- **Build from a conversation.** Claude creates a Next.js mini app in a cloud workspace and edits it live.
- **Preview inside the wallet.** Every app gets a link that opens it in Coco Wallet, with your real wallet.
- **Ship from the chat.** Changes deploy automatically, and Claude publishes the app to the Coco catalog with its own icon.
- **Wallet features built in.** USDC payments on Polygon, Pago Móvil in bolívares, push notifications, email, contacts, a Postgres database, and marketing events.
- **Skills on demand.** Claude loads the right guide (UI kit, payments, notifications…) only when the task needs it.

## Installation

You need a Coco Wallet account. You sign in with it, and previews open in the app.

### claude.ai and Cowork

1. Go to **Customize → Plugins** ([claude.ai/customize/plugins](https://claude.ai/customize/plugins)).
2. Click **Add → Add marketplace** and enter `coco-mercado/claude-plugins`.
3. Install **Coco Mini Apps**.
4. In the plugin's **Connectors** tab, connect **coco-mini-apps** and approve access from your Coco Wallet.

With the same account, the plugin also appears in Claude Code as `coco-mini-apps@synced`.

### Claude Code

```bash
claude plugin marketplace add coco-mercado/claude-plugins
claude plugin install coco-mini-apps@coco-plugins
```

The first time Claude uses a connector tool, Claude Code opens the Coco Wallet sign-in.

<details>
<summary>Connector only, without the plugin</summary>

```bash
claude mcp add --transport http -s user coco-mini-apps https://mcp.cocowallet.app/mcp
```

The tools work, but the skills won't load, so results drift from the Coco UI kit and payment patterns. Prefer the plugin.

</details>

### Updating

- **claude.ai:** Customize → Plugins → Coco Mini Apps → **Update**.
- **Claude Code:** `claude plugin update coco-mini-apps@coco-plugins`, or turn on auto-update for the marketplace in `/plugin`.

## How it works

1. **Describe the app.** For example: *"Create a mini app called **Cafecito** to receive tips in USDC, with $1, $3 and $5 buttons."*
2. **Open the link.** Claude shares a link that opens the app inside Coco Wallet.
3. **Iterate.** Ask for changes and reopen the link to see them.
4. **Publish.** Say *"publish it to the catalog"* when it's ready.

More prompts to try:

- "Add a weekly push notification reminding users to check their balance."
- "Email the buyer a receipt after each payment."
- "Save each order in a database and show the history on a second screen."

## Tips for better results

- **Say who pays whom, and how much.** Payment flows are where vague prompts cost the most.
- **Test inside the wallet.** Outside Coco Wallet the app can't reach the wallet, so always use the link Claude shares.
- **One feature at a time.** Get the main screen right, then add notifications, email, or a database.
- **Never paste API keys in the chat.** If the app needs a third-party key, Claude sends you a secure link to enter it.
- **Skip styling requests.** Dark theme, Poppins, and the wallet's colors are fixed by the Coco UI kit.

## Skills

| Skill | What it covers |
|---|---|
| `sdk` | The `@cocowallet/miniapp-sdk` bridge: wallet address, USDC payments, signing, contacts, notifications, email |
| `ui-kit` | The Coco Wallet theme: colors, typography, dark mode, touch targets |
| `frontend-design` | Layout, hierarchy, motion, and copy that don't look like a template |
| `payments` | Charging and paying: transactions, batches, auto-swap, Pago Móvil, errors |
| `notifications` | Push and in-wallet notifications, even when the mini app is closed |
| `contacts` | Picking a person with the wallet's native contact picker |
| `email` | Sending email without a provider account or API key |
| `email-design` | Making those emails look like the wallet |
| `events` | Tracking in-app events for marketing (RD Station) |

## Data and privacy

The connector sends Coco your mini app's code, its configuration (title, icon, notifications, emails, events), and your wallet address to identify you. The plugin stores nothing on its own and ships no keys or secrets. See the [privacy policy](https://cocowallet.app/politica-de-privacidad) and [terms](https://cocowallet.app/terminos-y-condiciones).

## Support

- [Documentation](https://cocowallet.mintlify.app/mini-apps/instalar-plugin)
- [Contact Coco](https://cocowallet.app/contacto)

[MIT](LICENSE) © Coco Mercado
