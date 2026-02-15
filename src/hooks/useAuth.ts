import { useState, useEffect, useCallback } from 'react';
import { useAerostack } from '../context.js';

export interface User {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
}

export const useAuth = () => {
    const { sdk } = useAerostack();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refreshUser = useCallback(async () => {
        try {
            setLoading(true);
            // Logic to fetch current user session from sdk.authentication
            // const session = await sdk.authentication.getSession();
            // setUser(session.user);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch user'));
        } finally {
            setLoading(false);
        }
    }, [sdk]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const signIn = async (credentials: any) => {
        const result = await sdk.authentication.authSignin(credentials);
        // setUser(result.user);
        return result;
    };

    const signUp = async (credentials: any) => {
        const result = await sdk.authentication.authSignup(credentials);
        return result;
    };

    const signOut = async () => {
        // await sdk.authentication.signOut();
        setUser(null);
    };

    return {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshUser,
    };
};
