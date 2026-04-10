/**
 * DLN Order Service
 *
 * Handles the full order creation flow:
 * 1. Get quote/estimation from the deswap API
 * 2. Build the on-chain order payload
 * 3. Submit the createOrder transaction to the DlnSource contract
 *
 * Contract: DlnSource (0xeF4fB24aD0916217251F553c0596F8Edc630EB66 on mainnet)
 * API: https://deswap.debridge.finance/v1.0/dln/order/create-tx
 */

import { ethers } from 'ethers';

// ─── Constants ─────────────────────────────────────────────────────

// DlnSource contract addresses per chain (deterministic CREATE2 deployment)
export const DLN_SOURCE_ADDRESSES: Record<number, string> = {
    // ── Mainnet ──
    1:        '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Ethereum
    10:       '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Optimism
    56:       '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // BNB Chain
    137:      '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Polygon
    42161:    '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Arbitrum One
    8453:     '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Base
    // ── Testnet ──
    11155111: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Sepolia
    11155420: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Optimism Sepolia
    421614:   '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Arbitrum Sepolia
    84532:    '0xeF4fB24aD0916217251F553c0596F8Edc630EB66', // Base Sepolia
};

// Native token placeholder (ETH on EVM chains)
export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';

// Deswap API base URL
export const DESWAP_API = 'https://deswap.debridge.finance';

// Minimal ABI for DlnSource.createOrder — only the function we call.
// The contract accepts the order struct + affiliate fees + referral + permit.
export const DLN_SOURCE_ABI = [
    'function createOrder((address _giveTokenAddress, uint256 _giveAmount, bytes _takeTokenAddress, uint256 _takeAmount, uint256 _takeChainId, bytes _receiverDst, bytes _givePatchAuthoritySrc, bytes _orderAuthorityAddressDst, bytes _allowedTakerDst, bytes _externalCall, bytes _allowedCancelBeneficiarySrc) _orderCreation, bytes _affiliateFee, uint32 _referralCode, bytes _permitEnvelope) payable returns (bytes32 orderId)',
    'function globalFixedNativeFee() view returns (uint256)',
    'function getOrderId((uint64 makerOrderNonce, bytes makerSrc, uint256 giveChainId, bytes giveTokenAddress, uint256 giveAmount, uint256 takeChainId, bytes takeTokenAddress, uint256 takeAmount, bytes receiverDst, bytes givePatchAuthoritySrc, bytes orderAuthorityAddressDst, bytes allowedTakerDst, bytes allowedCancelBeneficiarySrc, bytes externalCall) _order) view returns (bytes32)',
    'event CreatedOrder((uint64 makerOrderNonce, bytes makerSrc, uint256 giveChainId, bytes giveTokenAddress, uint256 giveAmount, uint256 takeChainId, bytes takeTokenAddress, uint256 takeAmount, bytes receiverDst, bytes givePatchAuthoritySrc, bytes orderAuthorityAddressDst, bytes allowedTakerDst, bytes allowedCancelBeneficiarySrc, bytes externalCall) order, bytes32 orderId, bytes affiliateFee, uint256 nativeFixFee, uint256 percentFee, uint32 referralCode, bytes metadata)',
];

// ─── Types ─────────────────────────────────────────────────────────

export interface CreateOrderQuoteParams {
    srcChainId: number;
    srcChainTokenIn: string;
    srcChainTokenInAmount: string;
    dstChainId: number;
    dstChainTokenOut: string;
    dstChainTokenOutAmount?: string;
    prependOperatingExpenses?: boolean;
    additionalTakerRewardBps?: number;
}

export interface CreateOrderQuoteResponse {
    estimation: {
        srcChainTokenIn: {
            chainId: number;
            address: string;
            amount: string;
            decimals: number;
            symbol: string;
        };
        dstChainTokenOut: {
            chainId: number;
            address: string;
            amount: string;
            recommendedAmount: string;
            decimals: number;
            symbol: string;
        };
    };
    tx: {
        allowanceTarget: string;
        data?: string;
        to?: string;
        value?: string;
    };
    fixFee: string;
    protocolFee: string;
    order: {
        approximateFulfillmentDelay: number;
    };
}

export interface OrderCreationResult {
    txHash: string;
    orderId: string;
    receipt: ethers.TransactionReceipt;
}

// ─── Service ───────────────────────────────────────────────────────

export class DlnOrderService {
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private chainId: number;

    constructor(wallet: ethers.Wallet, chainId: number) {
        this.wallet = wallet;
        this.chainId = chainId;
        const contractAddr = DLN_SOURCE_ADDRESSES[chainId];
        if (!contractAddr) {
            throw new Error(`No DlnSource address configured for chainId ${chainId}`);
        }
        this.contract = new ethers.Contract(contractAddr, DLN_SOURCE_ABI, wallet);
    }

