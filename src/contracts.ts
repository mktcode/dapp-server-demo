import { registerContract } from "dapp-server"

registerContract(
  "0x7aa397146011eB300123f14d2A35c7225b7e7f93",
  [ 'event Donated(address indexed from, uint256 amount, uint256 total)' ]
)