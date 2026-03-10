// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVectorSearch } from '../hooks/useVectorSearch.js';

const mockIngest = vi.fn();
const mockQuery = vi.fn();
const mockDelete = vi.fn();
const mockDeleteByType = vi.fn();
const mockSearchUpdate = vi.fn();
const mockListTypes = vi.fn();
const mockSearchCount = vi.fn();
const mockSearchGet = vi.fn();
const mockConfigure = vi.fn();

vi.mock('../context.js', () => ({
    useAerostack: () => ({
        baseUrl: 'https://api.test.com/v1',
        projectId: 'test-project',
        sdk: {
            ai: {
                ingest: mockIngest,
                query: mockQuery,
                _delete: mockDelete,
                deleteByType: mockDeleteByType,
                searchUpdate: mockSearchUpdate,
                listTypes: mockListTypes,
                searchCount: mockSearchCount,
                searchGet: mockSearchGet,
                configure: mockConfigure,
            },
        },
    }),
}));

describe('useVectorSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should start with loading=false and error=null', () => {
            const { result } = renderHook(() => useVectorSearch());
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should expose all vector search methods', () => {
            const { result } = renderHook(() => useVectorSearch());
            expect(typeof result.current.ingest).toBe('function');
            expect(typeof result.current.query).toBe('function');
            expect(typeof result.current.remove).toBe('function');
            expect(typeof result.current.deleteByType).toBe('function');
            expect(typeof result.current.update).toBe('function');
            expect(typeof result.current.listTypes).toBe('function');
            expect(typeof result.current.count).toBe('function');
            expect(typeof result.current.get).toBe('function');
            expect(typeof result.current.configure).toBe('function');
        });
    });

    describe('ingest', () => {
        it('should call sdk.ai.ingest with content and options', async () => {
            mockIngest.mockResolvedValueOnce({ success: true });

            const { result } = renderHook(() => useVectorSearch());

            await act(async () => {
                await result.current.ingest('Hello world', { type: 'docs', id: 'doc-1' });
            });

            expect(mockIngest).toHaveBeenCalledWith({
                ingestRequest: { content: 'Hello world', type: 'docs', id: 'doc-1' },
            });
        });

        it('should set error on failure', async () => {
            mockIngest.mockRejectedValueOnce(new Error('Vectorize unavailable'));

            const { result } = renderHook(() => useVectorSearch());

            await act(async () => {
                try { await result.current.ingest('test', { type: 'test' }); } catch {}
            });

            expect(result.current.error!.message).toBe('Vectorize unavailable');
        });
    });

    describe('query', () => {
        it('should call sdk.ai.query and return results', async () => {
            const mockResults = [
                { id: '1', content: 'result 1', score: 0.9, type: 'docs', metadata: {} },
            ];
            mockQuery.mockResolvedValueOnce({ results: mockResults });

            const { result } = renderHook(() => useVectorSearch());

            let results: any;
            await act(async () => {
                results = await result.current.query('search text', { topK: 5 });
            });

            expect(mockQuery).toHaveBeenCalledWith({
                queryRequest: { text: 'search text', topK: 5 },
            });
            expect(results).toEqual(mockResults);
        });

        it('should return empty array when no results', async () => {
            mockQuery.mockResolvedValueOnce({});

            const { result } = renderHook(() => useVectorSearch());

            let results: any;
            await act(async () => {
                results = await result.current.query('empty search');
            });

            expect(results).toEqual([]);
        });
    });

    describe('remove', () => {
        it('should call sdk.ai._delete with id', async () => {
            mockDelete.mockResolvedValueOnce({ success: true });

            const { result } = renderHook(() => useVectorSearch());

            await act(async () => {
                await result.current.remove('doc-1');
            });

            expect(mockDelete).toHaveBeenCalledWith({ deleteRequest: { id: 'doc-1' } });
        });
    });

    describe('deleteByType', () => {
        it('should call sdk.ai.deleteByType', async () => {
            mockDeleteByType.mockResolvedValueOnce({ success: true });

            const { result } = renderHook(() => useVectorSearch());

            await act(async () => {
                await result.current.deleteByType('docs');
            });

            expect(mockDeleteByType).toHaveBeenCalledWith({
                deleteByTypeRequest: { type: 'docs' },
            });
        });
    });

    describe('update', () => {
        it('should call sdk.ai.searchUpdate with id and content', async () => {
            mockSearchUpdate.mockResolvedValueOnce({ success: true });

            const { result } = renderHook(() => useVectorSearch());

            await act(async () => {
                await result.current.update('doc-1', 'updated content', { type: 'docs' });
            });

            expect(mockSearchUpdate).toHaveBeenCalledWith({
                searchUpdateRequest: { id: 'doc-1', content: 'updated content', type: 'docs' },
            });
        });
    });

    describe('listTypes', () => {
        it('should call sdk.ai.listTypes and return types', async () => {
            mockListTypes.mockResolvedValueOnce({
                types: [{ type: 'docs', count: 10 }, { type: 'faq', count: 5 }],
            });

            const { result } = renderHook(() => useVectorSearch());

            let types: any;
            await act(async () => {
                types = await result.current.listTypes();
            });

            expect(types).toEqual([{ type: 'docs', count: 10 }, { type: 'faq', count: 5 }]);
        });
    });

    describe('count', () => {
        it('should call sdk.ai.searchCount and return count', async () => {
            mockSearchCount.mockResolvedValueOnce({ count: 42 });

            const { result } = renderHook(() => useVectorSearch());

            let count: number = 0;
            await act(async () => {
                count = await result.current.count('docs');
            });

            expect(mockSearchCount).toHaveBeenCalledWith({ searchCountRequest: { type: 'docs' } });
            expect(count).toBe(42);
        });
    });

    describe('get', () => {
        it('should call sdk.ai.searchGet and return result', async () => {
            const mockResult = { id: '1', content: 'test', score: 1, type: 'docs', metadata: {} };
            mockSearchGet.mockResolvedValueOnce({ result: mockResult });

            const { result } = renderHook(() => useVectorSearch());

            let item: any;
            await act(async () => {
                item = await result.current.get('1');
            });

            expect(item).toEqual(mockResult);
        });

        it('should return null when not found', async () => {
            mockSearchGet.mockResolvedValueOnce({});

            const { result } = renderHook(() => useVectorSearch());

            let item: any;
            await act(async () => {
                item = await result.current.get('nonexistent');
            });

            expect(item).toBeNull();
        });
    });

    describe('configure', () => {
        it('should call sdk.ai.configure with embedding model', async () => {
            mockConfigure.mockResolvedValueOnce({ success: true });

            const { result } = renderHook(() => useVectorSearch());

            await act(async () => {
                await result.current.configure('multilingual');
            });

            expect(mockConfigure).toHaveBeenCalledWith({
                configureRequest: { embeddingModel: 'multilingual' },
            });
        });
    });
});
