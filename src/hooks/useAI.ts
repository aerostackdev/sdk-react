import { useState, useCallback } from 'react';
import { useAerostack } from '../context.js';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const useAI = () => {
    const { sdk } = useAerostack();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const chat = useCallback(async (messages: ChatMessage[], options?: any) => {
        try {
            setLoading(true);
            setError(null);
            const result = await sdk.ai.aiChat({
                messages,
                ...options,
            });
            return result.response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('AI chat failed');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    return {
        chat,
        loading,
        error,
    };
};
