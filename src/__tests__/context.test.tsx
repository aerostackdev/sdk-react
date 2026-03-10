// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';

// Mock @aerostack/sdk-web BEFORE importing anything that depends on it
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

// NOW import context (which imports from @aerostack/sdk-web)
const { AerostackProvider, useAerostack } = await import('../context.js');

describe('useAerostack', () => {
  it('should throw when used outside of AerostackProvider', () => {
    expect(() => {
      renderHook(() => useAerostack());
    }).toThrow('useAerostack must be used within an AerostackProvider');
  });
});

describe('AerostackProvider', () => {
  it('should provide projectId and baseUrl to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="proj-1" apiKey="key-1">
        {children}
      </AerostackProvider>
    );

    const { result } = renderHook(() => useAerostack(), { wrapper });

    expect(result.current.projectId).toBe('proj-1');
    expect(result.current.baseUrl).toBe('https://api.aerostack.dev/v1');
  });

  it('should use custom baseUrl', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="proj-1" baseUrl="https://custom.api.com/v1">
        {children}
      </AerostackProvider>
    );

    const { result } = renderHook(() => useAerostack(), { wrapper });
    expect(result.current.baseUrl).toBe('https://custom.api.com/v1');
  });

  it('should provide an SDK instance', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="proj-1" apiKey="key-1">
        {children}
      </AerostackProvider>
    );

    const { result } = renderHook(() => useAerostack(), { wrapper });
    expect(result.current.sdk).toBeDefined();
  });

  it('should attach realtime client to SDK', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="proj-1" apiKey="key-1">
        {children}
      </AerostackProvider>
    );

    const { result } = renderHook(() => useAerostack(), { wrapper });
    expect((result.current.sdk as any).realtime).toBeDefined();
  });

  it('should default baseUrl to Aerostack API', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AerostackProvider projectId="proj-1">
        {children}
      </AerostackProvider>
    );

    const { result } = renderHook(() => useAerostack(), { wrapper });
    expect(result.current.baseUrl).toBe('https://api.aerostack.dev/v1');
  });
});
