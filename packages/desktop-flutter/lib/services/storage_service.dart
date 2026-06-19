import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class StorageService {
  static const _tokenKey = 'auth_token';
  static const _userKey = 'user_data';
  static const _branchCodeKey = 'branch_code';
  static const _rememberMeKey = 'remember_me';
  static const _themeKey = 'theme_mode';

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<void> saveCredentials({
    required String token,
    required User user,
    String? branchCode,
    bool rememberMe = true,
  }) async {
    if (!rememberMe) return;

    await _prefs?.setString(_tokenKey, token);
    await _prefs?.setString(_userKey, jsonEncode(user.toJson()));
    if (branchCode != null) {
      await _prefs?.setString(_branchCodeKey, branchCode);
    }
  }

  String? getToken() {
    return _prefs?.getString(_tokenKey);
  }

  User? getUser() {
    final userData = _prefs?.getString(_userKey);
    if (userData == null) return null;
    try {
      return User.fromJson(jsonDecode(userData));
    } catch (e) {
      return null;
    }
  }

  Future<void> clearCredentials() async {
    await _prefs?.remove(_tokenKey);
    await _prefs?.remove(_userKey);
    await _prefs?.remove(_branchCodeKey);
  }

  bool getRememberMe() {
    return _prefs?.getBool(_rememberMeKey) ?? false;
  }

  Future<void> setRememberMe(bool value) async {
    await _prefs?.setBool(_rememberMeKey, value);
  }

  bool getIsDarkMode() {
    return _prefs?.getBool(_themeKey) ?? false;
  }

  Future<void> setIsDarkMode(bool value) async {
    await _prefs?.setBool(_themeKey, value);
  }
}
