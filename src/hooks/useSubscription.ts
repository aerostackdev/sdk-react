import { useEffect, useState, useRef } from 'react';
import { useAerostack } from '../context.js';

export interface RealtimeSubscriptionOptions {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: Record<string, any>;
}

/**
 * Hook to subscribe to Aerostack realtime events
 * 
 * @param topic The topic to subscribe to (e.g., 'posts' or 'table/posts/projectId')
 * @param options Event type and filtering options
 */
export function useSubscription<T = any>(
    topic: string,
    options: RealtimeSubscriptionOptions = {}
) {
    const { sdk } = useAerostack();
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(true);
    // Fix A15: Stable reference for options to prevent re-render loops
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        let isMounted = true;
        const realtime = (sdk as any).realtime;

        if (!realtime) {
            setError(new Error('Realtime not supported in this SDK version'));
            setLoading(false);
            return;
        }

        const channel = realtime.channel(topic, optionsRef.current);

        const setup = async () => {
            try {
                await realtime.connect();

                channel.on('*', (payload: any) => {
                    if (isMounted) {
                        setData(payload);
                    }
                });

                channel.subscribe();
                setLoading(false);
            } catch (err: any) {
                if (isMounted) {
                    setError(err);
                    setLoading(false);
                }
            }
        };

        setup();

        // Fix 1.5: Properly unsubscribe on cleanup
        return () => {
            isMounted = false;
            channel.unsubscribe();
        };
    }, [sdk, topic]);

    return { data, error, loading };
}

/**
 * Hook to observe the realtime connection status
 */
export function useRealtimeStatus() {
    const { sdk } = useAerostack();
    const realtime = (sdk as any).realtime;
    const [status, setStatus] = useState<string>(realtime?.status ?? 'idle');

    useEffect(() => {
        if (!realtime || !realtime.onStatusChange) return;
        const unsub = realtime.onStatusChange((s: string) => setStatus(s));
        return unsub;
    }, [realtime]);

    return status;
}
