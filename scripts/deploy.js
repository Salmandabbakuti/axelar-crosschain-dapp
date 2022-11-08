
const { getDefaultProvider, Wallet } = require("ethers");
const { utils: { deployContract } } = require("@axelar-network/axelar-local-dev");
const fs = require("fs/promises");
require("dotenv").config();
const chains = require("../chains");

const wallet = new Wallet(process.env.PRIV_KEY);
const moonbeamChain = chains[0];
const avalancheChain = chains[1];

const MessageSenderContract = require("../artifacts/contracts/MessageSender.sol/MessageSender.json");
const MessageReceiverContract = require("../artifacts/contracts/MessageReceiver.sol/MessageReceiver.json");

async function main() {
  // deploy sender contract on moonbeam
  const moonbeamProvider = getDefaultProvider(moonbeamChain.rpc);
  const moonbeamConnectedWallet = wallet.connect(moonbeamProvider);
  const mmonbeamSenderContract = await deployContract(
    moonbeamConnectedWallet,
    MessageSenderContract,
    [moonbeamChain.gateway, moonbeamChain.gasReceiver]
  );

  await mmonbeamSenderContract.deployed();
  console.log("Sender contract deployed to moonbeam at: ", mmonbeamSenderContract.address);

  moonbeamChain.messageSender = mmonbeamSenderContract.address;

  const avalancheProvider = getDefaultProvider(avalancheChain.rpc);
  const avalancheConnectedWallet = wallet.connect(avalancheProvider);
  const avalancheContract = await deployContract(
    avalancheConnectedWallet,
    MessageReceiverContract,
    [avalancheChain.gateway, avalancheChain.gasReceiver]
  );

  await avalancheContract.deployed();
  console.log("Receiver contract deployed to avalanche at: ", avalancheContract.address);
  avalancheChain.messageReceiver = avalancheContract.address;

  // update chains
  const updatedChains = [moonbeamChain, avalancheChain];
  await fs.writeFile(
    "chains.json",
    JSON.stringify(updatedChains, null, 2)
  );
}

main()
  .then(() => {
    console.log("Contracts deployed successfully");
  })
  .catch((error) => {
    console.error(error);
  });
