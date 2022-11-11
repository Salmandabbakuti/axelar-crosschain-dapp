//SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract CrossPaymentBridge is AxelarExecutable {
    IAxelarGasService public immutable gasReceiver;

    // struct to store the payment information

    struct Payment {
        address token;
        address sender;
        address receiver;
        uint256 amount;
        string note;
    }

    // mapping to store the payment information
    mapping(address => Payment[]) public payments;

    constructor(address gateway_, address gasReceiver_)
        AxelarExecutable(gateway_)
    {
        gasReceiver = IAxelarGasService(gasReceiver_);
    }

    function sendTokensWithNote(
        string memory destinationChain,
        string memory destinationAddress,
        string calldata tokenSymbol,
        uint256 amount,
        address receiver,
        string memory note
    ) external payable {
        address tokenAddress = gateway.tokenAddresses(tokenSymbol);
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        IERC20(tokenAddress).approve(address(gateway), amount);
        bytes memory payload = abi.encode(msg.sender, receiver, note);
        if (msg.value > 0) {
            gasReceiver.payNativeGasForContractCallWithToken{value: msg.value}(
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                tokenSymbol,
                amount,
                msg.sender
            );
        }
        gateway.callContractWithToken(
            destinationChain,
            destinationAddress,
            payload,
            tokenSymbol,
            amount
        );
    }

    function _executeWithToken(
        string calldata,
        string calldata,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
    ) internal override {
        (address sender, address receiver, string memory note) = abi.decode(
            payload,
            (address, address, string)
        );
        address tokenAddress = gateway.tokenAddresses(tokenSymbol);
        IERC20(tokenAddress).transfer(receiver, amount);
        payments[receiver].push(
            Payment(tokenAddress, sender, receiver, amount, note)
        );
    }
}
