// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCache } from '../hooks/useCache.js';

const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();

vi.mock('../context.js', () => ({
    useAerostack: () => ({
        baseUrl: 'https://api.test.com/v1',
        projectId: 'test-project',
        sdk: {
            cache: { cacheGet: mockCacheGet, cacheSet: mockCacheSet },
        },
    }),
}));

describe('useCache', () => {
    beforeEach(() => {
        mockCacheGet.mockReset();
        mockCacheSet.mockReset();
    });

    describe('initial state', () => {
        it('should start with loading=false and error=null', () => {
            const { result } = renderHook(() => useCache());
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should expose get and set functions', () => {
            const { result } = renderHook(() => useCache());
            expect(typeof result.current.get).toBe('function');
            expect(typeof result.current.set).toBe('function');
        });
    });

    describe('get', () => {
        it('should call sdk.cache.cacheGet with key', async () => {
            mockCacheGet.mockResolvedValueOnce({ value: 'cached-data' });

            const { result } = renderHook(() => useCache());

            let value: any;
            await act(async () => {
                value = await result.current.get('my-key');
            });

            expect(mockCacheGet).toHaveBeenCalledWith({ key: 'my-key' });
            expect(value).toBe('cached-data');
        });

        it('should set error on failure', async () => {
            mockCacheGet.mockRejectedValueOnce(new Error('Cache miss'));

            const { result } = renderHook(() => useCache());

            await act(async () => {
                try { await result.current.get('bad-key'); } catch {}
            });

            expect(result.current.error!.message).toBe('Cache miss');
            expect(result.current.loading).toBe(false);
        });

        it('should wrap non-Error throws', async () => {
            mockCacheGet.mockRejectedValueOnce('raw error');

            const { result } = renderHook(() => useCache());

            await act(async () => {
                try { await result.current.get('key'); } catch {}
            });

            expect(result.current.error!.message).toBe('Cache get failed');
        });
    });

    describe('set', () => {
        it('should call sdk.cache.cacheSet with key, value', async () => {
            mockCacheSet.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useCache());

            await act(async () => {
                await result.current.set('my-key', 'my-value');
            });

            expect(mockCacheSet).toHaveBeenCalledWith({ key: 'my-key', value: 'my-value', ttl: undefined });
        });

        it('should pass ttl when provided', async () => {
            mockCacheSet.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useCache());

            await act(async () => {
                await result.current.set('key', 'val', 3600);
            });

            expect(mockCacheSet).toHaveBeenCalledWith({ key: 'key', value: 'val', ttl: 3600 });
        });

        it('should set error on failure', async () => {
            mockCacheSet.mockRejectedValueOnce(new Error('Write failed'));

            const { result } = renderHook(() => useCache());

            await act(async () => {
                try { await result.current.set('key', 'val'); } catch {}
            });

            expect(result.current.error!.message).toBe('Write failed');
        });
    });
});
