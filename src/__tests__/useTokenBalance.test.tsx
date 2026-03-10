// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('../context.js', () => ({
    useAerostack: () => ({
        baseUrl: 'https://api.test.com/v1',
        projectId: 'test-project',
        sdk: {},
    }),
}));

const { useTokenBalance } = await import('../hooks/useTokenBalance');

describe('useTokenBalance', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should start with balance=null and loading=true', () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wallet: { balance: 100, total_purchased: 200, total_consumed: 100, plan_type: 'pro', hard_limit: null, soft_limit: null } }),
        });

        const { result } = renderHook(() =>
            useTokenBalance('my-api', { consumerKey: 'ask_live_123' })
        );

        expect(result.current.balance).toBeNull();
        expect(result.current.loading).toBe(true);
    });

    it('should fetch and expose balance', async () => {
        const walletData = {
            balance: 750,
            total_purchased: 1000,
            total_consumed: 250,
            plan_type: 'starter',
            hard_limit: 2000,
            soft_limit: 1500,
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wallet: walletData }),
        });

        const { result } = renderHook(() =>
            useTokenBalance('my-api', { consumerKey: 'ask_live_123' })
        );

        await act(async () => {});

        expect(result.current.balance).toBe(750);
        expect(result.current.wallet).toEqual(walletData);
        expect(result.current.loading).toBe(false);
    });

    it('should set error on failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const { result } = renderHook(() =>
            useTokenBalance('my-api', { consumerKey: 'ask_live_bad' })
        );

        await act(async () => {});

        expect(result.current.error).toBeTruthy();
        expect(result.current.balance).toBeNull();
    });

    it('should expose refresh function', () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wallet: { balance: 0 } }),
        });

        const { result } = renderHook(() =>
            useTokenBalance('my-api', { consumerKey: 'ask_live_123' })
        );

        expect(typeof result.current.refresh).toBe('function');
    });

    it('should support token auth', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wallet: { balance: 500, total_purchased: 500, total_consumed: 0, plan_type: 'free', hard_limit: null, soft_limit: null } }),
        });

        renderHook(() =>
            useTokenBalance('my-api', { token: 'jwt-123' })
        );

        await act(async () => {});

        const [, opts] = mockFetch.mock.calls[0];
        expect(opts.headers['Authorization']).toBe('Bearer jwt-123');
    });
});
