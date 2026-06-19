import 'user.dart';

class LoginResponse {
  final bool success;
  final String message;
  final String? token;
  final User? user;

  LoginResponse({
    required this.success,
    required this.message,
    this.token,
    this.user,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      success: json['success'] ?? json['status'] == 'success' ?? false,
      message: json['message'] ?? '',
      token: json['token'],
      user: json['user'] != null
          ? User.fromJson(json['user'], token: json['token'])
          : null,
    );
  }
}
