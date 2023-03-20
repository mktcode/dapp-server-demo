# My dApp Server

## `src/index.ts`

Here you set the configuration for your dapp server. `createDappServer` will scan the other directories, register everthing it finds and start the server.

```ts
import { createDappServer } from 'dapp-server';

createDappServer({
  debug: true,
  port: 3004,
});
```

## `src/networks.ts`

Here you define the EVM networks your dapp server will connect to. You can add as many networks as you want.

```ts
import { registerNetwork } from 'dapp-server'

registerNetwork('5', process.env.PROVIDER_URL_GOERLI);
registerNetwork('11155111', process.env.PROVIDER_URL_SEPOLIA);
```

If you want the contracts (see `src/contracts.ts`) in a network to have write access, you can provide a wallet key.

```ts
import { registerNetwork } from 'dapp-server'

registerNetwork('11155111', process.env.PROVIDER_URL, process.env.WALLET_KEY);
```

## `src/contracts.ts`

Here you define the addresses and abis of the contracts your dapp server will use. You can add as many contracts as you want.

```ts
import { registerContract } from "dapp-server"

export const CONTRACT_ADDRESS = "0x7aa397146011eB300123f14d2A35c7225b7e7f93"
export const CONTRACT_ABI = [ 'event Donated(address indexed from, uint256 amount, uint256 total)' ]

registerContract(CONTRACT_ADDRESS, CONTRACT_ABI)
```

You can export the address and abi of the contracts you register, so you can use them elsewhere but that's up to you. You can import JSON files or fetch your ABIs from etherscan.

## `src/indexer/*.ts

Here you define contract event listeners that write to your storage. All files in this directory are auto-imported.

```ts
import { registerListener } from "dapp-server";

const NETWORK = "11155111"
const CONTRACT = "0x7aa397146011eB300123f14d2A35c7225b7e7f93"

registerListener(
  NETWORK,
  CONTRACT,
  'Donated',
  context => async (from: string, _amount: bigint, total: bigint) => {
    context.db.hSet('donations', from, total.toString());
  }
);
```

The listeners defined in `src/indexer/*.ts` files can be replayed when starting the server. This is useful when you want to reindex your storage.

```ts
import { createDappServer } from 'dapp-server';

createDappServer({
  // ...
  replayIndexer: true,
});
```

There are no restrictions in terms of what you can store in your database. If you want to have "replayability", make sure to store data accordingly, by using deterministic keys, like transaction hashes. You can also write to your database from API handlers (see `src/api/`), both Rest and GraphQL. As long as you keep replayable data and non-replayable data separate, there are no issues. If you allow additional writes to your indexed contract data, let's say, then you might loose replayability and only you are in charge of keeping your data intact.

## `src/oracle/*.ts`

Here you define contract event listeners that usually fetch data and reply with a transaction, updating a contract, sending funds and so on. All files in this directory are auto-imported.

```ts
// coming soon
```

While technically indexers and oracle listeners are the same, I find it useful to separate them for the reasons mentioned above. Oracle requests should obiosuly not be replayed. But they have the same access to the database.

## `src/api/rest/*.ts`

Here you define Rest API handlers. All files in this directory are auto-imported.

```ts
import { registerEndpoint } from "dapp-server";

registerEndpoint('GET', '/sponsors', context => async (_req, res) => {
  const donations = await context.db.hGetAll('donations');
  const metadata = await context.db.hGetAll('metadata');

  const sponsors = Object.keys(donations).map((address) => {
    return {
      address,
      amount: donations[address] || '0',
      metadata: typeof metadata[address] === 'string' ? JSON.parse(metadata[address]!) : { logo: null, website: null }
    }
  });

  sponsors.sort((a, b) => {
    const aAmount = BigInt(a.amount);
    const bAmount = BigInt(b.amount);
    
    if (aAmount > bAmount) return -1;
    if (aAmount < bAmount) return 1;
    return 0;
  });

  res.json(sponsors);
});
```

You can access your database and fetch, aggregate and server data as you please.

You can have `POST` endpoints as well. Again, be careful with that and don't unintentially mess with your indexed on-chain data.

```ts
registerEndpoint('POST', '/metadata', context => async (req, res) => {
  const { address, metadata } = req.body;

  context.db.hSet('metadata', address, JSON.stringify(metadata));

  res.json({ ok: true });
});
```

You can also allow access and do things based on a wallet signature. The express server looks for `eoa-signature` and `eoa-signed-message` headers. If they are present, the server will verify the signature and store the address in a `eoa-signer` header. You can then use that header in your handlers.

```ts
registerEndpoint('POST', '/metadata', context => async (req, res) => {
  const signerAddress = req.headers['eoa-signer'] as string;
  const signedMessage = req.headers['eoa-signed-message'] as string;
  
  if (!signerAddress) {
    res.status(400).json({ error: 'eoa-signer is required' });
    return;
  }

  // do whatever verification you need
  const expectedMessages = ethers.keccak256(ethers.toUtf8Bytes(req.body));
  if (expectedMessage !== signedMessage)) {
    res.status(400).json({ error: 'Invalid signed message' });
    return;
  }

  // ...

  res.json({ ok: true });
});
```

## `src/api/graphql/`

Here you define a `schema.ts` and a `resolvers.ts` file to define your GraphQL API.

```ts
// ...
```

## Helpers

The dapp-server package exports a few more helpers.

### `getNetwork`

Get a network by its chainId.

```ts
import { getNetwork } from 'dapp-server';

const { provider, wallet } = getNetwork('11155111');

// if you only have one network, you can omit the argument
const { provider, wallet } = getNetwork();
```

### `getContract`

Get a contract instance by its address and network. If you provided a wallet key for the network, you can send transactions to the contract.

```ts
import { getContract } from 'dapp-server';

const contract = getContract("0x7aa397146011eB300123f14d2A35c7225b7e7f93", "11155111")

// if you only have one network, you can omit the second argument
const contract = getContract("0x7aa397146011eB300123f14d2A35c7225b7e7f93")

// if you only have one contract, you can omit both
const contract = getContract()
```

### Ethers.js

The `ethers` package is also exported, so you can use it in your handlers.

```ts
import { ethers } from 'dapp-server';
```