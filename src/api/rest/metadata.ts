import { registerEndpoint, getNetwork, ethers } from "dapp-server";

registerEndpoint('POST', '/metadata', context => async (req, res) => {
  const signerAddress = req.headers['eoa-signer'] as string;
  const signedMessage = req.headers['eoa-signed-message'] as string;
  const { logo, website } = req.body;
  const { provider } = getNetwork('11155111');

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
});