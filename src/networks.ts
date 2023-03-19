import { registerNetwork } from 'dapp-server'

if (!process.env.PROVIDER_URL) throw new Error('PROVIDER_URL is not set');
if (!process.env.WALLET_KEY) throw new Error('WALLET_KEY is not set');

registerNetwork('11155111', process.env.PROVIDER_URL, process.env.WALLET_KEY);