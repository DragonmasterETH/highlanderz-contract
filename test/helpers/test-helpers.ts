import {ethers, network} from "hardhat";
import {expect} from "chai";
import {ETH_CONFIG} from "../consts/eth-config";
import {BigIntMath} from "../utils/bigint-math";
import {Contract} from "ethers";

export abstract class TestHelpers {
    public static async getWethFromRichWallet(destinationWallet: string, wethAmount: number) {
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [ETH_CONFIG.MAINNET.RICH_ADDRESS],
        });
        const richSigner = await ethers.getSigner(ETH_CONFIG.MAINNET.RICH_ADDRESS);
        const amountOfWethToTransfer = ethers.parseEther(wethAmount.toString());
        const weth = await ethers.getContractAt("IERC20", ETH_CONFIG.MAINNET.WETH_ADDRESS);
        const tx = await (weth.connect(richSigner) as Contract).transfer(destinationWallet, amountOfWethToTransfer)
        await tx.wait()
    }

    public static expectEqualsWithinTolerance(a: bigint, b: bigint, tolerance: bigint): void {
        expect(BigIntMath.abs(a - b)).to.be.lte(tolerance, `${a} and ${b} are too different!`);
    }
}