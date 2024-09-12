import {expect} from "chai";
import {ethers} from "hardhat";
import {TestContext} from "./types/testContext";
import {CommonHelpers} from "./helpers/common-helpers";

describe("HighlanderzGame", function () {
    let context: TestContext;

    before(async function () {
        context = await CommonHelpers.deployDfkArenaAndGetContextFixture();
    });

    describe("Admin Actions", function () {
        it("Only owner should adjust price per hero", async function () {
            const newPrice = ethers.parseEther("0.2");
            await expect(
                context.highlanderz.connect(context.users.user1).adjustPricePerHero(newPrice)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(context.highlanderz.adjustPricePerHero(newPrice))
                .to.emit(context.highlanderz, "AdminActionTaken")
                .withArgs("PricePerHeroAdjusted", newPrice);
        });

        it("Only owner should toggle game state", async function () {
            await expect(
                context.highlanderz.connect(context.users.user1).toggleGameState()
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(context.highlanderz.toggleGameState())
                .to.emit(context.highlanderz, "AdminActionTaken")
                .withArgs("GameStateToggled", ethers.parseUnits("1", "wei"));
        });

        it("Only owner should transfer ownership", async function () {
            const encodedNewOwner = ethers.AbiCoder.defaultAbiCoder().encode(["address"], [context.users.user2.address]);
            await expect(
                context.highlanderz.connect(context.users.user1).transferOwnership(context.users.user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(context.highlanderz.transferOwnership(context.users.user2.address))
                .to.emit(context.highlanderz, "AdminActionTaken")
                .withArgs("OwnershipTransferred", encodedNewOwner);

            await context.highlanderz.connect(context.users.user2)
                .transferOwnership(context.users.owner.address);
        });

        it("Only owner should modify admin", async function () {
            const adminAddress = context.users.user3.address;
            const isAuthorized = true;

            await expect(
                context.highlanderz.connect(context.users.user1).modifyAdmin(adminAddress, isAuthorized)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            const encodedNewOwner = ethers.AbiCoder.defaultAbiCoder().encode(["address", "bool"], [adminAddress, isAuthorized]);
            await expect(context.highlanderz.modifyAdmin(adminAddress, isAuthorized))
                .to.emit(context.highlanderz, "AdminActionTaken")
                .withArgs("AdminModified", encodedNewOwner);
        });
    });
});
