# @aerostack/react Examples

Examples for `@aerostack/react`.

## Prerequisites

```bash
npm install @aerostack/react @aerostack/sdk
```

## Available Examples

| Example | Description | Pattern |
|---------|-------------|---------|
| [**Basic Auth App**](./basic-auth-app.tsx) | Complete Login/Logout flow using `useAuth`. | Client-Side |
| [**Protected Routes**](./protected-routes.tsx) | Wrapper component for React Router. | Routing |
| [**Next.js App Router**](./next-app-router.tsx) | Server Components integration pattern. | Next.js 13+ |

## Config

Wrap your app root:

```tsx
<AerostackProvider projectSlug="my-app">
  <App />
</AerostackProvider>
```
