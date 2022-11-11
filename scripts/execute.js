
const { getDefaultProvider, Wallet, Contract } = require("ethers");
const { AxelarQueryAPI, Environment, EvmChain, GasToken } = require('@axelar-network/axelarjs-sdk');
require("dotenv").config();
const chains = require("../chains");

const wallet = new Wallet(process.env.PRIV_KEY);
const moonbeamChain = chains[0];
const avalancheChain = chains[1];

const CrossPaymentBridgeContractFactory = require("../artifacts/contracts/CrossPaymentBridge.sol/CrossPaymentBridge.json");
const IERC20 = require('../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol/IERC20.json');

const getGasFee = async (
  sourceChainName,
  destinationChainName,
  sourceChainTokenSymbol
) => {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const gasFee = await api.estimateGasFee(sourceChainName, destinationChainName, sourceChainTokenSymbol);
  return gasFee;
};

async function main() {
  const moonbeamProvider = getDefaultProvider(moonbeamChain.rpc);
  const moonbeamConnectedWallet = wallet.connect(moonbeamProvider);
  const avalancheProvider = getDefaultProvider(avalancheChain.rpc);
  const tokenSymbol = "aUSDC";
  const receiver = "0xc7203561EF179333005a9b81215092413aB86aE9";
  const amount = 2000000; // 2 aUSDC
  const note = "A Gift from fella Web3 Dev";

  const moonbeamCrossPaymentBridgeContract = new Contract(moonbeamChain.crossPaymentBridgeAddress, CrossPaymentBridgeContractFactory.abi, moonbeamConnectedWallet);
  const avalancheCrossPaymentBridgeContract = new Contract(avalancheChain.crossPaymentBridgeAddress, CrossPaymentBridgeContractFactory.abi, avalancheProvider);
  const moonbeamUSDCContract = new Contract(moonbeamChain.usdcContractAddress, IERC20.abi, moonbeamConnectedWallet);
  const avalancheUSDCContract = new Contract(avalancheChain.usdcContractAddress, IERC20.abi, avalancheProvider);

  console.log(`Sending Payment of ${amount / 1000000} ${tokenSymbol} to ${receiver} from moonbeam to avalanche`);
  const gasFee = await getGasFee(EvmChain.MOONBEAM, EvmChain.AVALANCHE, GasToken.MOONBEAM);
  console.log("Gas fee: ", gasFee);

  // approve usdc allowance to bridge on moonbeam
  const approveTx = await moonbeamUSDCContract.approve(moonbeamChain.crossPaymentBridgeAddress, amount);
  await approveTx.wait();

  // get allowances of bridge contract to spend usdc
  const allowance = await moonbeamUSDCContract.allowance(moonbeamConnectedWallet.address, moonbeamChain.crossPaymentBridgeAddress);
  console.log(`${tokenSymbol} Allowance available to moonbeam bridge address: ${allowance.toString()}`);

  const sendPaymentTx = await moonbeamCrossPaymentBridgeContract.sendTokensWithNote(
    "Avalanche",
    avalancheChain.crossPaymentBridgeAddress,
    tokenSymbol,
    amount,
    receiver,
    note,
    {
      value: BigInt(4e17),
      gasLimit: 3e6
    }
  );
  await sendPaymentTx.wait();

  console.log("Transaction submitted", sendPaymentTx.hash);

  // check reciever payments
  const userPayments = await avalancheCrossPaymentBridgeContract.payments(receiver, 0);
  console.log("User Payments: ", userPayments);

  // check user's aUSDC balance on avalanche
  const userBalance = await avalancheUSDCContract.balanceOf(receiver);
  console.log(`${tokenSymbol} Balance of ${receiver} on avalanche chain: ${userBalance.toString()}`);
}

main().then(() => {
  console.log("Execution completed");
  process.exit(0);
}).catch((error) => {
  console.log("error: ", error);
  process.exit(1);
});