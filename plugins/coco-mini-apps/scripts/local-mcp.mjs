#!/usr/bin/env node
// Launches the local (stdio) Coco Mini Apps MCP server, only when local mode is on.
//
// The plugin always declares this server next to the remote connector. claude.ai
// ignores local servers; Claude Code and Cowork start it. Builders don't need it,
// so unless COCO_MINIAPPS_LOCAL=1 is set in Claude Code's environment it answers
// as an MCP server with no tools: nothing is downloaded and nothing lands in the
// model's context. With local mode on, it hands stdio over to the pinned package
// passed as the first argument (`npx -y @cocowallet/miniapp-mcp@<version>`).
//
// stdout is the protocol channel: log only to stderr.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const pkg = process.argv[2];

if (process.env.COCO_MINIAPPS_LOCAL === '1') {
  if (!pkg) {
    console.error('[coco-mini-apps] missing the MCP package to run');
    process.exit(1);
  }
  const child = spawn('npx', ['-y', pkg], { stdio: 'inherit', shell: process.platform === 'win32' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', (e) => {
    console.error(`[coco-mini-apps] could not start ${pkg}: ${e.message}`);
    process.exit(1);
  });
  child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
} else {
  serveWithoutTools();
}

// Minimal MCP server over newline-delimited JSON-RPC: it declares no capabilities,
// so clients never ask it for tools, and answers anything else with "not found".
function serveWithoutTools() {
  const send = (msg) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...msg })}\n`);
  const lines = createInterface({ input: process.stdin });
  lines.on('line', (line) => {
    let req;
    try {
      req = JSON.parse(line);
    } catch {
      return;
    }
    if (req?.id === undefined || req.id === null) return; // notification
    if (req.method === 'initialize') {
      send({
        id: req.id,
        result: {
          protocolVersion: req.params?.protocolVersion ?? '2025-06-18',
          capabilities: {},
          serverInfo: { name: 'coco-mini-apps-local', version: '0.0.0' },
        },
      });
    } else if (req.method === 'ping') {
      send({ id: req.id, result: {} });
    } else {
      send({ id: req.id, error: { code: -32601, message: 'Local mode is off (set COCO_MINIAPPS_LOCAL=1)' } });
    }
  });
  lines.on('close', () => process.exit(0));
}
