import 'package:json_annotation/json_annotation.dart';

part 'db_models.g.dart';

@JsonSerializable()
class DbQueryResult {
  final List<Map<String, dynamic>> results;
  final int count;

  DbQueryResult({required this.results, required this.count});

  factory DbQueryResult.fromJson(Map<String, dynamic> json) => _$DbQueryResultFromJson(json);

  Map<String, dynamic> toJson() => _$DbQueryResultToJson(this);
}