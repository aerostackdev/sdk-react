import 'package:dio/dio.dart';
import '../models/auth_models.dart';

class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  Future<AuthResponse> authSignin(String email, String password) async {
    final response = await _dio.post('/auth/signin', data: {
      'email': email,
      'password': password,
    });
    return AuthResponse.fromJson(response.data);
  }

  Future<AuthResponse> authSignup(String email, String password, [String? name, Map<String, dynamic>? metadata]) async {
    final response = await _dio.post('/auth/signup', data: {
      'email': email,
      'password': password,
      'name': name,
      'metadata': metadata,
    });
    return AuthResponse.fromJson(response.data);
  }
}