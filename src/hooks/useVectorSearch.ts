import { useState, useCallback } from 'react';
import { useAerostack } from '../context.js';

export interface VectorSearchResult {
    id: string;
    content: string;
    score: number;
    type: string;
    metadata: Record<string, any>;
}

export interface IngestOptions {
    /** Optional custom ID — auto-generated UUID if omitted */
    id?: string;
    /** Required category/type for this vector (e.g. 'documentation', 'product') */
    type: string;
    /** Optional key-value metadata stored alongside the vector */
    metadata?: Record<string, any>;
}

export interface QueryOptions {
    /** Number of results to return (default: 5) */
    topK?: number;
    /** Filter to specific types */
    types?: string[];
    /** Extra metadata filter applied server-side */
    filter?: Record<string, any>;
}

/**
 * useVectorSearch
 *
 * Provides semantic vector search operations against the managed Vectorize index.
 * Requires the AerostackProvider to be initialized with a **secret API key**
 * (not a public key) — vector search is a server-side operation.
 *
 * Intended for use in Next.js Server Components, Server Actions, or API routes.
 *
 * ```tsx
 * const { ingest, query, loading, error } = useVectorSearch();
 *
 * // Ingest a document
 * await ingest('The product manual for Foo X1...', { type: 'documentation', id: 'manual-1' });
 *
 * // Semantic search
 * const results = await query('How do I set up the device?', { topK: 5 });
 * ```
 */
export const useVectorSearch = () => {
    const { sdk } = useAerostack();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Embed and store content in the vector index.
     */
    const ingest = useCallback(async (
        content: string,
        options: IngestOptions
    ): Promise<{ success: boolean }> => {
        try {
            setLoading(true);
            setError(null);
            return await (sdk as any).ai.ingest({
                ingestRequest: { content, ...options },
            });
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector ingest failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Perform a semantic similarity search against the vector index.
     */
    const query = useCallback(async (
        text: string,
        options?: QueryOptions
    ): Promise<VectorSearchResult[]> => {
        try {
            setLoading(true);
            setError(null);
            const result = await (sdk as any).ai.query({
                queryRequest: { text, ...options },
            });
            return (result?.results ?? []) as VectorSearchResult[];
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector query failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Delete a single vector by its user-facing ID.
     */
    const remove = useCallback(async (id: string): Promise<{ success: boolean }> => {
        try {
            setLoading(true);
            setError(null);
            return await (sdk as any).ai._delete({ deleteRequest: { id } });
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector delete failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Delete all vectors of a specific type for this project.
     */
    const deleteByType = useCallback(async (type: string): Promise<{ success: boolean }> => {
        try {
            setLoading(true);
            setError(null);
            return await (sdk as any).ai.deleteByType({ deleteByTypeRequest: { type } });
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector deleteByType failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Update an existing vector by re-embedding with new content (preserves the original ID).
     */
    const update = useCallback(async (
        id: string,
        content: string,
        options?: { type?: string; metadata?: Record<string, any> }
    ): Promise<{ success: boolean }> => {
        try {
            setLoading(true);
            setError(null);
            return await (sdk as any).ai.searchUpdate({
                searchUpdateRequest: { id, content, ...options },
            });
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector update failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * List all distinct types and their vector counts for this project.
     */
    const listTypes = useCallback(async (): Promise<Array<{ type: string; count: number }>> => {
        try {
            setLoading(true);
            setError(null);
            const result = await (sdk as any).ai.listTypes();
            return (result?.types ?? []) as Array<{ type: string; count: number }>;
        } catch (err) {
            const e = err instanceof Error ? err : new Error('listTypes failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Get total vector count for this project, optionally filtered by type.
     */
    const count = useCallback(async (type?: string): Promise<number> => {
        try {
            setLoading(true);
            setError(null);
            const result = await (sdk as any).ai.searchCount({ searchCountRequest: { type } });
            return (result?.count ?? 0) as number;
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector count failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Get a single vector by its user-facing ID.
     */
    const get = useCallback(async (id: string): Promise<VectorSearchResult | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await (sdk as any).ai.searchGet({ searchGetRequest: { id } });
            return (result?.result ?? null) as VectorSearchResult | null;
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Vector get failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    /**
     * Configure the embedding model for this project.
     * Changing the model won't re-index existing vectors — clear and re-ingest after switching.
     */
    const configure = useCallback(async (
        embeddingModel: 'english' | 'multilingual'
    ): Promise<{ success: boolean }> => {
        try {
            setLoading(true);
            setError(null);
            return await (sdk as any).ai.configure({ configureRequest: { embeddingModel } });
        } catch (err) {
            const e = err instanceof Error ? err : new Error('Configure failed');
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    return {
        ingest,
        query,
        remove,
        deleteByType,
        update,
        listTypes,
        count,
        get,
        configure,
        loading,
        error,
    };
};