    /**
     * Step 1: Get a quote from the deswap API.
     * This is the same call the deBridge frontend makes to
     * GET /v1.0/dln/order/create-tx
     */
    async getQuote(params: CreateOrderQuoteParams): Promise<CreateOrderQuoteResponse> {
        const url = new URL(`${DESWAP_API}/v1.0/dln/order/create-tx`);
        url.searchParams.set('srcChainId', String(params.srcChainId));
        url.searchParams.set('srcChainTokenIn', params.srcChainTokenIn);
        url.searchParams.set('srcChainTokenInAmount', params.srcChainTokenInAmount);
        url.searchParams.set('dstChainId', String(params.dstChainId));
        url.searchParams.set('dstChainTokenOut', params.dstChainTokenOut);
        url.searchParams.set('dstChainTokenOutAmount', params.dstChainTokenOutAmount || 'auto');
        url.searchParams.set('prependOperatingExpenses', String(params.prependOperatingExpenses ?? true));
        url.searchParams.set('additionalTakerRewardBps', String(params.additionalTakerRewardBps ?? 0));

        const response = await fetch(url.toString(), {
            headers: { accept: 'application/json' },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Quote API failed (${response.status}): ${text}`);
        }

        return await response.json() as CreateOrderQuoteResponse;
    }

    /**
     * Step 2: Read the on-chain fixed fee from the DlnSource contract.
     * This is the native fee (in wei) that must be sent with createOrder.
     */
    async getGlobalFixedFee(): Promise<bigint> {
        return await this.contract.globalFixedNativeFee();
    }

    /**
     * Step 3: Submit createOrder transaction on-chain.
     *
     * The DlnSource.createOrder function takes:
     *   - orderCreation struct (give/take token details)
     *   - affiliateFee (bytes, empty for no affiliate)
     *   - referralCode (uint32, 0 for none)
     *   - permitEnvelope (bytes, empty for native token / pre-approved)
     *
     * For native token (ETH) orders, msg.value = giveAmount + fixedFee.
     */
    async createOrder(opts: {
        giveTokenAddress: string;
        giveAmount: bigint;
        takeTokenAddress: string;
        takeAmount: bigint;
        takeChainId: number;
        receiverDst: string;
        fixedFee: bigint;
    }): Promise<OrderCreationResult> {
        const walletAddress = this.wallet.address;

        // Encode addresses as bytes for the struct
        const encodedReceiver = ethers.zeroPadValue(opts.receiverDst, 32);
        const encodedWallet = ethers.zeroPadValue(walletAddress, 32);
        const encodedTakeToken = ethers.zeroPadValue(opts.takeTokenAddress, 32);

        // Build the orderCreation tuple matching the contract struct
        const orderCreation = {
            _giveTokenAddress: opts.giveTokenAddress,
            _giveAmount: opts.giveAmount,
            _takeTokenAddress: encodedTakeToken,
            _takeAmount: opts.takeAmount,
            _takeChainId: opts.takeChainId,
            _receiverDst: encodedReceiver,
            _givePatchAuthoritySrc: encodedWallet,
            _orderAuthorityAddressDst: encodedReceiver,
            _allowedTakerDst: '0x',        // any taker
            _externalCall: '0x',           // no external call
            _allowedCancelBeneficiarySrc: '0x',
        };

        // For native ETH: msg.value = giveAmount + protocolFixedFee
        const isNativeToken = opts.giveTokenAddress === NATIVE_TOKEN;
        const msgValue = isNativeToken
            ? opts.giveAmount + opts.fixedFee
            : opts.fixedFee;

        console.log('[DlnOrderService] Submitting createOrder tx...');
        console.log(`  giveAmount: ${ethers.formatEther(opts.giveAmount)} ETH`);
        console.log(`  takeAmount: ${ethers.formatEther(opts.takeAmount)} ETH`);
        console.log(`  fixedFee:   ${ethers.formatEther(opts.fixedFee)} ETH`);
        console.log(`  msg.value:  ${ethers.formatEther(msgValue)} ETH`);

        const tx = await this.contract.createOrder(
            orderCreation,
            '0x',    // no affiliate fee
            0,       // no referral code
            '0x',    // no permit (native token doesn't need approval)
            { value: msgValue }
        );

        console.log(`[DlnOrderService] Tx submitted: ${tx.hash}`);
        console.log('[DlnOrderService] Waiting for confirmation...');

        const receipt = await tx.wait(1); // wait for 1 confirmation

        // Parse the CreatedOrder event to extract orderId
        let orderId = '';
        for (const log of receipt.logs) {
            try {
                const parsed = this.contract.interface.parseLog({
                    topics: log.topics as string[],
                    data: log.data,
                });
                if (parsed && parsed.name === 'CreatedOrder') {
                    orderId = parsed.args.orderId;
                    break;
                }
            } catch {
                // not our event, skip
            }
        }

        console.log(`[DlnOrderService] Order created! orderId: ${orderId}`);
        console.log(`[DlnOrderService] Block: ${receipt.blockNumber}, Gas: ${receipt.gasUsed}`);

        return {
            txHash: tx.hash,
            orderId,
            receipt,
        };
    }

    /**
     * Utility: retry wrapper for flaky RPC calls.
     */
    static async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries = 3,
        delayMs = 2000
    ): Promise<T> {
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (err) {
                lastError = err as Error;
                console.warn(`[Retry] Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, delayMs * attempt));
                }
            }
        }
        throw lastError!;
    }
}


