class DashboardStats {
  final int totalStudents;
  final int totalStaff;
  final int totalClasses;
  final double attendanceRate;
  final int maleStudents;
  final int femaleStudents;
  final int totalFaults;
  final double averageScore;
  final double totalRevenue;
  final int totalPayments;
  final List<ClassRanking> classRankings;
  final List<TopPerformer> topPerformers;
  final List<RecentActivity> recentActivity;

  DashboardStats({
    required this.totalStudents,
    required this.totalStaff,
    required this.totalClasses,
    required this.attendanceRate,
    this.maleStudents = 0,
    this.femaleStudents = 0,
    this.totalFaults = 0,
    this.averageScore = 0,
    this.totalRevenue = 0,
    this.totalPayments = 0,
    this.classRankings = const [],
    this.topPerformers = const [],
    this.recentActivity = const [],
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    final basic = json['basic'] ?? json;
    final attendance = json['attendance'] ?? {};
    final academic = json['academic'] ?? {};
    final finance = json['finance'] ?? {};
    final gender = basic['gender'] ?? {};

    return DashboardStats(
      totalStudents: basic['totalStudents'] ?? basic['students'] ?? 0,
      totalStaff: basic['staffCount'] ?? basic['staff'] ?? 0,
      totalClasses: basic['totalClasses'] ?? basic['classes'] ?? 0,
      attendanceRate: _parseDouble(attendance['rate'] ?? 0),
      maleStudents: gender['male'] ?? 0,
      femaleStudents: gender['female'] ?? 0,
      totalFaults: basic['totalFaults'] ?? 0,
      averageScore: _parseDouble(academic['averageScore'] ?? 0),
      totalRevenue: _parseDouble(finance['totalCollected'] ?? 0),
      totalPayments: finance['paymentCount'] ?? 0,
      classRankings: (academic['classRankings'] as List?)
              ?.map((e) => ClassRanking.fromJson(e))
              .toList() ??
          [],
      topPerformers: (academic['topPerformers'] as List?)
              ?.map((e) => TopPerformer.fromJson(e))
              .toList() ??
          [],
      recentActivity: (json['recentActivity'] as List?)
              ?.map((e) => RecentActivity.fromJson(e))
              .toList() ??
          [],
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    return double.tryParse(value.toString()) ?? 0;
  }

  double get attendancePercentage => attendanceRate * 100;
}

class ClassRanking {
  final String className;
  final int position;
  final int studentCount;
  final double averageScore;

  ClassRanking({
    required this.className,
    required this.position,
    required this.studentCount,
    required this.averageScore,
  });

  factory ClassRanking.fromJson(Map<String, dynamic> json) {
    return ClassRanking(
      className: json['className'] ?? '',
      position: json['position'] ?? 0,
      studentCount: json['studentCount'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
    );
  }
}

class TopPerformer {
  final String name;
  final String? className;
  final double score;

  TopPerformer({
    required this.name,
    this.className,
    required this.score,
  });

  factory TopPerformer.fromJson(Map<String, dynamic> json) {
    return TopPerformer(
      name: json['name'] ?? json['studentName'] ?? '',
      className: json['className'],
      score: (json['score'] ?? json['averageScore'] ?? 0).toDouble(),
    );
  }
}

class RecentActivity {
  final String type;
  final String description;
  final String? timestamp;

  RecentActivity({
    required this.type,
    required this.description,
    this.timestamp,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      type: json['type'] ?? 'info',
      description: json['description'] ?? json['message'] ?? '',
      timestamp: json['timestamp'] ?? json['time'],
    );
  }
}
