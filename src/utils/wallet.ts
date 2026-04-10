/**
 * Wallet utility — creates an ethers.js Wallet from env vars.
 * Abstracts away provider + signer setup for use across tests.
 */

import { ethers } from 'ethers';

export interface WalletConfig {
    rpcUrl: string;
    privateKey: string;
    chainId: number;
}

/**
 * Reads PRIVATE_KEY and RPC_URL from environment, returns a connected Wallet.
 * Throws with a clear message when env vars are missing so CI fails loudly.
 */
export function getWalletConfig(): WalletConfig {
    const privateKey = process.env['PRIVATE_KEY'];
    const rpcUrl = process.env['RPC_URL'] || 'https://ethereum-sepolia-rpc.publicnode.com';
    const chainId = Number(process.env['SRC_CHAIN_ID'] || '11155111'); // Sepolia default

    if (!privateKey) {
        throw new Error(
            'PRIVATE_KEY env var is required. Export a testnet private key (never use mainnet!).'
        );
    }

    return { rpcUrl, privateKey, chainId };
}

/**
 * Creates an ethers Wallet connected to the configured RPC provider.
 */
export function createWallet(cfg: WalletConfig): ethers.Wallet {
    const provider = new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
    return new ethers.Wallet(cfg.privateKey, provider);
}

/**
 * Checks the native balance of the wallet.
 * Returns the balance in wei as bigint.
 */
export async function checkBalance(wallet: ethers.Wallet): Promise<bigint> {
    const balance = await wallet.provider!.getBalance(wallet.address);
    return balance;
}

/**
 * Formats wei to a human-readable ETH string.
 */
export function formatEth(wei: bigint): string {
    return ethers.formatEther(wei);
}

