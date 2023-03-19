import { createDappServer } from 'dapp-server';

const dappServer = createDappServer({
  debug: true,
  port: 3004,
});

dappServer.replay();