import { useEffect, useState } from 'react';
import { useAerostack } from '../context.js';
import { RealtimeSubscriptionOptions } from '@aerostack/sdk-web';

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

    useEffect(() => {
        let isMounted = true;
        const realtime = (sdk as any).realtime;

        if (!realtime) {
            setError(new Error('Realtime not supported in this SDK version'));
            setLoading(false);
            return;
        }

        const channel = realtime.channel(topic, options);

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

        return () => {
            isMounted = false;
            // Note: We don't automatically disconnect the global client,
            // but we could unsubscribe from the channel if needed.
            // channel.unsubscribe();
        };
    }, [sdk, topic, JSON.stringify(options)]);

    return { data, error, loading };
}
