import 'package:dio/dio.dart';

class StorageService {
  final Dio _dio;

  StorageService(this._dio);

  Future<Map<String, dynamic>> uploadFile(String key, MultipartFile file, [String? contentType]) async {
    final formData = FormData.fromMap({
      'key': key,
      'file': file,
      'contentType': contentType,
    });
    final response = await _dio.post('/storage/upload', data: formData);
    return response.data;
  }
}