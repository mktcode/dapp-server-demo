import { DappServer } from 'dapp-server';
import networks from './networks';

const server = new DappServer({
  debug: true,
  port: 3004,
  corsOrigin: /localhost:3000$/,
  networks,
  listeners: {
    "11155111": {
      "0x7aa397146011eB300123f14d2A35c7225b7e7f93": {
        abi: ['event Donated(address indexed from, uint256 amount, uint256 total)'],
        listeners: {
          "Donated": (context: DappServer) => async (from: string, _amount: bigint, total: bigint) => {
            context.db.hSet('donations', from, total.toString());
          }
        }
      }
    }
  },
  endpoints: {
    'GET /sponsors': (context: DappServer) => async (_req, res) => {
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
    },
    'POST /metadata': (context: DappServer) => async (req, res) => {
      const signerAddress = req.headers['eoa-signer'] as string;
      const signedMessage = req.headers['eoa-signed-message'] as string;
      const { logo, website } = req.body;
      const provider = context.getProvider('11155111');
      const ethers = context.getEthers();

      if (!signerAddress) {
        res.status(400).json({ error: 'eoa-signer is required' });
        return;
      }

      const sponsor = await context.db.hGet('donations', signerAddress);

      if (!sponsor) {
        res.status(400).json({ error: 'You are not a sponsor' });
        return;
      }

      if (BigInt(sponsor) < BigInt('100000000000000000')) {
        res.status(400).json({ error: 'You need to donate at least 0.1 ETH to add a logo' });
        return;
      }

      if (!logo && !website) {
        res.status(400).json({ error: 'logo or website required' });
        return;
      }

      const currentBlock = await provider.getBlockNumber();

      const allowedMessages = [
        `${currentBlock} ${logo} ${website}`,
        `${currentBlock - 1} ${logo} ${website}`,
      ];

      const hashedAllowedMessages = allowedMessages.map((message) => ethers.keccak256(ethers.toUtf8Bytes(message)));

      if (!hashedAllowedMessages.includes(signedMessage)) {
        res.status(400).json({ error: 'Invalid signed message' });
        return;
      }

      await context.db.hSet('metadata', signerAddress, JSON.stringify({ logo, website }));

      res.json({ success: true });
    }
  }
});

server.replay();