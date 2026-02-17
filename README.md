# @aerostack/react

The official React SDK for Aerostack. Easily integrate authentication, database, AI, and other Aerostack services into your React applications using idiomatic Hooks.

## Installation

```bash
npm install @aerostack/react
# or
yarn add @aerostack/react
# or
pnpm add @aerostack/react
```

## Usage

### 1. Wrap your app in `AerostackProvider`

```tsx
import { AerostackProvider } from '@aerostack/react';

function App() {
  return (
    <AerostackProvider 
      projectUrl="https://your-project.aerostack.dev" 
      apiKey="your-public-api-key"
    >
      <YourComponent />
    </AerostackProvider>
  );
}
```

### 2. Use Hooks

#### Authentication

```tsx
import { useAuth } from '@aerostack/react';

function LoginButton() {
  const { signIn, user, isLoading } = useAuth();

  if (user) return <div>Welcome, {user.email}</div>;

  return (
    <button onClick={() => signIn('email', 'password')}>
      {isLoading ? 'Loading...' : 'Sign In'}
    </button>
  );
}
```

#### Database

```tsx
import { useDb } from '@aerostack/react';

function TodoList() {
  const { data: todos, isLoading } = useDb('todos').find();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
    </ul>
  );
}
```

#### AI Chat

```tsx
import { useAI } from '@aerostack/react';

function ChatBot() {
  const { messages, sendMessage } = useAI('support-agent');

  return (
    <div>
      {messages.map(m => <div>{m.content}</div>)}
      <button onClick={() => sendMessage("Hello!")}>Say Hi</button>
    </div>
  );
  );
}
```

## SSR and Backend Integration

### Client-Side Only (SPA)
This SDK is designed for **client-side React apps**. Hooks like `useAuth()` run in the browser.

### Server-Side Rendering (Next.js, Remix)
For SSR frameworks, use different approaches for server vs. client:

**Server-side (data fetching, API routes)**:
```tsx
// app/api/users/route.ts (Next.js App Router)
import { SDK } from '@aerostack/node';

export async function GET() {
  const sdk = new SDK({ apiKeyAuth: process.env.AEROSTACK_API_KEY });
  const users = await sdk.database.dbQuery({
    sql: 'SELECT * FROM users'
  });
  return Response.json(users);
}
```

**Client-side (React components)**:
```tsx
'use client'; // Next.js 13+
import { AerostackProvider, useAuth } from '@aerostack/react';

function ClientComponent() {
  const { user } = useAuth();
  return <div>{user?.email}</div>;
}
```

### Backend Worker Pattern
If building Cloudflare Workers that need both client Auth and server bindings:
```typescript
import { AerostackClient, AerostackServer } from '@aerostack/sdk';

// Use both SDKs as needed
const client = new AerostackClient({ projectSlug: "my-project" });
const server = new AerostackServer(env);
```

See [`@aerostack/sdk` documentation](../sdk/README.md#backend-wrapper-pattern) for details.

## Documentation

For full documentation, visit [docs.aerostack.dev](https://docs.aerostack.dev/sdk/react).
