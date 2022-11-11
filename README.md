## Axelar Crosschain Dapp

This project demonstrates a basic crosschain interoperability using axelar network. Axelar delivers secure cross-chain communication. That means that Web3 developers can create dApps that can interact with any asset, any application, on any chain, with one click. You can think of it as Stripe for Web3.

**In this project we will be sending tokens from moonbeam chain to avalanche chain with a note/description. A user can send a token (say wETH) from one chain with a “payment information” to an account on another chain. The payment information can be an invoice/description of payment/reason and message to a friend, etc.**

#### Workflow

First, we will deploy smart contract on moonbeam and avalanche chains and then we will send a transaction to the smart contract(on moonbeam chain) with amount of tokens to send and with a note/description. The Axelar Gateway contract will then send the tokens the user on Avalanche chain and the note/description will be stored in a mapping of reciever's address with all the addtional tx related details. See contract for more details.

#### Steps:

> Rename `env.example` to `.env` and add your env specific keys.

Try running following tasks:

```shell
yarn install

yarn hardhat contracts:compile # compiles contracts

yarn contracts:deploy # deploys contracts

yarn hardhat contracts:execute # executes contract functionality

yarn hardhat help # shows help
```

#### Demo

1. Moonbeam Contract Address: [0xDe1EdD357001273Cd6415B225831bf636d0Ac710]: https://moonbase.moonscan.io/address/0xDe1EdD357001273Cd6415B225831bf636d0Ac710 (Sender)

2. Avalance Contract Address: [0xa6200236fe0Ddb1d49838165f2e066e48e815441]: https://testnet.snowtrace.io/address/0xa6200236fe0Ddb1d49838165f2e066e48e815441 (Receiver)

3. Axelar transactions: [0xc7203561EF179333005a9b81215092413aB86aE9]: https://testnet.axelarscan.io/address/0xc7203561EF179333005a9b81215092413aB86aE9

![Demo](https://github.com/Salmandabbakuti/axelar-crosschain-dapp/blob/main/screenshot.png)

```
$ node scripts/execute.js
Sending Payment of 2 aUSDC to 0xc7203561EF179333005a9b81215092413aB86aE9 from moonbeam to avalanche
Gas fee:  809711395556408015
aUSDC Allowance available to moonbeam bridge address: 2000000
Transaction submitted 0xbf8c675ce7b02e7134d371e63a928b11364e410d3606533da522544cb67cf538
User Payments:  [
  '0x57F1c63497AEe0bE305B8852b354CEc793da43bB',
  '0xc7203561EF179333005a9b81215092413aB86aE9',
  '0xc7203561EF179333005a9b81215092413aB86aE9',
  BigNumber { _hex: '0x01', _isBigNumber: true },
  'A Gift from fella Web3 Dev',
  token: '0x57F1c63497AEe0bE305B8852b354CEc793da43bB',
  sender: '0xc7203561EF179333005a9b81215092413aB86aE9',
  receiver: '0xc7203561EF179333005a9b81215092413aB86aE9',
  amount: BigNumber { _hex: '0x01', _isBigNumber: true },
  note: 'A Gift from fella Web3 Dev'
]
aUSDC Balance of 0xc7203561EF179333005a9b81215092413aB86aE9 on avalanche chain: 2000003
Execution completed
Done in 33.75s.
```

**As You can see in the above screenshot, we have sent 2 aUSDC from moonbeam to avalanche with a note/description `note: 'A Gift from fella Web3 Dev'`**.
