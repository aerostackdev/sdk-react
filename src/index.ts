export * from './context.js';
export * from './hooks/useAuth.js';
export * from './hooks/useDb.js';
export * from './hooks/useAI.js';
export * from './hooks/useCache.js';

// Re-export core types and client for convenience
import { SDK, SDKOptions } from '@aerostack/sdk-web';

export type { SDK };
export const AerocallClient = SDK;
export type AerocallClient = SDK;
export type AerocallConfig = SDKOptions;
