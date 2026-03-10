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

// Import after mocks
const { useGatewayChat, useGatewayWallet, useGatewayUsage } = await import('../hooks/useGateway');

function mockFetchResponse(data: any, ok = true, status = 200) {
    mockFetch.mockResolvedValueOnce({
        ok,
        status,
        json: async () => data,
        body: null,
    });
}

describe('useGatewayWallet', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should start with loading=true when auth is provided', () => {
        mockFetchResponse({ balance: 100, total_purchased: 200, total_consumed: 100, plan_type: 'pro', hard_limit: null, soft_limit: null });

        const { result } = renderHook(() =>
            useGatewayWallet('my-api', { consumerKey: 'ask_live_123' })
        );

        expect(result.current.loading).toBe(true);
    });

    it('should set loading=false when no auth provided', async () => {
        const { result } = renderHook(() => useGatewayWallet('my-api'));

        // Wait for effect
        await act(async () => {});

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
    });

    it('should fetch wallet data with consumer key', async () => {
        const walletData = {
            balance: 500, total_purchased: 1000, total_consumed: 500,
            plan_type: 'starter', hard_limit: null, soft_limit: null,
        };
        mockFetchResponse({ wallet: walletData });

        const { result } = renderHook(() =>
            useGatewayWallet('my-api', { consumerKey: 'ask_live_123' })
        );

        await act(async () => {});

        // Check fetch was called
        expect(mockFetch).toHaveBeenCalled();
        const [url, opts] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/gateway/me/wallet');
        expect(url).toContain('api_slug=my-api');
        expect(opts.headers['Authorization']).toBe('Bearer ask_live_123');
    });

    it('should set error on HTTP failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' }),
        });

        const { result } = renderHook(() =>
            useGatewayWallet('my-api', { consumerKey: 'ask_live_bad' })
        );

        await act(async () => {});

        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
    });
});

describe('useGatewayUsage', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should fetch usage with correct params', async () => {
        mockFetchResponse({ total_tokens: 5000, total_requests: 100, days: 7 });

        const { result } = renderHook(() =>
            useGatewayUsage('my-api', { consumerKey: 'ask_live_123', days: 7 })
        );

        await act(async () => {});

        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain('/api/gateway/me/usage');
        expect(url).toContain('api_slug=my-api');
        expect(url).toContain('days=7');
    });

    it('should default to 30 days', async () => {
        mockFetchResponse({ total_tokens: 0, total_requests: 0, days: 30 });

        renderHook(() =>
            useGatewayUsage('my-api', { consumerKey: 'ask_live_123' })
        );

        await act(async () => {});

        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain('days=30');
    });
});

describe('useGatewayChat', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should initialize with empty messages', () => {
        const { result } = renderHook(() =>
            useGatewayChat({ apiSlug: 'my-api', consumerKey: 'ask_live_123' })
        );

        // May have wallet fetch + welcome message or empty
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.tokensUsedThisSession).toBe(0);
    });

    it('should include welcome message when provided', () => {
        // Mock wallet fetch
        mockFetchResponse({ balance: 100 });

        const { result } = renderHook(() =>
            useGatewayChat({
                apiSlug: 'my-api',
                consumerKey: 'ask_live_123',
                welcomeMessage: 'Welcome!',
            })
        );

        expect(result.current.messages.length).toBeGreaterThanOrEqual(1);
        const welcome = result.current.messages.find(m => m.id === 'welcome');
        expect(welcome?.content).toBe('Welcome!');
        expect(welcome?.role).toBe('assistant');
    });

    it('should set error when no auth provided', async () => {
        const { result } = renderHook(() =>
            useGatewayChat({ apiSlug: 'my-api' })
        );

        await act(async () => {
            await result.current.sendMessage('Hello');
        });

        expect(result.current.error).toContain('No auth provided');
    });

    it('should clear messages and token count', () => {
        // Mock wallet fetch
        mockFetchResponse({ balance: 100 });

        const { result } = renderHook(() =>
            useGatewayChat({
                apiSlug: 'my-api',
                consumerKey: 'ask_live_123',
                welcomeMessage: 'Hi!',
            })
        );

        act(() => {
            result.current.clearMessages();
        });

        // Should still have welcome message after clear
        const welcome = result.current.messages.find(m => m.id === 'welcome');
        expect(welcome).toBeTruthy();
        expect(result.current.tokensUsedThisSession).toBe(0);
    });

    it('should expose refreshWallet function', () => {
        const { result } = renderHook(() =>
            useGatewayChat({ apiSlug: 'my-api', consumerKey: 'ask_live_123' })
        );

        expect(typeof result.current.refreshWallet).toBe('function');
    });

    it('should not send empty messages', async () => {
        mockFetchResponse({ balance: 100 }); // wallet

        const { result } = renderHook(() =>
            useGatewayChat({ apiSlug: 'my-api', consumerKey: 'ask_live_123' })
        );

        await act(async () => {});

        const msgCountBefore = result.current.messages.length;

        await act(async () => {
            await result.current.sendMessage('   ');
        });

        // Empty trimmed message should not be sent
        expect(result.current.messages.length).toBe(msgCountBefore);
    });
});
