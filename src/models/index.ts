/**
 * API Response Models
 * Type-safe response structures for API endpoints
 */

// Export all Zod schemas
export * from './schemas';

// Value wrapper for encoded data
export interface EncodedValue {
  bytesValue?: string;
  bytesArrayValue?: string | number[];
  bigIntegerValue?: number | string;
  stringValue?: string;
  Base64Value?: string;
}

// Token metadata
export interface TokenMetadata {
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
}

// Offer with metadata
export interface OfferWithMetadata {
  chainId: EncodedValue;
  tokenAddress: EncodedValue;
  amount: EncodedValue;
  finalAmount: EncodedValue;
  metadata: TokenMetadata;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
}

// Affiliate fee structure
export interface AffiliateFee {
  beneficiarySrc: EncodedValue;
  amount: EncodedValue;
}

// Preswap data
export interface PreswapData {
  chainId: EncodedValue;
  inTokenAddress: EncodedValue;
  inAmount: EncodedValue;
  tokenInMetadata: TokenMetadata;
  tokenInLogoURI: string;
  outTokenAddress: EncodedValue;
  outAmount: EncodedValue;
  tokenOutMetadata: TokenMetadata;
  tokenOutLogoURI: string;
}

// Order metadata
export interface OrderMetadata {
  rawMetadataHex?: string;
  version?: number;
  creationProcessType?: string;
  origin?: string;
  additionalTakerIncentiveBps?: number;
  operatingExpensesAmount?: string;
  recommendedTakeAmount?: string;
  metadata?: string;
  promotionType?: string;
  orderTradeType?: string;
  partnerFeeBps?: number | null;
  srcProtocolChainId?: number | null;
  dstProtocolChainId?: number | null;
}

// Order structure
export interface Order {
  orderId: EncodedValue;
  creationTimestamp: number;
  giveOfferWithMetadata: OfferWithMetadata;
  takeOfferWithMetadata: OfferWithMetadata;
  state: string;
  externalCallState: string;
  finalPercentFee: EncodedValue;
  fixFee: EncodedValue;
  affiliateFee: AffiliateFee;
  unlockAuthorityDst: EncodedValue;
  createEventTransactionHash: EncodedValue;
  preswapData?: PreswapData | null;
  orderMetadata: OrderMetadata;
  tradeType: string;
  [key: string]: any;
}

export interface FilteredOrdersResponse {
  orders: Order[];
  totalCount: number;
}

export interface OrdersFilterRequest {
  giveChainIds: number[];
  takeChainIds: number[];
  skip: number;
  take: number;
  filterMode: 'Mixed' | 'Strict';
  orderAuthorityInSourceChain?: string;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

