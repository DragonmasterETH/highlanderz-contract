import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter"; // Gas usage reporting
import * as dotenv from "dotenv";
import _ from "lodash";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        hardhat: {
            forking: {
                url: "https://mainnet.infura.io/v3/437ffc86fbfb43df9e7918b20c9a8130",
                blockNumber: 18428380,
            },
            chainId: 31337, // default chainId for local Hardhat Network
            accounts: {
                mnemonic: "test test test test test test test test test test test junk", // Replace this with your preferred mnemonic or delete this line to use a random one each time
            },
            gas: "auto",
            gasPrice: "auto",
            gasMultiplier: 1,
            loggingEnabled: false,
            allowUnlimitedContractSize: false,
            initialBaseFeePerGas: 1e9,  // 1 gwei
        },
        testnet: {
            url: `https://goerli.infura.io/v3/437ffc86fbfb43df9e7918b20c9a8130`,
            accounts: _.compact([
                process.env.OWNER_PRIVATE_KEY,
                process.env.ACCOUNT1_PRIVATE_KEY,
                process.env.ACCOUNT2_PRIVATE_KEY,
                process.env.ACCOUNT3_PRIVATE_KEY,
                process.env.TAX_PRIVATE_KEY,
            ]),
            chainId: 5, // chainId for Goerli
            gas: "auto",
            gasPrice: "auto",
            gasMultiplier: 1.1,
        },
    },
    mocha: {
        timeout: 20000
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    gasReporter: {
        currency: "USD",
        gasPrice: 21,
        enabled: !!(process.env.REPORT_GAS)
    }
};

export default config;
