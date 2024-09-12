import {expect} from "chai";
import {ethers} from "hardhat";
import {CommonHelpers} from "./helpers/common-helpers";
import {before, describe, it} from "mocha";
import {TestContext} from "./types/testContext";

describe("HighlanderzGame", function () {
    let context: TestContext;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
    });

    describe("Game Functionality", function () {
        it("Should allow users to select and pay for heroes", async function () {
            const {highlanderz, users} = context;
            const heroPrice = ethers.parseEther("0.1");
            const heroCount = 3;
            const transaction = await highlanderz.connect(users.user1).selectAndPayForHeroes([1, 2, 3], {value: heroPrice * BigInt(heroCount)});
            await transaction.wait();

            expect(await highlanderz.totalQueuedHeroes()).to.equal(heroCount);
            for (let i = 0; i < heroCount; i++) {
                expect(await highlanderz.getQueuedHeroAt(i)).to.equal(users.user1.address);
            }
        });

        it("Should fail to select heroes when game is paused", async function () {
            const {highlanderz, users} = context;
            const heroPrice = ethers.parseEther("0.1");
            await highlanderz.connect(users.owner).toggleGameState();

            await expect(
                highlanderz.connect(users.user2).selectAndPayForHeroes([1, 2, 3], {value: heroPrice * BigInt(3)})
            ).to.be.revertedWith("Game is currently paused");

            await highlanderz.connect(users.owner).toggleGameState(); // Revert game state for further tests
        });

        it("Should fail to select heroes with incorrect payment amount", async function () {
            const {highlanderz, users} = context;
            const incorrectPrice = ethers.parseEther("0.05"); // Incorrect payment

            await expect(
                highlanderz.connect(users.user3).selectAndPayForHeroes([1], {value: incorrectPrice})
            ).to.be.revertedWith("Incorrect payment amount");
        });

        it("Should retrieve the current game state correctly", async function () {
            const {highlanderz} = context;
            const [gameNumber, totalQueued, isPaused] = await highlanderz.getCurrentGameState();

            expect(gameNumber).to.equal(0); // Assuming no game has started yet
            expect(totalQueued).to.equal(3n);
            expect(isPaused).to.be.false;
        });
    });

    // ... Additional tests can be added here
});
