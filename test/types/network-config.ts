// Define the ChainConfig interface
export interface ChainConfig {
    CHAIN_ID: number;
    RICH_ADDRESS: string
    WETH_ADDRESS: string
}

// Define the NetworkConfig interface
export interface NetworkConfig {
    TESTNET: ChainConfig;
    MAINNET: ChainConfig;
}