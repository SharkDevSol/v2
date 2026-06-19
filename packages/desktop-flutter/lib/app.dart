import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/app_colors.dart';
import 'config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/login/login_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/students/student_list_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'widgets/sidebar.dart';

class SkoolificApp extends StatefulWidget {
  const SkoolificApp({super.key});

  @override
  State<SkoolificApp> createState() => _SkoolificAppState();
}

class _SkoolificAppState extends State<SkoolificApp>
    with SingleTickerProviderStateMixin {
  MenuItem _selectedMenuItem = MenuItem.dashboard;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthProvider>().tryAutoLogin();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final themeProvider = context.watch<ThemeProvider>();

    return MaterialApp(
      title: 'Skoolific Admin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeProvider.themeMode,
      home: _buildShell(authProvider),
    );
  }

  Widget _buildShell(AuthProvider authProvider) {
    switch (authProvider.status) {
      case AuthStatus.uninitialized:
      case AuthStatus.loading:
        return _buildSplashScreen();
      case AuthStatus.unauthenticated:
        return const LoginScreen();
      case AuthStatus.authenticated:
        return _buildMainApp();
    }
  }

  Widget _buildSplashScreen() {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF667EEA),
              Color(0xFF764BA2),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: TweenAnimationBuilder(
            tween: Tween<double>(begin: 0, end: 1),
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeOutBack,
            builder: (context, value, child) {
              return Transform.scale(
                scale: value,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Center(
                        child: Text(
                          'S',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 40,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Skoolific Admin',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildMainApp() {
    return Scaffold(
      body: Row(
        children: [
          SidebarWidget(
            selectedItem: _selectedMenuItem,
            onItemSelected: (item) {
              setState(() => _selectedMenuItem = item);
            },
          ),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              switchInCurve: Curves.easeInOut,
              switchOutCurve: Curves.easeInOut,
              child: _buildSelectedScreen(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedScreen() {
    switch (_selectedMenuItem) {
      case MenuItem.dashboard:
        return const DashboardScreen();
      case MenuItem.students:
        return const StudentListScreen();
      case MenuItem.settings:
        return const SettingsScreen();
      default:
        return _buildComingSoon();
    }
  }

  Widget _buildComingSoon() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titles = {
      MenuItem.staff: 'Staff Management',
      MenuItem.attendance: 'Attendance',
      MenuItem.marks: 'Marks & Grades',
      MenuItem.schedule: 'Schedule',
      MenuItem.finance: 'Finance',
      MenuItem.hr: 'HR & Payroll',
      MenuItem.reports: 'Reports',
    };

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.construction_rounded,
              size: 64,
              color: isDark ? Colors.grey[700] : Colors.grey[300],
            ),
            const SizedBox(height: 16),
            Text(
              titles[_selectedMenuItem] ?? 'Coming Soon',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[300] : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'This module is under development',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.grey[500] : AppColors.textLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
