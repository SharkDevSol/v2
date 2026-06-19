import 'package:flutter/foundation.dart';
import '../config/api_config.dart';
import '../models/dashboard_stats.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  final ApiService _api;

  DashboardStats? _stats;
  bool _isLoading = false;
  String? _error;

  DashboardProvider(this._api);

  DashboardStats? get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadStats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final json = await _api.get(ApiConfig.dashboardEnhanced);
      if (json['status'] == 'success') {
        _stats = DashboardStats.fromJson(json);
      } else {
        // Fallback to legacy stats
        final legacyJson = await _api.get(ApiConfig.dashboardStats);
        _stats = DashboardStats.fromJson(legacyJson);
      }
    } catch (e) {
      _error = e.toString();
      _stats = _getMockStats();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> refresh() async {
    await loadStats();
  }

  DashboardStats _getMockStats() {
    return DashboardStats(
      totalStudents: 0,
      totalStaff: 0,
      totalClasses: 0,
      attendanceRate: 0,
    );
  }
}
