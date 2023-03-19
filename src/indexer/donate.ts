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