# Aerostack Flutter SDK

The official Flutter SDK for Aerostack. Build powerful mobile apps with unified access to database, authentication, cache, queue, storage, and AI services.

## Installation

Add this to your `pubspec.yaml`:

```yaml
dependencies:
  aerostack_sdk: ^0.1.0
```

Or run:

```bash
flutter pub add aerostack_sdk
```

## Usage

### Initialization

```dart
import 'package:aerostack_sdk/aerostack_sdk.dart';

void main() async {
  final aerostack = Aerostack(
    projectUrl: 'https://your-project.aerostack.app',
    apiKey: 'your-public-api-key',
  );
  
  runApp(MyApp(aerostack: aerostack));
}
```

### Authentication

```dart
// Sign In
final authResponse = await aerostack.auth.signIn(
  email: 'user@example.com',
  password: 'securepassword',
);

print('User ID: ${authResponse.user.id}');
```

### Database

```dart
// Query Data
final todos = await aerostack.db.query('SELECT * FROM todos WHERE completed = ?', [true]);

for (var todo in todos) {
  print(todo['title']);
}
```

### AI Services

```dart
// Chat with AI Agent
final response = await aerostack.ai.chat(
  agentId: 'support-bot',
  message: 'How do I reset my password?',
);

print(response.reply);
```

## Documentation

For full documentation, visit [docs.aerostack.ai](https://docs.aerostack.ai/sdk/flutter).
