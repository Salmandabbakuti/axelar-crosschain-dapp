
const { getDefaultProvider, Wallet } = require("ethers");
const { utils: { deployContract } } = require("@axelar-network/axelar-local-dev");
const fs = require("fs/promises");
require("dotenv").config();
const chains = require("../chains");

const wallet = new Wallet(process.env.PRIV_KEY);
const moonbeamChain = chains[0];
const avalancheChain = chains[1];

const CrossPaymentBridgeContractFactory = require("../artifacts/contracts/CrossPaymentBridge.sol/CrossPaymentBridge.json");

async function main() {
  // deploy sender contract on moonbeam
  const moonbeamProvider = getDefaultProvider(moonbeamChain.rpc);
  const moonbeamConnectedWallet = wallet.connect(moonbeamProvider);
  const moonbeamCrossPaymentBridgeContract = await deployContract(
    moonbeamConnectedWallet,
    CrossPaymentBridgeContractFactory,
    [moonbeamChain.gateway, moonbeamChain.gasReceiver]
  );

  await moonbeamCrossPaymentBridgeContract.deployed();
  console.log("Cross Payment Bridge contract deployed to moonbeam at: ", moonbeamCrossPaymentBridgeContract.address);

  moonbeamChain.crossPaymentBridgeAddress = moonbeamCrossPaymentBridgeContract.address;

  const avalancheProvider = getDefaultProvider(avalancheChain.rpc);
  const avalancheConnectedWallet = wallet.connect(avalancheProvider);
  const avalancheCrossPaymentBridgeContract = await deployContract(
    avalancheConnectedWallet,
    CrossPaymentBridgeContractFactory,
    [avalancheChain.gateway, avalancheChain.gasReceiver]
  );

  await avalancheCrossPaymentBridgeContract.deployed();
  console.log("Cross Payment Bridge contract deployed to avalanche at: ", avalancheCrossPaymentBridgeContract.address);
  avalancheChain.crossPaymentBridgeAddress = avalancheCrossPaymentBridgeContract.address;

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
