# axelar-crosschain-dapp

This project demonstrates a basic crosschain interoperability using axelar network. Axelar delivers secure cross-chain communication. That means that Web3 developers can create dApps that can interact with any asset, any application, on any chain, with one click. You can think of it as Stripe for Web3.

> In this project we will be sending message to the smartcontract on avalanche chain from moonbeam chain.

1. Moonbeam Contract Address: [0x7d9daBF118482B47ea6D900f0221aB1ECDb19a7a]: https://moonbase.moonscan.io/address/0x7d9daBF118482B47ea6D900f0221aB1ECDb19a7a (Sender)

2. Avalance Contract Address: [0x83A0B81D42AC6d9AeD9b0ECa9D1bda398f3481e7]: https://testnet.snowtrace.io/address/0x83A0B81D42AC6d9AeD9b0ECa9D1bda398f3481e7 (Receiver)

3. Axelar transactions: [0xc7203561EF179333005a9b81215092413aB86aE9]: https://testnet.axelarscan.io/address/0xc7203561EF179333005a9b81215092413aB86aE9

![Demo](https://github.com/Salmandabbakuti/axelar-crosschain-dapp/blob/main/screenshot.png)

> Rename `env.example` to `.env` and add your env specific keys.

Try running some of the following tasks:

```shell
yarn install

yarn hardhat contracts:compile # compiles contracts

yarn contracts:deploy # deploys contracts

yarn hardhat contracts:execute # executes contract functionality

yarn hardhat help # shows help
```
