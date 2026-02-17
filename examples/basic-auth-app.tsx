import React, { useState } from 'react';
import { AerostackProvider, useAuth } from '@aerostack/react';

/**
 * Basic Auth App Example
 * 
 * Demonstrates basic usage of AerostackProvider and useAuth hook.
 */

// 1. Root Component wraps app in Provider
export default function App() {
    return (
        <AerostackProvider
            projectSlug="YOUR_PROJECT_SLUG"
        // baseUrl="https://api.aerostack.ai/v1" // Optional
        >
            <AuthDemo />
        </AerostackProvider>
    );
}

// 2. Child Component uses hooks
function AuthDemo() {
    const { user, login, logout, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (isLoading) return <div>Loading...</div>;

    if (user) {
        return (
            <div>
                <h1>Welcome, {user.name || user.email}!</h1>
                <button onClick={() => logout()}>Logout</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <div style={{ color: 'red' }}>{error.message}</div>}

            <form onSubmit={(e) => {
                e.preventDefault();
                login(email, password);
            }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
