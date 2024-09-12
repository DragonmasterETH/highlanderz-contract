import {ethers} from "hardhat";
import {TestContext} from "../types/testContext";

export abstract class CommonHelpers {
    public static async deployDfkArenaAndGetContextFixture(): Promise<TestContext> {
        const [owner,
            user1,
            user2,
            user3,
            user4,
            user5,
            user6,
            user7,
            serverWallet,
        ] = await ethers.getSigners();
        const DfkArena = await ethers.getContractFactory("HighlanderzGame");
        const dfkArena = await DfkArena.deploy(
            ethers.parseEther('0.1'),
            100,
            serverWallet.address,
        );

        return {
            highlanderz: dfkArena,
            highlanderzAddress: await dfkArena.getAddress(),
            users: {
                owner,
                user1,
                user2,
                user3,
                user4,
                user5,
                user6,
                user7,
                serverWallet,
            }
        };
    }

}