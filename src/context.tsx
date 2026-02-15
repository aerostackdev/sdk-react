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
        return new SDK({
            serverURL: baseUrl,
            // In web context, we might not have global security at init
            // but we set it up for public access via projectId header if needed
        });
    }, [baseUrl]);

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
