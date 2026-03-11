import React, { createContext, useContext, useMemo } from 'react';
import { SDK, RealtimeClient } from '@aerostack/sdk-web';

export interface AerostackContextType {
    sdk: SDK & { realtime?: RealtimeClient };
    projectId: string;
    baseUrl: string;
}

const AerostackContext = createContext<AerostackContextType | null>(null);

export interface AerostackProviderProps {
    projectId: string;
    apiKey?: string;
    baseUrl?: string;
    maxReconnectAttempts?: number;
    children: React.ReactNode;
}

export const AerostackProvider: React.FC<AerostackProviderProps> = ({
    projectId,
    apiKey,
    baseUrl = 'https://api.aerostack.dev/v1',
    maxReconnectAttempts = 10,
    children,
}) => {
    const sdk = useMemo(() => {
        // In web context, we use the hook registration for projectId parity
        import('@aerostack/sdk-web').then(mod => {
            // @ts-ignore - the hook logic handles this
            if (mod.setProjectId) mod.setProjectId(projectId);
        });

        const client = new SDK({
            serverURL: baseUrl,
            apiKeyAuth: apiKey,
        });

        // Instantiate RealtimeClient and attach it to the SDK instance
        // so that useSubscription and App code can access 'sdk.realtime'
        const realtime = new RealtimeClient({
            baseUrl,
            projectId,
            apiKey,
            maxReconnectAttempts,
        });

        // Expose realtime on the SDK instance
        (client as any).realtime = realtime;

        return client as SDK & { realtime: RealtimeClient };
    }, [baseUrl, projectId, apiKey]);

    const value = useMemo(() => ({
        sdk,
        projectId,
        baseUrl,
    }), [sdk, projectId, baseUrl]);

    return (
        <AerostackContext.Provider value={value}>
            {children}
        </AerostackContext.Provider>
    );
};

export const useAerostack = () => {
    const context = useContext(AerostackContext);
    if (!context) {
        throw new Error('useAerostack must be used within an AerostackProvider');
    }
    return context;
};
