import {ethers} from "ethers";

export class SecurityUtils {
    public static async signWinner(
        serverWallet: ethers.Signer,
        winnerAddress: string,
        gameNumber: number,
        contractAddress: string
    ): Promise<string> {

        // Create the message hash
        const messageHash = ethers.solidityPackedKeccak256(
            ["address", "uint256", "address"],
            [winnerAddress, gameNumber, contractAddress]
        );

        // Sign the message hash with the server's private key
        return await serverWallet.signMessage(ethers.getBytes(messageHash));
    }
}
