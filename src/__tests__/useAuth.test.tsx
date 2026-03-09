// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

// Mock the context module
vi.mock('../context.js', () => ({
  useAerostack: () => ({
    baseUrl: 'https://api.test.com/v1',
    projectId: 'test-project',
    sdk: {},
  }),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockFetchResponse(data: any, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  });
}

describe('useAuth', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  // ─── Initial State ──────────────────────────────────────

  describe('initial state', () => {
    it('should start with null user and tokens', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ─── signIn ─────────────────────────────────────────────

  describe('signIn', () => {
    it('should call login endpoint with email and password', async () => {
      mockFetchResponse({
        accessToken: 'jwt-123',
        refreshToken: 'refresh-456',
        user: { id: 'u1', email: 'test@test.com', email_verified_at: '2024-01-01' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'password123');
      });

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/login');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body.email).toBe('test@test.com');
      expect(body.password).toBe('password123');
    });

    it('should set user and tokens on success', async () => {
      mockFetchResponse({
        accessToken: 'jwt-123',
        refreshToken: 'refresh-456',
        user: { id: 'u1', email: 'test@test.com', email_verified_at: '2024-01-01' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.user!.id).toBe('u1');
      expect(result.current.user!.email).toBe('test@test.com');
      expect(result.current.user!.emailVerified).toBe(true);
      expect(result.current.tokens!.accessToken).toBe('jwt-123');
      expect(result.current.tokens!.refreshToken).toBe('refresh-456');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle token field alias', async () => {
      mockFetchResponse({
        token: 'jwt-alt',
        user: { id: 'u1', email: 'a@b.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('a@b.com', 'pass');
      });

      expect(result.current.tokens!.accessToken).toBe('jwt-alt');
    });

    it('should set error on failure', async () => {
      mockFetchResponse({ error: 'Invalid credentials' }, false, 401);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn('bad@test.com', 'wrong');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.loading).toBe(false);
    });

    it('should include turnstileToken when provided', async () => {
      mockFetchResponse({
        accessToken: 'jwt-123',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass', 'turnstile-token-abc');
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.turnstileToken).toBe('turnstile-token-abc');
    });

    it('should use correct auth base URL', async () => {
      mockFetchResponse({
        accessToken: 'jwt',
        user: { id: 'u1', email: 'a@b.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('a@b.com', 'pass');
      });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toBe('https://api.test.com/api/v1/public/projects/test-project/auth/login');
    });
  });

  // ─── signUp ─────────────────────────────────────────────

  describe('signUp', () => {
    it('should call register endpoint', async () => {
      mockFetchResponse({
        accessToken: 'jwt-new',
        user: { id: 'u1', email: 'new@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp('new@test.com', 'pass');
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/register');
    });

    it('should set user and tokens when no verification required', async () => {
      mockFetchResponse({
        accessToken: 'jwt-new',
        user: { id: 'u1', email: 'new@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp('new@test.com', 'pass');
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should not set tokens when verification required', async () => {
      mockFetchResponse({
        requiresVerification: true,
        message: 'Check your email',
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp('new@test.com', 'pass');
      });

      expect(result.current.tokens).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should pass name and customFields', async () => {
      mockFetchResponse({
        accessToken: 'jwt',
        user: { id: 'u1', email: 'a@b.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp('a@b.com', 'pass', {
          name: 'Alice',
          customFields: { role: 'admin' },
        });
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.name).toBe('Alice');
      expect(body.customFields).toEqual({ role: 'admin' });
    });

    it('should set error on failure', async () => {
      mockFetchResponse({ error: 'User already exists' }, false, 409);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp('existing@test.com', 'pass');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBe('User already exists');
    });
  });

  // ─── signOut ────────────────────────────────────────────

  describe('signOut', () => {
    it('should clear user and tokens after signOut', async () => {
      // First sign in
      mockFetchResponse({
        accessToken: 'jwt-123',
        refreshToken: 'refresh-456',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Now sign out
      mockFetchResponse({ success: true });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear state even when logout API fails', async () => {
      // First sign in
      mockFetchResponse({
        accessToken: 'jwt-123',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      // Logout fails
      mockFetchResponse({ error: 'Server error' }, false, 500);

      await act(async () => {
        await result.current.signOut();
      });

      // State should still be cleared
      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
    });

    it('should be safe when not authenticated', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      // Should not have called fetch since no tokens
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ─── sendOTP ────────────────────────────────────────────

  describe('sendOTP', () => {
    it('should send email OTP by default', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.sendOTP('test@test.com');
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/otp/send');
      const body = JSON.parse(opts.body);
      expect(body.email).toBe('test@test.com');
      expect(body.phone).toBeUndefined();
    });

    it('should send phone OTP when type is phone', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.sendOTP('+1234567890', 'phone');
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.phone).toBe('+1234567890');
      expect(body.email).toBeUndefined();
    });
  });

  // ─── verifyOTP ──────────────────────────────────────────

  describe('verifyOTP', () => {
    it('should verify OTP and set auth state', async () => {
      mockFetchResponse({
        accessToken: 'jwt-otp',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.verifyOTP('test@test.com', '123456');
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/otp/verify');
      const body = JSON.parse(opts.body);
      expect(body.email).toBe('test@test.com');
      expect(body.code).toBe('123456');

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should verify phone OTP', async () => {
      mockFetchResponse({
        accessToken: 'jwt-phone',
        user: { id: 'u1', email: '' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.verifyOTP('+1234567890', '654321', 'phone');
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.phone).toBe('+1234567890');
    });

    it('should set error on verification failure', async () => {
      mockFetchResponse({ error: 'Invalid OTP' }, false, 400);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.verifyOTP('test@test.com', '000000');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Invalid OTP');
    });
  });

  // ─── verifyEmail ────────────────────────────────────────

  describe('verifyEmail', () => {
    it('should call verify-email endpoint with token', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.verifyEmail('verify-token-123');
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/verify-email?token=verify-token-123');
      expect(opts.method).toBe('GET');
    });

    it('should encode special characters in token', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.verifyEmail('token with spaces&special=chars');
      });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain(encodeURIComponent('token with spaces&special=chars'));
    });
  });

  // ─── resendVerificationEmail ────────────────────────────

  describe('resendVerificationEmail', () => {
    it('should call resend-verification endpoint', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resendVerificationEmail('test@test.com');
      });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/resend-verification');
      expect(JSON.parse(opts.body).email).toBe('test@test.com');
    });
  });

  // ─── requestPasswordReset ──────────────────────────────

  describe('requestPasswordReset', () => {
    it('should call reset-password-request endpoint', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.requestPasswordReset('test@test.com');
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/reset-password-request');
    });

    it('should include turnstileToken when provided', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.requestPasswordReset('test@test.com', 'turnstile-abc');
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.turnstileToken).toBe('turnstile-abc');
    });
  });

  // ─── resetPassword ─────────────────────────────────────

  describe('resetPassword', () => {
    it('should call reset-password endpoint', async () => {
      mockFetchResponse({ success: true });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword('reset-token', 'newPass123');
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.token).toBe('reset-token');
      expect(body.newPassword).toBe('newPass123');
    });
  });

  // ─── refreshAccessToken ────────────────────────────────

  describe('refreshAccessToken', () => {
    it('should refresh token and update state', async () => {
      // First sign in
      mockFetchResponse({
        accessToken: 'jwt-1',
        refreshToken: 'refresh-1',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      // Then refresh
      mockFetchResponse({
        accessToken: 'jwt-2',
        refreshToken: 'refresh-2',
      });

      let newTokens;
      await act(async () => {
        newTokens = await result.current.refreshAccessToken('refresh-1');
      });

      expect((newTokens as any).accessToken).toBe('jwt-2');
      expect(result.current.tokens!.accessToken).toBe('jwt-2');
    });

    it('should clear state on refresh failure', async () => {
      // First sign in
      mockFetchResponse({
        accessToken: 'jwt-1',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      // Refresh fails
      mockFetchResponse({ error: 'Token expired' }, false, 401);

      await act(async () => {
        try {
          await result.current.refreshAccessToken('bad-refresh');
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.tokens).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  // ─── updateProfile ─────────────────────────────────────

  describe('updateProfile', () => {
    it('should throw when not authenticated', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.updateProfile({ name: 'Alice' });
        } catch (e: any) {
          expect(e.message).toBe('Not authenticated');
        }
      });
    });

    it('should send PATCH to /me endpoint', async () => {
      // Sign in first
      mockFetchResponse({
        accessToken: 'jwt-123',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      // Update profile - PATCH + GET for refresh
      mockFetchResponse({ success: true }); // PATCH /me
      mockFetchResponse({ id: 'u1', email: 'test@test.com', name: 'Alice' }); // GET /me (refresh)

      await act(async () => {
        await result.current.updateProfile({ name: 'Alice' });
      });

      // First call after signIn is the PATCH
      const patchCall = mockFetch.mock.calls[1];
      expect(patchCall[1].method).toBe('PATCH');
      expect(patchCall[1].headers.Authorization).toBe('Bearer jwt-123');
    });
  });

  // ─── deleteAvatar ──────────────────────────────────────

  describe('deleteAvatar', () => {
    it('should throw when not authenticated', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.deleteAvatar();
        } catch (e: any) {
          expect(e.message).toBe('Not authenticated');
        }
      });
    });

    it('should send DELETE to /me/avatar endpoint', async () => {
      // Sign in first
      mockFetchResponse({
        accessToken: 'jwt-123',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      // Delete avatar - DELETE + GET for refresh
      mockFetchResponse({ success: true }); // DELETE /me/avatar
      mockFetchResponse({ id: 'u1', email: 'test@test.com' }); // GET /me (refresh)

      await act(async () => {
        await result.current.deleteAvatar();
      });

      const deleteCall = mockFetch.mock.calls[1];
      expect(deleteCall[0]).toContain('/me/avatar');
      expect(deleteCall[1].method).toBe('DELETE');
    });
  });

  // ─── User mapping ──────────────────────────────────────

  describe('user data mapping', () => {
    it('should map profile_extras to customFields', async () => {
      mockFetchResponse({
        accessToken: 'jwt',
        user: { id: 'u1', email: 'test@test.com', profile_extras: { role: 'admin' } },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      expect(result.current.user!.customFields).toEqual({ role: 'admin' });
    });

    it('should map created_at to createdAt', async () => {
      mockFetchResponse({
        accessToken: 'jwt',
        user: { id: 'u1', email: 'test@test.com', created_at: '2024-01-01' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      expect(result.current.user!.createdAt).toBe('2024-01-01');
    });

    it('should default emailVerified to false when no timestamp', async () => {
      mockFetchResponse({
        accessToken: 'jwt',
        user: { id: 'u1', email: 'test@test.com' },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });

      expect(result.current.user!.emailVerified).toBe(false);
    });
  });
});
