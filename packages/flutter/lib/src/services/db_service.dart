import 'package:dio/dio.dart';
import '../models/db_models.dart';

class DbService {
  final Dio _dio;

  DbService(this._dio);

  Future<DbQueryResult> dbQuery(String sql, [List<dynamic>? params]) async {
    final response = await _dio.post('/db/query', data: {
      'sql': sql,
      'params': params,
    });
    return DbQueryResult.fromJson(response.data);
  }
}