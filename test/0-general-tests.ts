import {expect} from "chai";
import {ethers} from "hardhat";
import {CommonHelpers} from "./helpers/common-helpers";
import {before} from "mocha";
import {TestContext} from "./types/testContext";

describe("HighlanderzGame", function () {
    let context: TestContext;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
        console.log(
            `💳 WALLETS:\n` +
            `owner: ${context.users.owner.address}\n` +
            `user1: ${context.users.user1.address}\n` +
            `user2: ${context.users.user2.address}\n` +
            `user3: ${context.users.user3.address}`
        );
    });

    describe("Deployment and Initialization", function () {
        it("Should set the right owner", async function () {
            expect(await context.highlanderz.owner()).to.equal(context.users.owner.address);
        });

        it("Should set the initial hero price correctly", async function () {
            expect(await context.highlanderz.pricePerHero()).to.equal(ethers.parseEther('0.1'));
        });

        it("Should set the server address correctly", async function () {
            expect(await context.highlanderz.serverAddress()).to.equal(context.users.serverWallet.address);
        });
    });

    describe("Contract Setup", function () {
        it("Should allow the owner to change the server address", async function () {
            const newServerAddress = context.users.user1.address;
            await context.highlanderz.connect(context.users.owner).setServerAddress(newServerAddress);
            expect(await context.highlanderz.serverAddress()).to.equal(newServerAddress);
            await context.highlanderz.connect(context.users.owner).setServerAddress(context.users.serverWallet.address);
        });

        it("Should allow the owner to adjust the hero price", async function () {
            const newPrice = ethers.parseEther('0.2');
            await context.highlanderz.connect(context.users.owner).adjustPricePerHero(newPrice);
            expect(await context.highlanderz.pricePerHero()).to.equal(newPrice);
        });

        it("Should allow the owner to set the reward percentage", async function () {
            const newPercentage = 1050; // 10.5%
            await context.highlanderz.connect(context.users.owner).setRewardPercentage(newPercentage);
            expect(await context.highlanderz.rewardPercentage()).to.equal(newPercentage);
        });

        it("Should allow the owner to toggle the game state", async function () {
            await context.highlanderz.connect(context.users.owner).toggleGameState();
            expect(await context.highlanderz.isGamePaused()).to.equal(true);
        });

        it("Should allow the owner to transfer ownership", async function () {
            const newOwner = context.users.user2;
            await context.highlanderz.connect(context.users.owner).transferOwnership(newOwner.address);
            expect(await context.highlanderz.owner()).to.equal(newOwner.address);
            await context.highlanderz.connect(newOwner).transferOwnership(context.users.owner);
        });

        it("Should allow the owner to modify admin privileges", async function () {
            const adminAddress = context.users.user3.address;
            await context.highlanderz.connect(context.users.owner).modifyAdmin(adminAddress, true);
            expect(await context.highlanderz.isAdmin(adminAddress)).to.equal(true);
        });
    });
});
