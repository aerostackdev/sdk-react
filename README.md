# @aerostack/react

[![npm version](https://img.shields.io/npm/v/@aerostack/react.svg)](https://www.npmjs.com/package/@aerostack/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official React SDK for Aerostack. Integrate authentication, database, AI, caching, realtime subscriptions, and more into your React apps using idiomatic hooks.

## Features

- **`useAuth`** — Full authentication: sign-in, sign-up, OTP, password reset, email verification, profile management
- **`useDb`** — Execute SQL queries with loading/error states
- **`useAI`** — AI chat completions
- **`useGatewayChat`** — Streaming chat UI with token counting and abort support
- **`useCache`** — Key-value cache get/set operations
- **`useSubscription`** — Realtime WebSocket subscriptions for database changes
- **`useVectorSearch`** — Semantic search: ingest, query, delete, update, configure
- **`useStream`** — Low-level SSE streaming with custom extractors
- **`useTokenBalance`** — Gateway token wallet balance
- **`useRealtimeStatus`** — Monitor WebSocket connection status

## Installation

```bash
npm install @aerostack/react
# or
yarn add @aerostack/react
# or
pnpm add @aerostack/react
```

### Peer Dependencies

This package requires React 18+ and `@aerostack/sdk-web`.

## Quick Start

### 1. Wrap Your App in `AerostackProvider`

```tsx
import { AerostackProvider } from '@aerostack/react';

function App() {
  return (
    <AerostackProvider
      projectUrl="https://your-project.aerostack.dev"
      apiKey="your-public-api-key"
    >
      <YourApp />
    </AerostackProvider>
  );
}
```

### 2. Use Hooks in Your Components

```tsx
import { useAuth, useDb } from '@aerostack/react';

function Dashboard() {
  const { user, signOut } = useAuth();
  const { data: todos, isLoading } = useDb('todos').find();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <ul>
        {todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
      </ul>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Hooks Reference

### `useAuth()`

Full-featured authentication hook with session management.

```tsx
const {
  user,           // Current user object (or null)
  isLoading,      // Loading state
  signIn,         // (email, password) => Promise
  signUp,         // (email, password, options?) => Promise
  signOut,        // () => Promise
  sendOTP,        // (destination, type) => Promise
  verifyOTP,      // (code, destination) => Promise
  verifyEmail,    // (token) => Promise
  requestPasswordReset,  // (email) => Promise
  resetPassword,         // (token, password) => Promise
  refreshAccessToken,    // () => Promise
  refreshUser,           // () => Promise
  updateProfile,         // (data) => Promise
  deleteAvatar,          // () => Promise
} = useAuth();
```

**Example: Login form**

```tsx
function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</button>
    </form>
  );
}
```

### `useGatewayChat()`

Streaming AI chat with token-by-token rendering.

```tsx
const {
  messages,       // Array of chat messages
  sendMessage,    // (content: string) => void
  isStreaming,    // Whether a response is currently streaming
  clearMessages,  // () => void
  wallet,         // Token balance info
} = useGatewayChat({ consumerKey: 'your-consumer-key' });
```

**Example: Chat interface**

```tsx
function ChatUI() {
  const { messages, sendMessage, isStreaming } = useGatewayChat({
    consumerKey: 'ck_...',
  });
  const [input, setInput] = useState('');

  return (
    <div>
      {messages.map((m, i) => (
        <div key={i} className={m.role}>{m.content}</div>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button
        disabled={isStreaming}
        onClick={() => { sendMessage(input); setInput(''); }}
      >
        Send
      </button>
    </div>
  );
}
```

### `useSubscription(topic, event, callback)`

Realtime database change subscriptions via WebSocket.

```tsx
function LiveTodos() {
  const [todos, setTodos] = useState([]);

  useSubscription('todos', 'INSERT', (payload) => {
    setTodos(prev => [...prev, payload.new]);
  });

  useSubscription('todos', 'DELETE', (payload) => {
    setTodos(prev => prev.filter(t => t.id !== payload.old.id));
  });

  return <ul>{todos.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

### `useVectorSearch()`

Semantic search operations for RAG and AI-powered search.

```tsx
const {
  ingest,       // (content, type, id) => Promise
  query,        // (query, options?) => Promise<results>
  remove,       // (id) => Promise
  deleteByType, // (type) => Promise
  update,       // (id, content) => Promise
  listTypes,    // () => Promise<types[]>
  count,        // (type?) => Promise<number>
  get,          // (id) => Promise
  configure,    // (options) => Promise
} = useVectorSearch();
```

### `useDb()`

```tsx
const { data, isLoading, error } = useDb('table_name').find();
```

### `useCache()`

```tsx
const { get, set } = useCache();
const value = await get('my-key');
await set('my-key', 'my-value', { ttl: 3600 });
```

### `useRealtimeStatus()`

```tsx
const status = useRealtimeStatus();
// 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
```

## SSR and Framework Integration

### Client-Side Only (SPA)

All hooks run in the browser. For SPAs (Create React App, Vite), use directly.

### Next.js App Router

Use `'use client'` directive for components with Aerostack hooks:

```tsx
// app/layout.tsx (Server Component)
import { ClientProviders } from './providers';

export default function Layout({ children }) {
  return <ClientProviders>{children}</ClientProviders>;
}
```

```tsx
// app/providers.tsx (Client Component)
'use client';
import { AerostackProvider } from '@aerostack/react';

export function ClientProviders({ children }) {
  return (
    <AerostackProvider projectUrl="..." apiKey="...">
      {children}
    </AerostackProvider>
  );
}
```

### Server-Side Data Fetching

For server-side API calls (API routes, server components), use the Node SDK:

```tsx
// app/api/users/route.ts
import { SDK } from '@aerostack/node';

const sdk = new SDK({ apiKeyAuth: process.env.AEROSTACK_API_KEY });

export async function GET() {
  const users = await sdk.database.dbQuery({ sql: 'SELECT * FROM users' });
  return Response.json(users);
}
```

### Backend Worker Pattern

For Cloudflare Workers that need both client auth and server bindings:

```typescript
import { AerostackClient, AerostackServer } from '@aerostack/sdk';

const client = new AerostackClient({ projectSlug: 'my-project' });
const server = new AerostackServer(env);
```

See [`@aerostack/sdk` documentation](../sdk/README.md) for details.

## Related Packages

| Package | Use Case |
|---------|----------|
| [`@aerostack/web`](../web) | Vanilla JS / non-React browser apps |
| [`@aerostack/node`](../node) | Node.js server-side |
| [`@aerostack/react-native`](../react-native) | React Native mobile apps |
| [`@aerostack/sdk`](../sdk) | Cloudflare Workers (server + client) |

## Documentation

For full documentation, visit [docs.aerostack.dev](https://docs.aerostack.dev/sdk/react).

## License

MIT
