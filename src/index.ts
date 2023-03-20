import { createDappServer } from 'dapp-server';

if (!process.env.DB_ID) throw new Error('DB_ID is not set');
if (!process.env.REDIS_SOCKET_PATH) throw new Error('REDIS_SOCKET_PATH is not set');

createDappServer({
  debug: true,
  port: 3004,
  replayIndexer: true,
  redisConfig: {
    socket: {
      path: process.env.REDIS_SOCKET_PATH,
    },
    database: process.env.DB_ID,
  }
});