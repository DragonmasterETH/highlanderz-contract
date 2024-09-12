import {expect} from "chai";
import {ethers} from "hardhat";
import {TestContext} from "./types/testContext";
import {CommonHelpers} from "./helpers/common-helpers";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("HighlanderzGame", function () {
    let context: TestContext;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
        owner = context.users.owner;
        user1 = context.users.user1;
    });

    describe("Server Wallet Management", function () {
        it("Should correctly increase server wallet balance when topped up by the owner", async function () {
            const initialBalance = await ethers.provider.getBalance(context.users.serverWallet.address);
            const replenishAmount = ethers.parseEther("1");

            // Owner replenishes the server wallet
            await context.highlanderz.connect(owner).topUpServerWallet({value: replenishAmount});
            const newBalance = await ethers.provider.getBalance(context.users.serverWallet.address);

            expect(newBalance).to.equal(initialBalance + replenishAmount);
        });

        it("Should revert when a non-owner tries to top up the server wallet", async function () {
            const replenishAmount = ethers.parseEther("1");

            await expect(context.highlanderz.connect(user1).topUpServerWallet({value: replenishAmount}))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
