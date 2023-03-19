import { DappServer } from "dapp-server";

export default (context: DappServer) => ({
  sponsor: async ({ address }: { address: string }) => {
    const cached = await context.db.hGet("sponsors", address);
    
    if (!cached) return null;
    
    return JSON.parse(cached);
  },
  sponsors: async () => {
    const cached = await context.db.hGetAll("sponsors");
    
    if (!cached) return [];
    
    return Object.keys(cached).map((address) => JSON.parse(cached[address]!));
  },
});