# @aerostack/sdk-react-native

The official React Native SDK for Aerostack. Compatible with Expo and bare React Native projects.

## Installation

```bash
npm install @aerostack/sdk-react-native
# or
yarn add @aerostack/sdk-react-native
```

> **Note**: This SDK uses standard fetch and web-compatible APIs, so it requires no native linking in Expo managed workflows.

## Usage

### Initialization

```typescript
import { Aerostack } from '@aerostack/sdk-react-native';

const client = new Aerostack({
  projectUrl: 'https://your-project.aerostack.app',
  apiKey: 'your-public-api-key',
});
```

### Authentication

```typescript
try {
  const session = await client.auth.signIn({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Logged in:', session.user.id);
} catch (error) {
  console.error('Login failed:', error);
}
```

### Database

```typescript
// Fetch data
const users = await client.db.query('SELECT * FROM users LIMIT 5');
```

## Documentation

For full documentation, visit [docs.aerostack.ai](https://docs.aerostack.ai/sdk/react-native).
