import 'package:dio/dio.dart';

class CacheService {
  final Dio _dio;

  CacheService(this._dio);

  Future<Map<String, dynamic>> cacheGet(String key) async {
    final response = await _dio.post('/cache/get', data: {'key': key});
    return response.data;
  }

  Future<bool> cacheSet(String key, dynamic value, [int? ttl]) async {
    final response = await _dio.post('/cache/set', data: {
      'key': key,
      'value': value,
      'ttl': ttl,
    });
    return response.data['success'] ?? false;
  }
}