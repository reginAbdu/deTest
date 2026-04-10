/**
 * Zod Schema Validators
 * Type-safe validation schemas for API requests and responses
 */

import { z } from 'zod';

// EncodedValue schema - handles various encoding formats
export const EncodedValueSchema = z.object({
  bytesValue: z.string().optional(),
  bytesArrayValue: z.union([z.string(), z.array(z.number())]).optional(),
  bigIntegerValue: z.union([z.number(), z.string()]).optional(),
  stringValue: z.string().optional(),
  Base64Value: z.string().optional(),
}).strict();

export type EncodedValue = z.infer<typeof EncodedValueSchema>;

// TokenMetadata schema
export const TokenMetadataSchema = z.object({
  decimals: z.number(),
  name: z.string(),
  symbol: z.string(),
  logoURI: z.string(),
}).strict();

export type TokenMetadata = z.infer<typeof TokenMetadataSchema>;

// OfferWithMetadata schema
export const OfferWithMetadataSchema = z.object({
  chainId: EncodedValueSchema,
  tokenAddress: EncodedValueSchema,
  amount: EncodedValueSchema,
  finalAmount: EncodedValueSchema,
  metadata: TokenMetadataSchema,
  decimals: z.number(),
  name: z.string(),
  symbol: z.string(),
  logoURI: z.string(),
}).strict();

export type OfferWithMetadata = z.infer<typeof OfferWithMetadataSchema>;

// AffiliateFee schema
export const AffiliateFeeSchema = z.object({
  beneficiarySrc: EncodedValueSchema,
  amount: EncodedValueSchema,
}).strict();

export type AffiliateFee = z.infer<typeof AffiliateFeeSchema>;

// PreswapData schema (optional)
export const PreswapDataSchema = z.object({
  chainId: EncodedValueSchema,
  inTokenAddress: EncodedValueSchema,
  inAmount: EncodedValueSchema,
  tokenInMetadata: TokenMetadataSchema,
  tokenInLogoURI: z.string(),
  outTokenAddress: EncodedValueSchema,
  outAmount: EncodedValueSchema,
  tokenOutMetadata: TokenMetadataSchema,
  tokenOutLogoURI: z.string(),
}).strict();

export type PreswapData = z.infer<typeof PreswapDataSchema>;

// OrderMetadata schema
export const OrderMetadataSchema = z.object({
  rawMetadataHex: z.string().optional(),
  version: z.number().optional(),
  creationProcessType: z.string().optional(),
  origin: z.string().optional(),
  additionalTakerIncentiveBps: z.number().optional(),
  operatingExpensesAmount: z.string().optional(),
  recommendedTakeAmount: z.string().optional(),
  metadata: z.string().optional(),
  promotionType: z.string().optional(),
  orderTradeType: z.string().optional(),
  partnerFeeBps: z.union([z.number(), z.null()]).optional(),
  srcProtocolChainId: z.union([z.number(), z.null()]).optional(),
  dstProtocolChainId: z.union([z.number(), z.null()]).optional(),
});

export type OrderMetadata = z.infer<typeof OrderMetadataSchema>;

// Order schema
export const OrderSchema = z.object({
  orderId: EncodedValueSchema,
  creationTimestamp: z.number(),
  giveOfferWithMetadata: OfferWithMetadataSchema,
  takeOfferWithMetadata: OfferWithMetadataSchema,
  state: z.string(),
  externalCallState: z.string(),
  finalPercentFee: EncodedValueSchema,
  fixFee: EncodedValueSchema,
  affiliateFee: AffiliateFeeSchema,
  unlockAuthorityDst: EncodedValueSchema,
  createEventTransactionHash: EncodedValueSchema,
  preswapData: PreswapDataSchema.optional().nullable(),
  orderMetadata: OrderMetadataSchema,
  tradeType: z.string(),
}).passthrough(); // Allow additional properties

export type Order = z.infer<typeof OrderSchema>;

// FilteredOrdersResponse schema
export const FilteredOrdersResponseSchema = z.object({
  orders: z.array(OrderSchema),
  totalCount: z.number(),
}).strict();

export type FilteredOrdersResponse = z.infer<typeof FilteredOrdersResponseSchema>;

// OrdersFilterRequest schema
export const OrdersFilterRequestSchema = z.object({
  giveChainIds: z.array(z.number()),
  takeChainIds: z.array(z.number()),
  skip: z.number().int().nonnegative(),
  take: z.number().int().positive(),
  filterMode: z.enum(['Mixed', 'Strict']),
  orderAuthorityInSourceChain: z.string().optional(),
}).passthrough(); // Allow additional properties for future expansion

export type OrdersFilterRequest = z.infer<typeof OrdersFilterRequestSchema>;

// ApiError schema
export const ApiErrorSchema = z.object({
  message: z.string(),
  statusCode: z.number(),
  details: z.record(z.any()).optional(),
}).strict();

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate and parse response
   */
  static validateResponse(data: unknown): FilteredOrdersResponse {
    return FilteredOrdersResponseSchema.parse(data);
  }

  /**
   * Validate and parse request
   */
  static validateRequest(data: unknown): OrdersFilterRequest {
    return OrdersFilterRequestSchema.parse(data);
  }

  /**
   * Safe validation with error handling
   */
  static safeValidateResponse(
    data: unknown
  ): { success: boolean; data?: FilteredOrdersResponse; error?: string } {
    try {
      const validated = FilteredOrdersResponseSchema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
        };
      }
      return { success: false, error: String(error) };
    }
  }

  /**
   * Validate individual order
   */
  static validateOrder(data: unknown): Order {
    return OrderSchema.parse(data);
  }
}

