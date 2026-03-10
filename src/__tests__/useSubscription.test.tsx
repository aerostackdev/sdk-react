// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSubscription, useRealtimeStatus } from '../hooks/useSubscription';

const mockChannel = {
    on: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
};
const mockConnect = vi.fn();
const mockOnStatusChange = vi.fn();
const mockRealtimeChannel = vi.fn(() => mockChannel);

vi.mock('../context.js', () => ({
    useAerostack: () => ({
        baseUrl: 'https://api.test.com/v1',
        projectId: 'test-project',
        sdk: {
            realtime: {
                channel: mockRealtimeChannel,
                connect: mockConnect,
                onStatusChange: mockOnStatusChange,
                status: 'idle',
            },
        },
    }),
}));

describe('useSubscription', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockConnect.mockResolvedValue(undefined);
    });

    describe('initial state', () => {
        it('should start with data=null and loading=true', () => {
            const { result } = renderHook(() => useSubscription('test-topic'));
            expect(result.current.data).toBeNull();
            expect(result.current.loading).toBe(true);
            expect(result.current.error).toBeNull();
        });
    });

    describe('channel setup', () => {
        it('should create channel with topic', () => {
            renderHook(() => useSubscription('my-topic'));
            expect(mockRealtimeChannel).toHaveBeenCalledWith('my-topic', expect.any(Object));
        });

        it('should call connect and subscribe', async () => {
            renderHook(() => useSubscription('my-topic'));

            // Wait for async setup
            await vi.waitFor(() => {
                expect(mockConnect).toHaveBeenCalled();
                expect(mockChannel.subscribe).toHaveBeenCalled();
            });
        });

        it('should listen for all events', async () => {
            renderHook(() => useSubscription('my-topic'));

            await vi.waitFor(() => {
                expect(mockChannel.on).toHaveBeenCalledWith('*', expect.any(Function));
            });
        });
    });

    describe('cleanup', () => {
        it('should unsubscribe on unmount', () => {
            const { unmount } = renderHook(() => useSubscription('my-topic'));
            unmount();
            expect(mockChannel.unsubscribe).toHaveBeenCalled();
        });
    });
});

describe('useRealtimeStatus', () => {
    it('should return current status', () => {
        const { result } = renderHook(() => useRealtimeStatus());
        expect(result.current).toBe('idle');
    });
});
