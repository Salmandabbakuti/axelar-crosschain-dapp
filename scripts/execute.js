
const { getDefaultProvider, Wallet, Contract } = require("ethers");
const { AxelarQueryAPI, Environment, EvmChain, GasToken } = require('@axelar-network/axelarjs-sdk');
require("dotenv").config();
const chains = require("../chains");

const wallet = new Wallet(process.env.PRIV_KEY);
const moonbeamChain = chains[0];
const avalancheChain = chains[1];

const MessageSenderContract = require("../artifacts/contracts/MessageSender.sol/MessageSender.json");
const MessageReceiverContract = require("../artifacts/contracts/MessageReceiver.sol/MessageReceiver.json");

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
  const messageToSend = "Hello from Moonbeam";

  const senderContract = new Contract(moonbeamChain.messageSender, MessageSenderContract.abi, moonbeamConnectedWallet);
  const receiverContract = new Contract(avalancheChain.messageReceiver, MessageReceiverContract.abi, avalancheProvider);
  const message1 = await receiverContract.message();

  console.log("Message on avalanche before: ", message1);
  console.log("Sending message from moonbeam to avalanche");
  const gasFee = await getGasFee(EvmChain.MOONBEAM, EvmChain.AVALANCHE, GasToken.MOONBEAM);
  console.log("Gas fee: ", gasFee);
  const sendMessagTx = await senderContract.sendMessage(
    "Avalanche",
    avalancheChain.messageReceiver,
    messageToSend,
    {
      value: gasFee
    }
  );
  await sendMessagTx.wait();

  console.log("Transaction submitted", sendMessagTx.hash);

  await new Promise((reject, resolve) => {
    receiverContract.on("Executed", (from, value) => {
      console.log("Received an event on avalanche: ", from, value);
      if (value === messageToSend) receiverContract.removeAllListeners("Executed");
      resolve();
    });
  });

  const message2 = await receiverContract.message();
  console.log("Message on avalanche after transaction: ", message2);
}

main().then(() => {
  console.log("Execution completed");
  process.exit(0);
}).catch((error) => {
  console.log("error: ", error);
  process.exit(1);
});