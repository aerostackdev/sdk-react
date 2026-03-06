/**
 * useChat — Streaming chat hook for Aerostack AI Gateway.
 *
 * A clean, developer-friendly alias of `useGatewayChat` with identical API.
 * Use this when building custom chat UIs on top of an Aerostack AI gateway.
 *
 * ```tsx
 * const { messages, sendMessage, isStreaming, error, wallet, clearMessages } = useChat({
 *   apiSlug: 'my-chatbot',
 *   consumerKey: process.env.NEXT_PUBLIC_CONSUMER_KEY,
 *   welcomeMessage: 'Hi! How can I help?',
 * });
 *
 * // With user JWT (Aerostack auth)
 * const { tokens } = useAuth();
 * const chat = useChat({ apiSlug: 'my-chatbot', token: tokens?.accessToken });
 * ```
 */

export {
    useGatewayChat as useChat,
    type UseGatewayChatOptions as UseChatOptions,
    type UseGatewayChatReturn as UseChatReturn,
} from './useGateway.js';
