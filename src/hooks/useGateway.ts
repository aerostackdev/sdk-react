/**
 * useGateway — React hooks for Aerostack AI Gateway
 *
 * These hooks expose CONSUMER-SAFE operations only — everything accessible
 * with a consumer key (ask_live_) or user JWT. Developer admin operations
 * (create API, manage plans, consumer CRUD) are never exposed here.
 *
 * Auth options (pass one):
 *   consumerKey — "ask_live_..." key from your backend (consumer-key-only mode)
 *   token       — user JWT from useAuth().tokens?.accessToken (aerostack / byo-jwt modes)
 *
 * Usage:
 * ```tsx
 * // Full chat UI hook
 * const { messages, sendMessage, isStreaming, wallet } = useGatewayChat({
 *   apiSlug: 'my-chatbot',
 *   consumerKey: process.env.NEXT_PUBLIC_CONSUMER_KEY,
 *   welcomeMessage: 'Hi! How can I help?',
 * });
 *
 * // With Aerostack auth (user signs in via useAuth)
 * const { tokens } = useAuth();
 * const chat = useGatewayChat({
 *   apiSlug: 'my-chatbot',
 *   token: tokens?.accessToken,
 * });
 *
 * // Just the wallet balance
 * const { data: wallet } = useGatewayWallet('my-chatbot', { consumerKey: '...' });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAerostack } from '../context.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GatewayChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tokensUsed?: number;
    timestamp: number;
}

export interface GatewayWallet {
    balance: number;
    total_purchased: number;
    total_consumed: number;
    plan_type: string;
    hard_limit: number | null;
    soft_limit: number | null;
}

export interface GatewayUsage {
    total_tokens: number;
    total_requests: number;
    days: number;
}

/** Options shared by all gateway hooks */
interface GatewayAuthOpts {
    /** Consumer key (ask_live_...). Takes priority over `token`. */
    consumerKey?: string;
    /** User JWT from useAuth().tokens?.accessToken, or your own BYO JWT. */
    token?: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function deriveHost(baseUrl: string): string {
    return baseUrl.replace(/\/v1\/?$/, '');
}

function buildAuthHeader(consumerKey?: string, token?: string): string | null {
    if (consumerKey) return `Bearer ${consumerKey}`;
    if (token) return `Bearer ${token}`;
    return null;
}

async function gatewayFetch(
    url: string,
    options: RequestInit & { auth: string | null }
): Promise<Response> {
    const { auth, ...rest } = options;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(rest.headers as Record<string, string> ?? {}),
    };
    if (auth) headers['Authorization'] = auth;

    const res = await fetch(url, { ...rest, headers });
    return res;
}

// ─── useGatewayChat ───────────────────────────────────────────────────────────

export interface UseGatewayChatOptions extends GatewayAuthOpts {
    /** The gateway API slug (e.g. "my-chatbot"). */
    apiSlug: string;
    /** First message shown from the assistant before the user types. */
    welcomeMessage?: string;
}

export interface UseGatewayChatReturn {
    /** Full message history for this session. */
    messages: GatewayChatMessage[];
    /** Send a user message. Streams the assistant response token-by-token. */
    sendMessage: (content: string) => Promise<void>;
    /** True while the assistant is streaming a response. */
    isStreaming: boolean;
    /** Last error string, or null if clean. */
    error: string | null;
    /** Clear all messages and reset session token count. */
    clearMessages: () => void;
    /** Live wallet/quota data (auto-fetched, refreshed after each message). */
    wallet: GatewayWallet | null;
    /** Estimated tokens consumed in this browser session. */
    tokensUsedThisSession: number;
    /** Manually re-fetch the wallet balance. */
    refreshWallet: () => Promise<void>;
}

/**
 * Full-featured hook for building a custom chat UI on top of Aerostack's
 * AI gateway. Handles message history, streaming, and quota display.
 *
 * Renders however you like — just call sendMessage() and render messages[].
 */
