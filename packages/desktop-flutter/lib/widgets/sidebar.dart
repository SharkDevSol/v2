import 'package:flutter/material.dart';
import '../config/app_colors.dart';

enum MenuItem {
  dashboard,
  students,
  staff,
  attendance,
  marks,
  schedule,
  finance,
  hr,
  reports,
  settings,
}

class SidebarItem {
  final MenuItem item;
  final String title;
  final IconData icon;
  final List<MenuItem>? children;

  const SidebarItem({
    required this.item,
    required this.title,
    required this.icon,
    this.children,
  });
}

class SidebarWidget extends StatefulWidget {
  final MenuItem selectedItem;
  final ValueChanged<MenuItem> onItemSelected;

  const SidebarWidget({
    super.key,
    required this.selectedItem,
    required this.onItemSelected,
  });

  @override
  State<SidebarWidget> createState() => _SidebarWidgetState();
}

class _SidebarWidgetState extends State<SidebarWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _expandController;
  late Animation<double> _expandAnimation;
  bool _isExpanded = true;

  static const _menuItems = [
    SidebarItem(
        item: MenuItem.dashboard,
        title: 'Dashboard',
        icon: Icons.dashboard_rounded),
    SidebarItem(
        item: MenuItem.students,
        title: 'Students',
        icon: Icons.school_rounded),
    SidebarItem(
        item: MenuItem.staff, title: 'Staff', icon: Icons.badge_rounded),
    SidebarItem(
        item: MenuItem.attendance,
        title: 'Attendance',
        icon: Icons.calendar_today_rounded),
    SidebarItem(
        item: MenuItem.marks,
        title: 'Marks & Grades',
        icon: Icons.assessment_rounded),
    SidebarItem(
        item: MenuItem.schedule,
        title: 'Schedule',
        icon: Icons.schedule_rounded),
    SidebarItem(
        item: MenuItem.finance,
        title: 'Finance',
        icon: Icons.account_balance_wallet_rounded),
    SidebarItem(
        item: MenuItem.hr,
        title: 'HR & Payroll',
        icon: Icons.people_rounded),
    SidebarItem(
        item: MenuItem.reports,
        title: 'Reports',
        icon: Icons.bar_chart_rounded),
    SidebarItem(
        item: MenuItem.settings,
        title: 'Settings',
        icon: Icons.settings_rounded),
  ];

  @override
  void initState() {
    super.initState();
    _expandController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _expandAnimation = CurvedAnimation(
      parent: _expandController,
      curve: Curves.easeInOut,
    );
    _expandController.forward();
  }

  @override
  void dispose() {
    _expandController.dispose();
    super.dispose();
  }

  void toggleExpand() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _expandController.forward();
      } else {
        _expandController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AnimatedBuilder(
      animation: _expandAnimation,
      builder: (context, child) {
        final width = _isExpanded ? 260.0 : 72.0;
        return Container(
          width: width,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            border: Border(
              right: BorderSide(
                color: isDark
                    ? Colors.grey[800]!
                    : AppColors.border,
                width: 1,
              ),
            ),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black26 : Colors.black.withValues(alpha: 0.05),
                blurRadius: 8,
                offset: const Offset(2, 0),
              ),
            ],
          ),
          child: Column(
            children: [
              _buildHeader(isDark),
              const SizedBox(height: 8),
              _buildToggleButton(isDark),
              const Divider(height: 1),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount: _menuItems.length,
                  itemBuilder: (context, index) {
                    return _buildMenuItem(_menuItems[index], isDark);
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(bool isDark) {
    return Padding(
      padding: EdgeInsets.all(_isExpanded ? 20 : 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: AppColors.gradientPrimary,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Center(
              child: Text(
                'S',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                ),
              ),
            ),
          ),
          if (_isExpanded) ...[
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Skoolific',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  'Admin Panel',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildToggleButton(bool isDark) {
    return GestureDetector(
      onTap: toggleExpand,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: isDark ? Colors.grey[800] : AppColors.surface,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedRotation(
              turns: _isExpanded ? 0 : 0.5,
              duration: const Duration(milliseconds: 300),
              child: Icon(
                Icons.chevron_left_rounded,
                size: 20,
                color: isDark ? Colors.grey[400] : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(SidebarItem menuItem, bool isDark) {
    final isSelected = widget.selectedItem == menuItem.item;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(10),
            onTap: () => widget.onItemSelected(menuItem.item),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: 12,
                vertical: _isExpanded ? 12 : 14,
              ),
              child: Row(
                children: [
                  Icon(
                    menuItem.icon,
                    size: 22,
                    color: isSelected
                        ? AppColors.primary
                        : (isDark ? Colors.grey[400] : AppColors.textSecondary),
                  ),
                  if (_isExpanded) ...[
                    const SizedBox(width: 14),
                    Text(
                      menuItem.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected
                            ? AppColors.primary
                            : (isDark
                                ? Colors.grey[300]
                                : AppColors.textPrimary),
                      ),
                    ),
                    const Spacer(),
                    if (isSelected)
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
