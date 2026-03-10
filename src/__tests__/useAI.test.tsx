// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAI } from '../hooks/useAI';

const mockAiChat = vi.fn();

vi.mock('../context.js', () => ({
    useAerostack: () => ({
        baseUrl: 'https://api.test.com/v1',
        projectId: 'test-project',
        sdk: {
            ai: { aiChat: mockAiChat },
        },
    }),
}));

describe('useAI', () => {
    beforeEach(() => {
        mockAiChat.mockReset();
    });

    describe('initial state', () => {
        it('should start with loading=false and error=null', () => {
            const { result } = renderHook(() => useAI());
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should expose a chat function', () => {
            const { result } = renderHook(() => useAI());
            expect(typeof result.current.chat).toBe('function');
        });
    });

    describe('chat', () => {
        it('should call sdk.ai.aiChat with messages', async () => {
            mockAiChat.mockResolvedValueOnce({
                choices: [{ message: { content: 'Hello back!' } }],
            });

            const { result } = renderHook(() => useAI());

            let response: string | null = null;
            await act(async () => {
                response = await result.current.chat([
                    { role: 'user', content: 'Hello' },
                ]);
            });

            expect(mockAiChat).toHaveBeenCalledOnce();
            expect(mockAiChat).toHaveBeenCalledWith({
                messages: [{ role: 'user', content: 'Hello' }],
            });
            expect(response).toBe('Hello back!');
        });

        it('should pass options through to aiChat', async () => {
            mockAiChat.mockResolvedValueOnce({
                choices: [{ message: { content: 'Ok' } }],
            });

            const { result } = renderHook(() => useAI());

            await act(async () => {
                await result.current.chat(
                    [{ role: 'user', content: 'test' }],
                    { model: 'gpt-4', temperature: 0.5 }
                );
            });

            expect(mockAiChat).toHaveBeenCalledWith({
                messages: [{ role: 'user', content: 'test' }],
                model: 'gpt-4',
                temperature: 0.5,
            });
        });

        it('should return null when no choices', async () => {
            mockAiChat.mockResolvedValueOnce({});

            const { result } = renderHook(() => useAI());

            let response: string | null = null;
            await act(async () => {
                response = await result.current.chat([
                    { role: 'user', content: 'test' },
                ]);
            });

            expect(response).toBeNull();
        });

        it('should set loading during chat', async () => {
            let resolveChat: (v: any) => void;
            mockAiChat.mockReturnValueOnce(
                new Promise(r => { resolveChat = r; })
            );

            const { result } = renderHook(() => useAI());

            const chatPromise = act(async () => {
                const p = result.current.chat([{ role: 'user', content: 'test' }]);
                return p;
            });

            // After starting, loading resets when done
            resolveChat!({ choices: [{ message: { content: 'done' } }] });
            await chatPromise;
            expect(result.current.loading).toBe(false);
        });

        it('should set error on failure', async () => {
            mockAiChat.mockRejectedValueOnce(new Error('AI service down'));

            const { result } = renderHook(() => useAI());

            await act(async () => {
                try {
                    await result.current.chat([{ role: 'user', content: 'test' }]);
                } catch {
                    // Expected
                }
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error!.message).toBe('AI service down');
            expect(result.current.loading).toBe(false);
        });

        it('should wrap non-Error throws', async () => {
            mockAiChat.mockRejectedValueOnce('string error');

            const { result } = renderHook(() => useAI());

            await act(async () => {
                try {
                    await result.current.chat([{ role: 'user', content: 'test' }]);
                } catch {
                    // Expected
                }
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error!.message).toBe('AI chat failed');
        });

        it('should clear previous error on new chat', async () => {
            mockAiChat.mockRejectedValueOnce(new Error('fail'));

            const { result } = renderHook(() => useAI());

            await act(async () => {
                try { await result.current.chat([{ role: 'user', content: 'test' }]); } catch {}
            });

            expect(result.current.error).not.toBeNull();

            mockAiChat.mockResolvedValueOnce({
                choices: [{ message: { content: 'ok' } }],
            });

            await act(async () => {
                await result.current.chat([{ role: 'user', content: 'test' }]);
            });

            expect(result.current.error).toBeNull();
        });
    });
});
