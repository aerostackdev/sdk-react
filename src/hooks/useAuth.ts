import { useState, useCallback, useEffect } from 'react';
import { useAerostack } from '../context.js';

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    emailVerified: boolean;
    createdAt?: string;
    customFields?: Record<string, any>;
    [key: string]: any;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
}

export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    loading: boolean;
    error: string | null;
}

export interface ProfileUpdate {
    name?: string;
    avatar_url?: string;
    avatar_image_id?: string;
    customFields?: Record<string, any>;
}

/** Derive the public auth API base URL from provider config. */
function getAuthBase(baseUrl: string, projectId: string): string {
    const host = baseUrl.replace(/\/v1\/?$/, '');
    return `${host}/api/v1/public/projects/${projectId}/auth`;
}

async function authFetch(url: string, method: string, body?: object, token?: string): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error((data as any).error || (data as any).message || `Request failed: ${res.status}`);
    }
    return data;
}

export const useAuth = () => {
    const { baseUrl, projectId } = useAerostack();
    const authBase = getAuthBase(baseUrl, projectId);

    const [state, setState] = useState<AuthState>({
        user: null,
        tokens: null,
        loading: false,
        error: null,
    });

    const setError = (error: string | null) => setState(s => ({ ...s, error }));

    const handleAuthResponse = useCallback((data: any): { user: User | null; tokens: AuthTokens | null } => {
        const accessToken = data.accessToken ?? data.token;
        const tokens: AuthTokens | null = accessToken
            ? { accessToken, refreshToken: data.refreshToken, expiresAt: data.expiresAt }
            : null;
        const user: User | null = data.user
            ? {
                id: data.user.id,
                email: data.user.email ?? '',
                name: data.user.name,
                avatar_url: data.user.avatar_url,
                emailVerified: !!data.user.email_verified_at,
                createdAt: data.user.created_at,
                customFields: data.user.profile_extras,
            }
            : null;
        return { user, tokens };
    }, []);

    /** Sign in with email and password */
    const signIn = useCallback(async (email: string, password: string, turnstileToken?: string) => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const data = await authFetch(`${authBase}/login`, 'POST', { email, password, ...(turnstileToken && { turnstileToken }) });
            const { user, tokens } = handleAuthResponse(data);
            setState({ user, tokens, loading: false, error: null });
            return data;
        } catch (err: any) {
            setState(s => ({ ...s, loading: false, error: err.message }));
            throw err;
        }
    }, [authBase, handleAuthResponse]);

    /** Register a new user */
    const signUp = useCallback(async (email: string, password: string, opts?: { name?: string; customFields?: Record<string, any>; turnstileToken?: string }) => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const data = await authFetch(`${authBase}/register`, 'POST', { email, password, ...opts });
            if (!data.requiresVerification) {
                const { user, tokens } = handleAuthResponse(data);
                setState({ user, tokens, loading: false, error: null });
            } else {
                setState(s => ({ ...s, loading: false }));
            }
            return data;
        } catch (err: any) {
            setState(s => ({ ...s, loading: false, error: err.message }));
            throw err;
        }
    }, [authBase, handleAuthResponse]);

    /** Sign out and invalidate tokens */
    const signOut = useCallback(async () => {
        const { tokens } = state;
        if (tokens?.accessToken) {
            try {
                await authFetch(
                    `${authBase}/logout`,
                    'POST',
                    { ...(tokens.refreshToken && { refreshToken: tokens.refreshToken }), accessToken: tokens.accessToken },
                    tokens.accessToken
                );
            } catch {
                // Best-effort — clear local state regardless
            }
        }
        setState({ user: null, tokens: null, loading: false, error: null });
    }, [authBase, state]);

    /** Send OTP code to email or phone */
    const sendOTP = useCallback(async (identifier: string, type: 'email' | 'phone' = 'email') => {
        setError(null);
        const body = type === 'phone' ? { phone: identifier } : { email: identifier };
        return authFetch(`${authBase}/otp/send`, 'POST', body);
    }, [authBase]);

    /** Verify OTP and sign in */
    const verifyOTP = useCallback(async (identifier: string, code: string, type: 'email' | 'phone' = 'email') => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
            const body = type === 'phone' ? { phone: identifier, code } : { email: identifier, code };
            const data = await authFetch(`${authBase}/otp/verify`, 'POST', body);
            const { user, tokens } = handleAuthResponse(data);
            setState({ user, tokens, loading: false, error: null });
            return data;
        } catch (err: any) {
            setState(s => ({ ...s, loading: false, error: err.message }));
            throw err;
        }
    }, [authBase, handleAuthResponse]);

    /** Verify email address from the link sent on registration */
    const verifyEmail = useCallback(async (token: string) => {
        setError(null);
        return authFetch(`${authBase}/verify-email?token=${encodeURIComponent(token)}`, 'GET');
    }, [authBase]);

    /** Resend the email verification link */
    const resendVerificationEmail = useCallback(async (email: string) => {
        setError(null);
        return authFetch(`${authBase}/resend-verification`, 'POST', { email });
    }, [authBase]);

    /** Request a password reset email */
    const requestPasswordReset = useCallback(async (email: string, turnstileToken?: string) => {
        setError(null);
        return authFetch(`${authBase}/reset-password-request`, 'POST', { email, ...(turnstileToken && { turnstileToken }) });
    }, [authBase]);

    /** Reset password using token from the reset email */
    const resetPassword = useCallback(async (token: string, newPassword: string) => {
        setError(null);
        return authFetch(`${authBase}/reset-password`, 'POST', { token, newPassword });
    }, [authBase]);

    /** Refresh the access token using a stored refresh token */
    const refreshAccessToken = useCallback(async (refreshToken: string) => {
        try {
            const data = await authFetch(`${authBase}/refresh`, 'POST', { refreshToken });
            const newTokens: AuthTokens = {
                accessToken: data.accessToken ?? data.token,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
            };
            setState(s => ({ ...s, tokens: newTokens }));
            return newTokens;
        } catch (err: any) {
            setState(s => ({ ...s, tokens: null, user: null, error: err.message }));
            throw err;
        }
    }, [authBase]);

    /** Fetch current user profile and update state */
    const refreshUser = useCallback(async () => {
        const token = state.tokens?.accessToken;
        if (!token) return;
        setState(s => ({ ...s, loading: true }));
        try {
            const data = await authFetch(`${authBase}/me`, 'GET', undefined, token);
            const user: User = {
                id: data.id ?? data.user?.id,
                email: data.email ?? data.user?.email ?? '',
                name: data.name ?? data.user?.name,
                avatar_url: data.avatar_url ?? data.user?.avatar_url,
                emailVerified: !!(data.email_verified_at ?? data.user?.email_verified_at),
                createdAt: data.created_at ?? data.user?.created_at,
                customFields: data.profile_extras ?? data.user?.profile_extras,
            };
            setState(s => ({ ...s, user, loading: false }));
        } catch {
            setState(s => ({ ...s, loading: false }));
        }
    }, [authBase, state.tokens?.accessToken]);

    /** Update user profile */
    const updateProfile = useCallback(async (updates: ProfileUpdate) => {
        const token = state.tokens?.accessToken;
        if (!token) throw new Error('Not authenticated');
        const data = await authFetch(`${authBase}/me`, 'PATCH', updates, token);
        await refreshUser();
        return data;
    }, [authBase, state.tokens?.accessToken, refreshUser]);

    /** Delete user avatar */
    const deleteAvatar = useCallback(async () => {
        const token = state.tokens?.accessToken;
        if (!token) throw new Error('Not authenticated');
        const data = await authFetch(`${authBase}/me/avatar`, 'DELETE', undefined, token);
        await refreshUser();
        return data;
    }, [authBase, state.tokens?.accessToken, refreshUser]);

    // Auto-refresh user profile when access token changes
    useEffect(() => {
        if (state.tokens?.accessToken && !state.user) {
            refreshUser();
        }
    }, [state.tokens?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        user: state.user,
        tokens: state.tokens,
        loading: state.loading,
        error: state.error,
        isAuthenticated: !!state.tokens?.accessToken,
        signIn,
        signUp,
        signOut,
        sendOTP,
        verifyOTP,
        verifyEmail,
        resendVerificationEmail,
        requestPasswordReset,
        resetPassword,
        refreshAccessToken,
        refreshUser,
        updateProfile,
        deleteAvatar,
    };
};
