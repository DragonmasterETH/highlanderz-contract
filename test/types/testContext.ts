import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {HighlanderzGame} from "../../typechain-types";
import {ContractTransactionResponse} from "ethers";

export interface TestContext {
    highlanderz: HighlanderzGame & { deploymentTransaction(): ContractTransactionResponse }
    highlanderzAddress: string;
    users: {
        owner: HardhatEthersSigner;
        user1: HardhatEthersSigner;
        user2: HardhatEthersSigner;
        user3: HardhatEthersSigner;
        user4: HardhatEthersSigner;
        user5: HardhatEthersSigner;
        user6: HardhatEthersSigner;
        user7: HardhatEthersSigner;
        serverWallet: HardhatEthersSigner;
    }
}