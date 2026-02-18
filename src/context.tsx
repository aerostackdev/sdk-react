import React, { createContext, useContext, useMemo } from 'react';
import { SDK } from '@aerostack/sdk-web';

export interface AerostackContextType {
    sdk: SDK;
    projectId: string;
}

const AerostackContext = createContext<AerostackContextType | null>(null);

export interface AerostackProviderProps {
    projectId: string;
    baseUrl?: string;
    children: React.ReactNode;
}

export const AerostackProvider: React.FC<AerostackProviderProps> = ({
    projectId,
    baseUrl = 'https://api.aerostack.ai/v1',
    children,
}) => {
    const sdk = useMemo(() => {
        // In web context, we use the hook registration for projectId parity
        import('@aerostack/sdk-web').then(mod => {
            // @ts-ignore - the hook logic handles this
            if (mod.setProjectId) mod.setProjectId(projectId);
        });

        return new SDK({
            serverURL: baseUrl,
        });
    }, [baseUrl, projectId]);

    const value = useMemo(() => ({
        sdk,
        projectId,
    }), [sdk, projectId]);

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
