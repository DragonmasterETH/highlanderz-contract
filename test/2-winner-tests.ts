import {ethers} from "hardhat";
import {expect} from "chai";
import {before, describe, it} from "mocha";
import {CommonHelpers} from "./helpers/common-helpers";
import {TestContext} from "./types/testContext";
import {SecurityUtils} from "./helpers/security-helpers";
import _ from "lodash";

describe("HighlanderzGame - Winner Management", function () {
    let context: TestContext;
    let firstGameNumber: number;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
        firstGameNumber = 0;
    });

    describe("Winner Management", async function () {
        it("Add 50 heroes to game 0", async function () {
            const {highlanderz, users} = context;
            const heroPrice = ethers.parseEther("0.1");
            const heroCount = 50;
            const transaction = await highlanderz.connect(users.user1)
                .selectAndPayForHeroes(_.times(heroCount, n => n + 1), {value: heroPrice * BigInt(heroCount)});
            await transaction.wait();

            expect(await highlanderz.totalQueuedHeroes()).to.equal(heroCount);
            for (let i = 0; i < heroCount; i++) {
                expect(await highlanderz.getQueuedHeroAt(i)).to.equal(users.user1.address);
            }
        });

        it("Add another 50 heroes and complete game 0", async function () {
            const {highlanderz, users} = context;
            const heroPrice = ethers.parseEther("0.1");
            const heroCount = 50;
            const transaction = await highlanderz.connect(users.user1)
                .selectAndPayForHeroes(_.times(heroCount, n => n + 1), {value: heroPrice * BigInt(heroCount)});
            await transaction.wait();

            expect(await highlanderz.totalQueuedHeroes()).to.equal(0);
        });

        const winnerSignature = await SecurityUtils.signWinner(
            context.users.serverWallet,
            context.users.user1.address,
            firstGameNumber,
            await context.highlanderz.getAddress()
        );

        it("Should set the last winner correctly", async function () {
            await context.highlanderz.setWinner(context.users.user1.address, firstGameNumber, winnerSignature);
            expect(await context.highlanderz.lastWinner()).to.equal(context.users.user1.address);
        });

        it("Should fail for incorrect game number", async function () {
            await expect(
                context.highlanderz.setWinner(context.users.user1.address, firstGameNumber + 1, winnerSignature)
            ).to.be.revertedWith("Incorrect game number");
        });

        it("Should fail for invalid signature", async function () {
            const invalidSignature = "0x...";
            await expect(
                context.highlanderz.setWinner(context.users.user1.address, firstGameNumber, invalidSignature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("Should emit WinnerDeclared event", async function () {
            await expect(
                context.highlanderz.setWinner(context.users.user1.address, firstGameNumber, winnerSignature)
            ).to.emit(context.highlanderz, "WinnerDeclared").withArgs(context.users.user1.address);
        });

        // This test will indirectly test `payoutWinner` as well
        it("Should transfer the correct reward amount", async function () {
            // Assume some initial server wallet balance and reward percentage
            const initialServerWalletBalance = ethers.parseEther("10");
            const rewardPercentage = 1025; // 10.25%
            const expectedReward = initialServerWalletBalance * BigInt(rewardPercentage) / BigInt(10000);

            // Set initial server wallet balance
            await context.highlanderz.connect(context.users.owner).topUpServerWallet({value: initialServerWalletBalance});

            // Capture the winner's initial balance
            const initialWinnerBalance = await ethers.provider.getBalance(context.users.user1.address);

            // Set winner and trigger payout
            await context.highlanderz.setWinner(context.users.user1.address, firstGameNumber, winnerSignature);

            // Check the winner's final balance
            const finalWinnerBalance = await ethers.provider.getBalance(context.users.user1.address);
            expect(finalWinnerBalance).to.equal(initialWinnerBalance + BigInt(expectedReward));
        });
    });
});
