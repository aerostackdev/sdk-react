export * from './context.js';
export * from './hooks/useAuth.js';
export * from './hooks/useDb.js';
export * from './hooks/useAI.js';
export * from './hooks/useCache.js';
export * from './hooks/useSubscription.js';

// Re-export core types and client for convenience
import { SDK, SDKOptions } from '@aerostack/sdk-web';

export type { SDK };
export const AerostackClient = SDK;
export type AerostackClient = SDK;
export type AerostackConfig = SDKOptions;

/** @deprecated Use AerostackClient instead. */
export const AerocallClient = SDK;
/** @deprecated Use AerostackClient instead. */
export type AerocallClient = SDK;
/** @deprecated Use AerostackConfig instead. */
export type AerocallConfig = SDKOptions;
