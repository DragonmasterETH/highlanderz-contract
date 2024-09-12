import {expect} from "chai";
import {ethers} from "hardhat";
import {before, describe, it} from "mocha";
import {TestContext} from "./types/testContext";
import {CommonHelpers} from "./helpers/common-helpers";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("HighlanderzGame - Admin Tests", function () {
    let context: TestContext;
    let ownerSigner: HardhatEthersSigner;
    let nonOwnerSigner: HardhatEthersSigner;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
        ownerSigner = context.users.owner;
        nonOwnerSigner = context.users.user1;
    });

    describe("Access Control", function () {
        it("should allow only owner to setServerAddress", async function () {
            await expect(context.highlanderz.connect(ownerSigner).setServerAddress(nonOwnerSigner.address))
                .not.to.be.reverted;

            await expect(context.highlanderz.connect(nonOwnerSigner).setServerAddress(nonOwnerSigner.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should allow only owner to adjustPricePerHero", async function () {
            await expect(context.highlanderz.connect(ownerSigner).adjustPricePerHero(ethers.parseEther("0.2")))
                .not.to.be.reverted;

            await expect(context.highlanderz.connect(nonOwnerSigner).adjustPricePerHero(ethers.parseEther("0.2")))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should allow only owner to toggleGameState", async function () {
            await expect(context.highlanderz.connect(ownerSigner).toggleGameState())
                .not.to.be.reverted;

            await expect(context.highlanderz.connect(nonOwnerSigner).toggleGameState())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should allow only owner to modifyAdmin", async function () {
            await expect(context.highlanderz.connect(ownerSigner).modifyAdmin(nonOwnerSigner.address, true))
                .not.to.be.reverted;

            await expect(context.highlanderz.connect(nonOwnerSigner).modifyAdmin(nonOwnerSigner.address, false))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should allow only owner to setRewardPercentage", async function () {
            await expect(context.highlanderz.connect(ownerSigner).setRewardPercentage(5000)) // 50%
                .not.to.be.reverted;

            await expect(context.highlanderz.connect(nonOwnerSigner).setRewardPercentage(5000))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should allow only owner to topUpServerWallet", async function () {
            await expect(context.highlanderz.connect(ownerSigner).topUpServerWallet({value: ethers.parseEther("1")}))
                .not.to.be.reverted;

            await expect(context.highlanderz.connect(nonOwnerSigner).topUpServerWallet({value: ethers.parseEther("1")}))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
