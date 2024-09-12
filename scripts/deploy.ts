import {ethers, run} from "hardhat";

async function main() {
    const [deployer, user1, user2, user3, tax] = await ethers.getSigners();

    console.log('deployer.address', deployer.address)
    console.log('user1.address', user1.address)
    console.log('user2.address', user2.address)
    console.log('user3.address', user3.address)

    // Deploy the HighlanderzGame.sol
    const feeData = await ethers.provider.getFeeData();
    const HighlanderzGameFactory = await ethers.getContractFactory("HighlanderzGame.sol");
    const highlanderz =
        await HighlanderzGameFactory.deploy(
            {
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            }
        );

    // Wait for deployment to be mined
    const deploymentTx = highlanderz.deploymentTransaction();
    if (!deploymentTx) {
        console.log('Deployment Tx not found!')
        return;
    }
    console.log('DeploymentTx:', deploymentTx.hash)
    const token = await highlanderz.waitForDeployment();

    console.log(`🎁 DFK Arena deployed to: ${await token.getAddress()}`);

    console.log('Waiting for 8 confirmations...');
    await deploymentTx.wait(8);


    // Verify the contract on Etherscan
    await run("verify:verify", {
        address: await token.getAddress(),
        constructorArguments: []
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
