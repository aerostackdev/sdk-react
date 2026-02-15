import { useState, useCallback } from 'react';
import { useAerostack } from '../context.js';

export const useDb = () => {
    const { sdk } = useAerostack();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const query = useCallback(async (sql: string, params?: any[]) => {
        try {
            setLoading(true);
            setError(null);
            const result = await sdk.database.dbQuery({ sql, params });
            return result; // result is already DBQueryResult
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Database query failed');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    return {
        query,
        loading,
        error,
    };
};
