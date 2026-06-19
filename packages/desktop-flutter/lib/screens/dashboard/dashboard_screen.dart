import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../config/app_colors.dart';
import '../../models/dashboard_stats.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/loading_shimmer.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _refreshAnimController;

  @override
  void initState() {
    super.initState();
    _refreshAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadStats();
    });
  }

  @override
  void dispose() {
    _refreshAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = context.watch<AuthProvider>();
    final dashProvider = context.watch<DashboardProvider>();

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF0F172A)
          : const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(isDark, authProvider),
            Expanded(
              child: dashProvider.isLoading
                  ? const Padding(
                      padding: EdgeInsets.all(24),
                      child: DashboardShimmer(),
                    )
                  : _buildContent(isDark, dashProvider.stats),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark, AuthProvider auth) {
    final now = DateTime.now();
    final greeting = _getGreeting(now.hour);
    final formattedDate = DateFormat('EEEE, MMMM d, yyyy').format(now);

    return Container(
      padding: const EdgeInsets.fromLTRB(32, 20, 32, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    greeting,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: isDark ? Colors.grey[400] : AppColors.textLight,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Welcome back, ${auth.user?.name ?? auth.user?.username ?? 'Admin'}',
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    formattedDate,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: isDark ? Colors.grey[500] : AppColors.textLight,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  if (auth.user?.branchCode != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                            colors: AppColors.gradientPrimary),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.business_rounded,
                              size: 14, color: Colors.white.withValues(alpha: 0.9)),
                          const SizedBox(width: 6),
                          Text(
                            auth.user!.branchCode!,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(width: 12),
                  _buildIconButton(
                    isDark,
                    Icons.refresh_rounded,
                    () {
                      _refreshAnimController.forward().then((_) {
                        context.read<DashboardProvider>().refresh();
                        _refreshAnimController.reverse();
                      });
                    },
                  ),
                  const SizedBox(width: 8),
                  _buildAvatar(auth),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildAvatar(AuthProvider auth) {
    final name =
        auth.user?.name ?? auth.user?.username ?? 'A';
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'A';

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: AppColors.gradientPrimary),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(
          initial,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  Widget _buildIconButton(bool isDark, IconData icon, VoidCallback onTap) {
    return Material(
      color: isDark ? Colors.grey[800] : Colors.white,
      borderRadius: BorderRadius.circular(12),
      elevation: 0,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isDark ? Colors.grey[700]! : AppColors.border,
            ),
          ),
          child: Icon(
            icon,
            size: 20,
            color: isDark ? Colors.grey[300] : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildContent(bool isDark, DashboardStats? stats) {
    if (stats == null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded,
                size: 64, color: isDark ? Colors.grey[700] : Colors.grey[300]),
            const SizedBox(height: 16),
            Text('Unable to load dashboard data',
                style: TextStyle(
                    color: isDark ? Colors.grey[400] : Colors.grey[500])),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: () => context.read<DashboardProvider>().refresh(),
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(32, 0, 32, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatsGrid(stats),
          const SizedBox(height: 28),
          _buildChartsRow(isDark, stats),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(DashboardStats stats) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 900
            ? 4
            : constraints.maxWidth > 600
                ? 2
                : 1;

        return GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.5,
          children: [
            StatCard(
              title: 'Total Students',
              value: _formatNumber(stats.totalStudents),
              icon: Icons.school_rounded,
              subtitle:
                  '${stats.maleStudents} ♂  ${stats.femaleStudents} ♀',
            ),
            StatCard(
              title: 'Staff Members',
              value: _formatNumber(stats.totalStaff),
              icon: Icons.badge_rounded,
            ),
            StatCard(
              title: 'Classes',
              value: _formatNumber(stats.totalClasses),
              icon: Icons.meeting_room_rounded,
            ),
            StatCard(
              title: 'Attendance Rate',
              value: '${stats.attendancePercentage.toStringAsFixed(1)}%',
              icon: Icons.check_circle_rounded,
              gradientColors: AppColors.gradientSuccess,
            ),
          ],
        );
      },
    );
  }

  Widget _buildChartsRow(bool isDark, DashboardStats stats) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: _buildClassRankingsCard(isDark, stats.classRankings),
        ),
        const SizedBox(width: 24),
        Expanded(
          flex: 2,
          child: _buildTopPerformersCard(isDark, stats.topPerformers),
        ),
      ],
    );
  }

  Widget _buildClassRankingsCard(
      bool isDark, List<ClassRanking> rankings) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Class Rankings',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : AppColors.textPrimary,
                  ),
                ),
                Text(
                  'Avg Score',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.grey[500] : AppColors.textLight,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (rankings.isEmpty)
              _buildEmptyState(isDark, 'No class ranking data available')
            else
              ...rankings.take(8).map((r) => _buildRankingRow(isDark, r)),
          ],
        ),
      ),
    );
  }

  Widget _buildRankingRow(bool isDark, ClassRanking rank) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: rank.position <= 3
                  ? [AppColors.accentCyan, AppColors.accentGreen,
                      AppColors.accent][rank.position - 1]
                  : (isDark ? Colors.grey[700] : Colors.grey[200]),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                '${rank.position}',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: rank.position <= 3
                      ? Colors.white
                      : (isDark ? Colors.grey[400] : AppColors.textSecondary),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              rank.className,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.grey[300] : AppColors.textPrimary,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: (rank.averageScore >= 80
                      ? AppColors.accentGreen
                      : rank.averageScore >= 60
                          ? AppColors.accent
                          : AppColors.accentRed)
                  .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              rank.averageScore.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: rank.averageScore >= 80
                    ? AppColors.accentGreen
                    : rank.averageScore >= 60
                        ? AppColors.accent
                        : AppColors.accentRed,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopPerformersCard(
      bool isDark, List<TopPerformer> performers) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Top Performers',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            if (performers.isEmpty)
              _buildEmptyState(isDark, 'No performer data available')
            else
              ...performers.take(5).map((p) => _buildPerformerRow(isDark, p)),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformerRow(bool isDark, TopPerformer performer) {
    final initials = performer.name.isNotEmpty
        ? performer.name
            .split(' ')
            .map((e) => e.isNotEmpty ? e[0] : '')
            .take(2)
            .join()
            .toUpperCase()
        : '?';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            child: Text(
              initials,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  performer.name,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.grey[300] : AppColors.textPrimary,
                  ),
                ),
                if (performer.className != null)
                  Text(
                    performer.className!,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.grey[500] : AppColors.textLight,
                    ),
                  ),
              ],
            ),
          ),
          Text(
            performer.score.toStringAsFixed(1),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.accentGreen,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isDark, String message) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.inbox_rounded,
                size: 40, color: isDark ? Colors.grey[700] : Colors.grey[300]),
            const SizedBox(height: 8),
            Text(
              message,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.grey[500] : Colors.grey[400],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getGreeting(int hour) {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  String _formatNumber(dynamic number) {
    if (number == null) return '0';
    final n = number is int ? number : number.round();
    if (n >= 1000) {
      return NumberFormat.compact().format(n);
    }
    return n.toString();
  }
}
