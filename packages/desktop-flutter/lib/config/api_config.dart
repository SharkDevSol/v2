class ApiConfig {
  ApiConfig._();

  static const String baseUrl = 'http://localhost:5052';
  static const String apiPrefix = '/api';

  static const Duration timeout = Duration(seconds: 30);

  // Auth
  static const String adminLogin = '$apiPrefix/admin/login';
  static const String branchLogin = '$apiPrefix/v2/branches/login';
  static const String verifyToken = '$apiPrefix/admin/verify-token';

  // Dashboard
  static const String dashboardStats = '$apiPrefix/dashboard/stats';
  static const String dashboardEnhanced =
      '$apiPrefix/dashboard/enhanced-stats';

  // Students
  static const String studentList = '$apiPrefix/students';
  static const String studentProfile = '$apiPrefix/students/profile';

  // Staff
  static const String staffList = '$apiPrefix/staff';
  static const String staffProfile = '$apiPrefix/staff/profile';

  // Collections
  static const String collections = '$apiPrefix/collections';
  static const String collectionsWithDetails =
      '$apiPrefix/collections/with-details';
  static const String collectionById = '$apiPrefix/collections';
  static const String collectionActivity = '$apiPrefix/collections/activity';

  // Sales
  static const String sales = '$apiPrefix/sales';
  static const String salesToday = '$apiPrefix/sales/today';
  static const String salesByDateRange = '$apiPrefix/sales/date-range';

  // Health
  static const String health = '$apiPrefix/health';
  static const String healthSetupStatus = '$apiPrefix/health/setup-status';
}
