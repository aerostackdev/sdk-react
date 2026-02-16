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
}
```

## Documentation

For full documentation, visit [docs.aerostack.dev](https://docs.aerostack.dev/sdk/react).
