import { createDappServer } from 'dapp-server';

createDappServer({
  debug: true,
  port: 3004,
  replayIndexer: true,
});