export function useGatewayChat({
    apiSlug,
    consumerKey,
    token,
    welcomeMessage,
}: UseGatewayChatOptions): UseGatewayChatReturn {
    const { baseUrl } = useAerostack();
    const host = deriveHost(baseUrl);
    const authHeader = buildAuthHeader(consumerKey, token);

    const initialMessages = (): GatewayChatMessage[] =>
        welcomeMessage
            ? [{ id: 'welcome', role: 'assistant', content: welcomeMessage, timestamp: Date.now() }]
            : [];

    const [messages, setMessages] = useState<GatewayChatMessage[]>(initialMessages);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wallet, setWallet] = useState<GatewayWallet | null>(null);
    const [tokensUsedThisSession, setTokensUsedThisSession] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    // ── Wallet ──────────────────────────────────────────────────────────────

    const refreshWallet = useCallback(async () => {
        if (!authHeader) return;
        try {
            const res = await gatewayFetch(
                `${host}/api/gateway/me/wallet?api_slug=${encodeURIComponent(apiSlug)}`,
                { auth: authHeader }
            );
            if (res.ok) {
                const json = await res.json() as any;
                setWallet(json.wallet ?? json);
            }
        } catch {
            // Non-fatal: don't surface wallet fetch errors to the user
        }
    }, [host, apiSlug, authHeader]);

    useEffect(() => {
        if (authHeader) refreshWallet();
    }, [authHeader, refreshWallet]);

    // ── sendMessage ─────────────────────────────────────────────────────────

    const sendMessage = useCallback(async (content: string) => {
        const trimmed = content.trim();
        if (isStreaming || !trimmed) return;
        if (!authHeader) {
            setError('No auth provided. Pass consumerKey or token to useGatewayChat.');
            return;
        }

        // Append user message + empty assistant placeholder immediately
        const userMsg: GatewayChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
        };
        const assistantId = `assistant-${Date.now()}`;
        const assistantPlaceholder: GatewayChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg, assistantPlaceholder]);
        setIsStreaming(true);
        setError(null);

        // Build API message list (skip the welcome placeholder, include history)
        const apiMessages = [
            ...messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content: trimmed },
        ];

        abortRef.current = new AbortController();

        try {
            const res = await gatewayFetch(
                `${host}/api/gateway/${apiSlug}/v1/chat/completions`,
                {
                    method: 'POST',
                    auth: authHeader,
                    body: JSON.stringify({
                        messages: apiMessages,
                        stream: true,
                        stream_options: { include_usage: true },
                    }),
                    signal: abortRef.current.signal,
                }
            );

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({})) as any;
                throw new Error(errJson.error || `Gateway error: ${res.status}`);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No response body from gateway');

            const decoder = new TextDecoder();
            let buf = '';
            let estimatedTokens = 0;
            let realTokens: number | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6).trim();
                    if (raw === '[DONE]') continue;

                    try {
                        const frame = JSON.parse(raw);
                        const delta = frame.choices?.[0]?.delta?.content ?? '';

                        if (delta) {
                            estimatedTokens += Math.ceil(delta.length / 4);
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === assistantId
                                        ? { ...m, content: m.content + delta }
                                        : m
                                )
                            );
                        }

                        // Prefer real usage from final frame (requires stream_options.include_usage)
                        if (frame.usage?.completion_tokens) {
                            realTokens = frame.usage.completion_tokens;
                        }
                    } catch {
                        // Skip malformed SSE frames
                    }
                }
            }

            const finalTokens = realTokens ?? estimatedTokens;
            setTokensUsedThisSession(prev => prev + finalTokens);
            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantId ? { ...m, tokensUsed: finalTokens } : m
                )
            );

            // Refresh wallet after each message so quota stays accurate
            refreshWallet();

        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message ?? 'Chat request failed');
            // Remove empty placeholder on error so UI stays clean
            setMessages(prev => prev.filter(m => m.id !== assistantId));
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, [messages, isStreaming, host, apiSlug, authHeader, refreshWallet]);

    // ── clearMessages ────────────────────────────────────────────────────────

    const clearMessages = useCallback(() => {
        setMessages(initialMessages());
        setTokensUsedThisSession(0);
        setError(null);
    }, [welcomeMessage]);

    return {
        messages,
        sendMessage,
        isStreaming,
        error,
        clearMessages,
        wallet,
        tokensUsedThisSession,
        refreshWallet,
    };
}

// ─── useGatewayWallet ─────────────────────────────────────────────────────────

/**
 * Low-level hook for just the wallet/quota — useful when your chat UI
 * is separate from where you show the quota indicator.
 *
 * ```tsx
 * const { data, loading } = useGatewayWallet('my-api', { consumerKey: '...' });
 * // data.balance, data.plan_type, data.hard_limit
 * ```
 */
export function useGatewayWallet(
    apiSlug: string,
    opts?: GatewayAuthOpts
): { data: GatewayWallet | null; loading: boolean; error: string | null; refresh: () => Promise<void> } {
    const { baseUrl } = useAerostack();
    const host = deriveHost(baseUrl);
    const authHeader = buildAuthHeader(opts?.consumerKey, opts?.token);

    const [data, setData] = useState<GatewayWallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!authHeader) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await gatewayFetch(
                `${host}/api/gateway/me/wallet?api_slug=${encodeURIComponent(apiSlug)}`,
                { auth: authHeader }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json() as any;
            setData(json.wallet ?? json);
        } catch (e: any) {
            setError(e.message ?? 'Failed to fetch wallet');
        } finally {
            setLoading(false);
        }
    }, [host, apiSlug, authHeader]);

    useEffect(() => { refresh(); }, [refresh]);

    return { data, loading, error, refresh };
}

// ─── useGatewayUsage ──────────────────────────────────────────────────────────

/**
 * Low-level hook for consumer usage stats — build custom analytics displays,
 * progress bars, usage history, etc.
 *
 * ```tsx
 * const { data } = useGatewayUsage('my-api', { consumerKey: '...', days: 7 });
 * // data.total_tokens, data.total_requests, data.days
 * ```
 */
export function useGatewayUsage(
    apiSlug: string,
    opts?: GatewayAuthOpts & { days?: number }
): { data: GatewayUsage | null; loading: boolean; error: string | null; refresh: () => Promise<void> } {
    const { baseUrl } = useAerostack();
    const host = deriveHost(baseUrl);
    const authHeader = buildAuthHeader(opts?.consumerKey, opts?.token);
    const days = opts?.days ?? 30;

    const [data, setData] = useState<GatewayUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!authHeader) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                api_slug: apiSlug,
                days: String(days),
            });
            const res = await gatewayFetch(
                `${host}/api/gateway/me/usage?${params}`,
                { auth: authHeader }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setData(await res.json() as GatewayUsage);
        } catch (e: any) {
            setError(e.message ?? 'Failed to fetch usage');
        } finally {
            setLoading(false);
        }
    }, [host, apiSlug, authHeader, days]);

    useEffect(() => { refresh(); }, [refresh]);

    return { data, loading, error, refresh };
}
