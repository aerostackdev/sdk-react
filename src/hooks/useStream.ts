/**
 * useStream — Low-level SSE streaming hook.
 *
 * Streams any Server-Sent Events endpoint and accumulates the response
 * text token-by-token. Works with Aerostack's gateway and any OpenAI-
 * compatible streaming endpoint.
 *
 * ```tsx
 * const { text, tokens, isStreaming, error, start, abort } = useStream({
 *   url: 'https://api.aerostack.dev/api/gateway/my-api/v1/chat/completions',
 *   headers: { Authorization: 'Bearer ask_live_...' },
 *   body: { messages: [{ role: 'user', content: 'Hello' }], stream: true },
 * });
 *
 * // Trigger the stream on demand
 * <button onClick={start} disabled={isStreaming}>Ask</button>
 * <button onClick={abort} disabled={!isStreaming}>Stop</button>
 * <pre>{text}</pre>
 * ```
 */

import { useState, useCallback, useRef } from 'react';

export interface UseStreamOptions {
    /** Full URL of the SSE endpoint. */
    url: string;
    /** HTTP method (default: 'POST'). */
    method?: string;
    /** Additional request headers. */
    headers?: Record<string, string>;
    /** Request body (will be JSON-serialised). */
    body?: unknown;
    /**
     * If true, `start()` is called automatically when url/headers/body change.
     * Defaults to false — you call `start()` manually.
     */
    autoStart?: boolean;
    /** Custom SSE token extractor. Defaults to OpenAI-compatible delta. */
    extractDelta?: (frame: unknown) => string | null;
}

export interface UseStreamReturn {
    /** Accumulated response text so far. */
    text: string;
    /** Individual token deltas in order (useful for word-by-word animation). */
    tokens: string[];
    /** True while streaming is in progress. */
    isStreaming: boolean;
    /** Error message if the stream failed, otherwise null. */
    error: string | null;
    /** Estimated tokens consumed (based on character count; replaced by real count if available). */
    tokensUsed: number;
    /** Start the stream request. Resets text/tokens from the previous run. */
    start: () => Promise<void>;
    /** Abort the current in-flight stream. */
    abort: () => void;
    /** Reset text, tokens, and error back to initial state. */
    reset: () => void;
}

function defaultExtractDelta(frame: unknown): string | null {
    if (!frame || typeof frame !== 'object') return null;
    const f = frame as any;
    return f.choices?.[0]?.delta?.content ?? null;
}

export function useStream(options: UseStreamOptions): UseStreamReturn {
    const {
        url,
        method = 'POST',
        headers = {},
        body,
        extractDelta = defaultExtractDelta,
    } = options;

    const [text, setText] = useState('');
    const [tokens, setTokens] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokensUsed, setTokensUsed] = useState(0);
    const abortRef = useRef<AbortController | null>(null);

    const reset = useCallback(() => {
        setText('');
        setTokens([]);
        setError(null);
        setTokensUsed(0);
    }, []);

    const abort = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
    }, []);

    const start = useCallback(async () => {
        if (isStreaming) return;

        reset();
        setIsStreaming(true);

        abortRef.current = new AbortController();

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({})) as any;
                throw new Error(errJson.error || `HTTP ${res.status}`);
            }

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            let estimatedTokens = 0;
            let realTokens = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6).trim();
                    if (raw === '[DONE]') break;

                    try {
                        const frame = JSON.parse(raw);
                        const delta = extractDelta(frame);
                        if (delta) {
                            estimatedTokens += Math.ceil(delta.length / 4);
                            setText(prev => prev + delta);
                            setTokens(prev => [...prev, delta]);
                        }
                        // Prefer real usage when available
                        const usage = (frame as any).usage;
                        if (usage?.total_tokens) realTokens = usage.total_tokens;
                        else if (usage?.completion_tokens) realTokens = usage.completion_tokens;
                    } catch {
                        // Skip malformed SSE frames
                    }
                }
            }

            setTokensUsed(realTokens || estimatedTokens);
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message ?? 'Stream failed');
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, [url, method, headers, body, isStreaming, reset, extractDelta]);

    return { text, tokens, isStreaming, error, tokensUsed, start, abort, reset };
}
