import 'package:dio/dio.dart';

class QueueService {
  final Dio _dio;

  QueueService(this._dio);

  Future<Map<String, dynamic>> enqueue(String type, Map<String, dynamic> data, [int? delay]) async {
    final response = await _dio.post('/queue/enqueue', data: {
      'type': type,
      'data': data,
      'delay': delay,
    });
    return response.data;
  }
}