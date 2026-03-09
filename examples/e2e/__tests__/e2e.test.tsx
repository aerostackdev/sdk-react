// @vitest-environment jsdom
/**
 * React SDK E2E Tests
 *
 * Tests the full auth flow: signUp → signIn → refreshUser → signOut
 * using mock fetch and the real useAuth hook via AerostackProvider.
 * Imports from source since tshy build may not be available.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

// Mock @aerostack/sdk-web before any source import
vi.mock('@aerostack/sdk-web', () => {
  class MockSDK {
    constructor(public opts: any) {}
  }
  class MockRealtimeClient {
    constructor(public opts: any) {}
  }
  return {
    SDK: MockSDK,
    RealtimeClient: MockRealtimeClient,
    setProjectId: vi.fn(),
    default: { SDK: MockSDK, RealtimeClient: MockRealtimeClient },
  };
});

// Import from source
const { useAuth } = await import('../../../src/hooks/useAuth');
const { AerostackProvider, useAerostack } = await import('../../../src/context');

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(data: any, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
  });
}

describe('React SDK E2E - Auth Flow', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should export useAuth hook', () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });

  it('should export AerostackProvider', () => {
    expect(AerostackProvider).toBeDefined();
  });

  it('should export useAerostack hook', () => {
    expect(useAerostack).toBeDefined();
    expect(typeof useAerostack).toBe('function');
  });

  it('should provide context via AerostackProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="e2e-proj" apiKey="e2e-key">
        {children}
      </AerostackProvider>
    );

    const { result } = renderHook(() => useAerostack(), { wrapper });
    expect(result.current.projectId).toBe('e2e-proj');
    expect(result.current.sdk).toBeDefined();
  });

  it('should sign in and set user state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="e2e-proj" apiKey="e2e-key">
        {children}
      </AerostackProvider>
    );

    mockResponse({
      user: { id: 'u1', email: 'test@e2e.com', name: 'E2E User' },
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@e2e.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('test@e2e.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should sign out and clear state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="e2e-proj" apiKey="e2e-key">
        {children}
      </AerostackProvider>
    );

    // Sign in first
    mockResponse({
      user: { id: 'u1', email: 'test@e2e.com' },
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@e2e.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Sign out
    mockResponse({ success: true });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
