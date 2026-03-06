/**
 * useTokenBalance — Fetch remaining token balance for a gateway consumer.
 *
 * A focused, ergonomic wrapper around `useGatewayWallet` for the common
 * case where you only need to display the user's remaining token balance.
 *
 * ```tsx
 * const { balance, loading, error } = useTokenBalance('my-chatbot', {
 *   consumerKey: process.env.NEXT_PUBLIC_CONSUMER_KEY,
 * });
 *
 * // With user JWT
 * const { tokens } = useAuth();
 * const { balance } = useTokenBalance('my-chatbot', { token: tokens?.accessToken });
 * ```
 */

import { useGatewayWallet } from './useGateway.js';

export interface UseTokenBalanceOptions {
    /** Consumer key (ask_live_...). */
    consumerKey?: string;
    /** User JWT from useAuth().tokens?.accessToken. */
    token?: string;
}

export interface UseTokenBalanceReturn {
    /** Remaining token balance, or null if not yet loaded. */
    balance: number | null;
    /** Full wallet data: total_purchased, total_consumed, plan_type, hard_limit, soft_limit. */
    wallet: {
        balance: number;
        total_purchased: number;
        total_consumed: number;
        plan_type: string;
        hard_limit: number | null;
        soft_limit: number | null;
    } | null;
    loading: boolean;
    error: string | null;
    /** Manually re-fetch the balance. */
    refresh: () => Promise<void>;
}

export function useTokenBalance(
    apiSlug: string,
    opts?: UseTokenBalanceOptions,
): UseTokenBalanceReturn {
    const { data, loading, error, refresh } = useGatewayWallet(apiSlug, opts);
    return {
        balance: data?.balance ?? null,
        wallet: data,
        loading,
        error,
        refresh,
    };
}
