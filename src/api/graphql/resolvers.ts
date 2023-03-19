import { DappServer } from "dapp-server";

export default (context: DappServer) => ({
  sponsor: async ({ address }: { address: string }) => {
    const donation = await context.db.hGet('donations', address);
    const metadata = await context.db.hGet('metadata', address);

    if (!donation) return null;

    return {
      address,
      amount: donation || '0',
      metadata: typeof metadata === 'string' ? JSON.parse(metadata!) : { logo: null, website: null }
    }
  },
  sponsors: async () => {
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

    return sponsors;
  },
});