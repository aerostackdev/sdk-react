import 'package:json_annotation/json_annotation.dart';

part 'auth_models.g.dart';

@JsonSerializable()
class AuthResponse {
  final String token;
  final User user;
  final String expiresAt;

  AuthResponse({required this.token, required this.user, required this.expiresAt});

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);

  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

@JsonSerializable()
class User {
  final String id;
  final String email;
  final String? name;
  final String createdAt;
  final Map<String, dynamic> metadata;

  User({required this.id, required this.email, this.name, required this.createdAt, required this.metadata});

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);
}