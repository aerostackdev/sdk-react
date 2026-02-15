import 'package:dio/dio.dart';

class AIService {
  final Dio _dio;

  AIService(this._dio);

  Future<String> aiChat(String model, List<Map<String, String>> messages) async {
    final response = await _dio.post('/ai/chat', data: {
      'model': model,
      'messages': messages,
    });
    return response.data['response'];
  }
}