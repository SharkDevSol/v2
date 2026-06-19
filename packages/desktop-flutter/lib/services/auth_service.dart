import '../config/api_config.dart';
import '../models/login_response.dart';
import '../models/user.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  final ApiService _api;
  final StorageService _storage;

  AuthService(this._api, this._storage);

  Future<LoginResponse> login({
    required String username,
    required String password,
    String? branchCode,
    bool rememberMe = true,
  }) async {
    final body = {
      'username': username,
      'password': password,
      if (branchCode != null && branchCode.isNotEmpty) 'branchCode': branchCode,
    };

    final json = await _api.post(ApiConfig.adminLogin, body: body);

    final response = LoginResponse.fromJson(json);

    if (response.success && response.token != null && response.user != null) {
      _api.setToken(response.token);
      if (rememberMe) {
        await _storage.saveCredentials(
          token: response.token!,
          user: response.user!,
          branchCode: branchCode,
          rememberMe: true,
        );
      }
      await _storage.setRememberMe(rememberMe);
    }

    return response;
  }

  Future<User?> tryAutoLogin() async {
    final rememberMe = _storage.getRememberMe();
    if (!rememberMe) return null;

    final token = _storage.getToken();
    final user = _storage.getUser();
    if (token != null && user != null) {
      _api.setToken(token);
      return user;
    }
    return null;
  }

  Future<void> logout() async {
    await _storage.clearCredentials();
    _api.setToken(null);
  }
}
