// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDb } from '../hooks/useDb';

const mockDbQuery = vi.fn();

vi.mock('../context.js', () => ({
    useAerostack: () => ({
        baseUrl: 'https://api.test.com/v1',
        projectId: 'test-project',
        sdk: {
            database: { dbQuery: mockDbQuery },
        },
    }),
}));

describe('useDb', () => {
    beforeEach(() => {
        mockDbQuery.mockReset();
    });

    describe('initial state', () => {
        it('should start with loading=false and error=null', () => {
            const { result } = renderHook(() => useDb());
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should expose a query function', () => {
            const { result } = renderHook(() => useDb());
            expect(typeof result.current.query).toBe('function');
        });
    });

    describe('query', () => {
        it('should call sdk.database.dbQuery with sql and params', async () => {
            const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
            mockDbQuery.mockResolvedValueOnce(mockResult);

            const { result } = renderHook(() => useDb());

            let response: any;
            await act(async () => {
                response = await result.current.query('SELECT * FROM users WHERE id = ?', [1]);
            });

            expect(mockDbQuery).toHaveBeenCalledWith({
                requestBody: { sql: 'SELECT * FROM users WHERE id = ?', params: [1] },
            });
            expect(response).toEqual(mockResult);
        });

        it('should work without params', async () => {
            mockDbQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const { result } = renderHook(() => useDb());

            await act(async () => {
                await result.current.query('SELECT 1');
            });

            expect(mockDbQuery).toHaveBeenCalledWith({
                requestBody: { sql: 'SELECT 1', params: undefined },
            });
        });

        it('should set error on failure', async () => {
            mockDbQuery.mockRejectedValueOnce(new Error('SQL syntax error'));

            const { result } = renderHook(() => useDb());

            await act(async () => {
                try { await result.current.query('INVALID SQL'); } catch {}
            });

            expect(result.current.error!.message).toBe('SQL syntax error');
            expect(result.current.loading).toBe(false);
        });

        it('should wrap non-Error throws', async () => {
            mockDbQuery.mockRejectedValueOnce('raw error');

            const { result } = renderHook(() => useDb());

            await act(async () => {
                try { await result.current.query('SELECT 1'); } catch {}
            });

            expect(result.current.error!.message).toBe('Database query failed');
        });

        it('should clear error on subsequent success', async () => {
            mockDbQuery.mockRejectedValueOnce(new Error('fail'));

            const { result } = renderHook(() => useDb());

            await act(async () => {
                try { await result.current.query('bad'); } catch {}
            });

            expect(result.current.error).not.toBeNull();

            mockDbQuery.mockResolvedValueOnce({ rows: [] });

            await act(async () => {
                await result.current.query('SELECT 1');
            });

            expect(result.current.error).toBeNull();
        });
    });
});
