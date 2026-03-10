// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStream } from '../hooks/useStream.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createSSEStream(frames: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const lines = frames.map(f => `data: ${f}\n\n`).join('') + 'data: [DONE]\n\n';
    return new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(lines));
            controller.close();
        },
    });
}

describe('useStream', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('initial state', () => {
        it('should start with empty text and not streaming', () => {
            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream', body: {} })
            );
            expect(result.current.text).toBe('');
            expect(result.current.tokens).toEqual([]);
            expect(result.current.isStreaming).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.tokensUsed).toBe(0);
        });

        it('should expose start, abort, reset functions', () => {
            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream' })
            );
            expect(typeof result.current.start).toBe('function');
            expect(typeof result.current.abort).toBe('function');
            expect(typeof result.current.reset).toBe('function');
        });
    });

    describe('start', () => {
        it('should call fetch with correct URL and headers', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: createSSEStream([
                    JSON.stringify({ choices: [{ delta: { content: 'Hi' } }] }),
                ]),
            });

            const { result } = renderHook(() =>
                useStream({
                    url: 'https://api.test.com/stream',
                    headers: { 'X-Custom': 'value' },
                    body: { messages: [] },
                })
            );

            await act(async () => {
                await result.current.start();
            });

            expect(mockFetch).toHaveBeenCalledOnce();
            const [url, opts] = mockFetch.mock.calls[0];
            expect(url).toBe('https://api.test.com/stream');
            expect(opts.method).toBe('POST');
            expect(opts.headers['Content-Type']).toBe('application/json');
            expect(opts.headers['X-Custom']).toBe('value');
        });

        it('should accumulate streamed text', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: createSSEStream([
                    JSON.stringify({ choices: [{ delta: { content: 'Hello' } }] }),
                    JSON.stringify({ choices: [{ delta: { content: ' World' } }] }),
                ]),
            });

            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream', body: {} })
            );

            await act(async () => {
                await result.current.start();
            });

            expect(result.current.text).toBe('Hello World');
            expect(result.current.tokens).toEqual(['Hello', ' World']);
            expect(result.current.isStreaming).toBe(false);
        });

        it('should handle HTTP error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Server error' }),
            });

            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream', body: {} })
            );

            await act(async () => {
                await result.current.start();
            });

            expect(result.current.error).toBe('Server error');
            expect(result.current.isStreaming).toBe(false);
        });

        it('should handle missing body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: null,
            });

            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream', body: {} })
            );

            await act(async () => {
                await result.current.start();
            });

            expect(result.current.error).toBe('No response body');
        });
    });

    describe('reset', () => {
        it('should clear text, tokens, and error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: createSSEStream([
                    JSON.stringify({ choices: [{ delta: { content: 'test' } }] }),
                ]),
            });

            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream', body: {} })
            );

            await act(async () => {
                await result.current.start();
            });

            expect(result.current.text).toBe('test');

            act(() => {
                result.current.reset();
            });

            expect(result.current.text).toBe('');
            expect(result.current.tokens).toEqual([]);
            expect(result.current.error).toBeNull();
            expect(result.current.tokensUsed).toBe(0);
        });
    });

    describe('usage tracking', () => {
        it('should use real token count from usage field when available', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                body: createSSEStream([
                    JSON.stringify({ choices: [{ delta: { content: 'Hi' } }] }),
                    JSON.stringify({ choices: [{ delta: { content: '!' } }], usage: { completion_tokens: 10 } }),
                ]),
            });

            const { result } = renderHook(() =>
                useStream({ url: 'https://api.test.com/stream', body: {} })
            );

            await act(async () => {
                await result.current.start();
            });

            expect(result.current.tokensUsed).toBe(10);
        });
    });
});
