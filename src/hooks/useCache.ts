import { useState, useCallback } from 'react';
import { useAerostack } from '../context.js';

export const useCache = () => {
    const { sdk } = useAerostack();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const get = useCallback(async (key: string) => {
        try {
            setLoading(true);
            setError(null);
            // NOTE: cache is a server-side API. Only use this in Next.js server components
            // or provide an SDK instance initialized with a Secret Key.
            const result = await (sdk as any).cache.cacheGet({ key });
            return result.value;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Cache get failed');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    const set = useCallback(async (key: string, value: any, ttl?: number) => {
        try {
            setLoading(true);
            setError(null);
            await (sdk as any).cache.cacheSet({ key, value, ttl });
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Cache set failed');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    return {
        get,
        set,
        loading,
        error,
    };
};
