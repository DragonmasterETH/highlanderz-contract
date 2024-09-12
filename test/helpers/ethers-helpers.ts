import {ethers} from "ethers";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

export abstract class EthersHelpers {
    public static async getNativeBalanceAsBigNumber(
        signer: HardhatEthersSigner,
        address: string,
    ): Promise<bigint> {
        return signer.provider.getBalance(address);
    }

    public static fromReadableAmount(
        amount: number,
        decimals: number
    ): bigint {
        return ethers.parseUnits(amount.toFixed(10), decimals)
    }

    public static toReadableAmount(rawAmount: number, decimals: number): string {
        const maxDecimals = 4;
        return ethers.formatUnits(rawAmount, decimals).slice(0, maxDecimals)
    }
}