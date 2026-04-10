/**
 * EIP-712 signature utility for DLN (deBridge Liquidity Network) orders.
 *
 * DLN orders are signed off-chain using EIP-712 typed structured data.
 * The domain, types, and message structure below match the DlnSource contract.
 *
 * Reference: https://eips.ethereum.org/EIPS/eip-712
 */

import { ethers } from 'ethers';

// ─── EIP-712 Domain ────────────────────────────────────────────────
export interface DlnDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

export function buildDlnDomain(chainId: number, dlnSourceAddress: string): DlnDomain {
    return {
        name: 'DlnSource',
        version: '1',
        chainId,
        verifyingContract: dlnSourceAddress,
    };
}

// ─── EIP-712 Types ─────────────────────────────────────────────────
export const DLN_ORDER_TYPES = {
    Order: [
        { name: 'makerOrderNonce', type: 'uint64' },
        { name: 'makerSrc', type: 'bytes' },
        { name: 'giveChainId', type: 'uint256' },
        { name: 'giveTokenAddress', type: 'bytes' },
        { name: 'giveAmount', type: 'uint256' },
        { name: 'takeChainId', type: 'uint256' },
        { name: 'takeTokenAddress', type: 'bytes' },
        { name: 'takeAmount', type: 'uint256' },
        { name: 'receiverDst', type: 'bytes' },
        { name: 'givePatchAuthoritySrc', type: 'bytes' },
        { name: 'orderAuthorityAddressDst', type: 'bytes' },
        { name: 'allowedTakerDst', type: 'bytes' },
        { name: 'allowedCancelBeneficiarySrc', type: 'bytes' },
        { name: 'externalCall', type: 'bytes' },
    ],
};

// ─── Order Message ─────────────────────────────────────────────────
export interface DlnOrderMessage {
    makerOrderNonce: number | bigint;
    makerSrc: string;
    giveChainId: number | bigint;
    giveTokenAddress: string;
    giveAmount: bigint;
    takeChainId: number | bigint;
    takeTokenAddress: string;
    takeAmount: bigint;
    receiverDst: string;
    givePatchAuthoritySrc: string;
    orderAuthorityAddressDst: string;
    allowedTakerDst: string;
    allowedCancelBeneficiarySrc: string;
    externalCall: string;
}

/**
 * Signs a DLN order using EIP-712 typed data.
 * This is the programmatic equivalent of MetaMask's eth_signTypedData_v4.
 */
export async function signDlnOrder(
    wallet: ethers.Wallet,
    domain: DlnDomain,
    message: DlnOrderMessage
): Promise<string> {
    const signature = await wallet.signTypedData(
        domain,
        DLN_ORDER_TYPES,
        message
    );
    return signature;
}

/**
 * Encodes an EVM address into the 32-byte padded format expected by DLN.
 * DLN uses bytes (not address) to support non-EVM chains.
 */
export function encodeEvmAddress(address: string): string {
    return ethers.zeroPadValue(address, 32);
}

/**
 * Generates a unique nonce for order creation.
 */
export function generateOrderNonce(): bigint {
    return BigInt(Date.now()) * 1000n + BigInt(Math.floor(Math.random() * 1000));
}

