import 'package:dio/dio.dart';

import 'services/auth_service.dart';
import 'services/db_service.dart';
import 'services/ai_service.dart';
import 'services/cache_service.dart';
import 'services/storage_service.dart';
import 'services/queue_service.dart';

class Aerostack {
  final Dio _dio;

  Aerostack({required String baseUrl, required String apiKey}) : _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      headers: {'X-Aerostack-Key': apiKey},
    ),
  );

  AuthService get auth => AuthService(_dio);

  DbService get db => DbService(_dio);

  AIService get ai => AIService(_dio);

  CacheService get cache => CacheService(_dio);

  StorageService get storage => StorageService(_dio);

  QueueService get queue => QueueService(_dio);
}