# Verifying a `signMessage` signature on the server

Use this when the mini app logs the user in (or proves ownership) by asking for
`MiniApp.signMessage(...)` and checking it in an API route.

**`viem`'s `verifyMessage` alone always fails here.** `getAddress()` returns the
user's Biconomy v2 smart account, but the wallet signs with the account's owner
EOA (raw `personal_sign`), and the account does not validate that signature via
ERC-1271. The result is a 401 on every login ("No pudimos verificar tu firma").

Try, in order: the EOA itself, ERC-6492, ERC-1271 (raw and wrapped with the
ECDSA module), the module's on-chain owner and, when the account is not deployed
yet, the factory's counterfactual address. Copy this file into
`src/lib/verify-signature.ts` (needs `viem`):

```ts
import 'server-only';
import {
  createPublicClient, encodeAbiParameters, encodeFunctionData, fallback, http,
  isErc6492Signature, parseAbi, recoverMessageAddress, type Hex,
} from 'viem';
import { polygon } from 'viem/chains';

const ECDSA_MODULE = '0x0000001c5b32F37F5beA87BDD5374eB2aC54eA8e' as const;
const FACTORY = '0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5' as const;
const moduleAbi = parseAbi([
  'function getOwner(address smartAccount) view returns (address)',
  'function initForSmartAccount(address eoaOwner) returns (address)',
]);
const factoryAbi = parseAbi([
  'function getAddressForCounterFactualAccount(address moduleSetupContract, bytes moduleSetupData, uint256 index) view returns (address)',
]);

const client = createPublicClient({
  chain: polygon,
  transport: fallback(
    [
      http('https://polygon-bor-rpc.publicnode.com', { timeout: 6_000, retryCount: 0 }),
      http('https://polygon.drpc.org', { timeout: 6_000, retryCount: 0 }),
    ],
    { retryCount: 1 },
  ),
});

async function safeVerify(address: Hex, message: string, signature: Hex) {
  try {
    return await client.verifyMessage({ address, message, signature });
  } catch {
    return false;
  }
}

export async function verifyWalletSignature(address: Hex, message: string, signature: Hex): Promise<boolean> {
  const same = (a?: string | null) => !!a && a.toLowerCase() === address.toLowerCase();
  if (isErc6492Signature(signature)) return safeVerify(address, message, signature);
  let owner: Hex | undefined;
  try {
    owner = await recoverMessageAddress({ message, signature });
    if (same(owner)) return true;
  } catch {
    // Not a 65-byte ECDSA signature: only ERC-1271 could accept it.
  }
  const code = await client.getCode({ address });
  if (code && code !== '0x') {
    if (await safeVerify(address, message, signature)) return true;
    const wrapped = encodeAbiParameters([{ type: 'bytes' }, { type: 'address' }], [signature, ECDSA_MODULE]);
    if (await safeVerify(address, message, wrapped)) return true;
    if (owner) {
      const onChainOwner = await client
        .readContract({ address: ECDSA_MODULE, abi: moduleAbi, functionName: 'getOwner', args: [address] })
        .catch(() => undefined);
      if (onChainOwner && onChainOwner.toLowerCase() === owner.toLowerCase()) return true;
    }
  } else if (owner) {
    const setup = encodeFunctionData({ abi: moduleAbi, functionName: 'initForSmartAccount', args: [owner] });
    const predicted = await client
      .readContract({ address: FACTORY, abi: factoryAbi, functionName: 'getAddressForCounterFactualAccount', args: [ECDSA_MODULE, setup, 0n] })
      .catch(() => undefined);
    if (same(predicted)) return true;
  }
  return false;
}
```

In the route, rebuild the exact message the client signed (same text, same
address casing, same timestamp) and reject stale timestamps so a signature
can't be replayed:

```ts
const valid = await verifyWalletSignature(address, loginMessage(address, issuedAt), signature);
if (!valid) return Response.json({ error: 'BAD_SIGNATURE' }, { status: 401 });
```
