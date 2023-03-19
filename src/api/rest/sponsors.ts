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