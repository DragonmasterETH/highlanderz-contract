import {ethers} from "hardhat";
import {expect} from "chai";
import {TestContext} from "./types/testContext";
import {CommonHelpers} from "./helpers/common-helpers";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {SecurityUtils} from "./helpers/security-helpers";
import {it} from "mocha";
import _ from "lodash";

describe("HighlanderzGame - Edge Cases and Security", function () {
    let context: TestContext;
    let ownerSigner: HardhatEthersSigner;
    let userSigner: HardhatEthersSigner;
    let validSignature: string;
    let invalidUserSignature: string;
    let invalidGameNumberSignature: string;
    let incorrectGameNumber: number;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
        ownerSigner = context.users.owner;
        userSigner = context.users.user1;
        let actualCurrentGame = Number(await context.highlanderz.currentGameNumber());
        incorrectGameNumber = 5;
        invalidUserSignature = await SecurityUtils.signWinner(
            context.users.serverWallet,
            context.users.user7.address,
            actualCurrentGame,
            await context.highlanderz.getAddress()
        );
        invalidGameNumberSignature = await SecurityUtils.signWinner(
            context.users.serverWallet,
            userSigner.address,
            incorrectGameNumber,
            await context.highlanderz.getAddress()
        );
        validSignature = await SecurityUtils.signWinner(
            context.users.serverWallet,
            userSigner.address,
            actualCurrentGame,
            await context.highlanderz.getAddress()
        );
    });

    it("Add 100 heroes and complete game 0", async function () {
        const {highlanderz, users} = context;
        const heroPrice = ethers.parseEther("0.1");
        const heroCount = 100;
        const transaction = await highlanderz.connect(users.user1)
            .selectAndPayForHeroes(_.times(heroCount, n => n + 1), {value: heroPrice * BigInt(heroCount)});
        await transaction.wait();

        expect(await highlanderz.totalQueuedHeroes()).to.equal(0);
    });

    it("should revert setWinner with invalid signature", async function () {
        await expect(context.highlanderz.connect(ownerSigner).setWinner(userSigner.address, 0, invalidUserSignature))
            .to.be.revertedWith("Invalid signature");
    });

    it("should revert setWinner with incorrect game number", async function () {
        // Assuming validSignature represents a valid signature. Replace with actual valid signature in practice.
        await expect(context.highlanderz.connect(ownerSigner).setWinner(userSigner.address, incorrectGameNumber, validSignature))
            .to.be.revertedWith("Incorrect game number");
    });

    it("should revert selectAndPayForHeroes with zero heroes", async function () {
        await expect(context.highlanderz.connect(userSigner).selectAndPayForHeroes([], {value: ethers.parseEther("0")}))
            .to.be.revertedWith("Must select at least one hero");
    });

    it("should revert selectAndPayForHeroes with very large number of heroes", async function () {
        const largeNumberOfHeroes = Array(1000).fill(0);
        const largePaymentAmount = await context.highlanderz.pricePerHero() + BigInt(largeNumberOfHeroes.length);
        await expect(context.highlanderz.connect(userSigner).selectAndPayForHeroes(largeNumberOfHeroes, {value: largePaymentAmount}))
            .to.be.reverted; // Expect a revert but not specifying the exact reason as it could vary based on contract logic.
    });

    it("should revert setRewardPercentage with percentage over 100%", async function () {
        await expect(context.highlanderz.connect(ownerSigner).setRewardPercentage(10001))
            .to.be.revertedWith("Percentage cannot exceed 100%");
    });
});
