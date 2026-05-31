// Admin Permissions Configuration
// Defines all available admin permissions grouped by category

export const ADMIN_PERMISSIONS = {
  registration: {
    label: 'Registration',
    permissions: [
      { key: 'register_student', label: 'Register Student', path: '/create-register-student' },
      { key: 'register_staff', label: 'Register Staff', path: '/create-register-staff' },
      { key: 'student_form_builder', label: 'Student Form Builder', path: '/Student-Form-Builder' },
      { key: 'staff_form_builder', label: 'Staff Form Builder', path: '/Staff-Form-Builder' },
    ],
  },
  lists: {
    label: 'Lists',
    permissions: [
      { key: 'list_students', label: 'View Students', path: '/list-student' },
      { key: 'list_staff', label: 'View Staff', path: '/list-staff' },
      { key: 'list_guardians', label: 'View Guardians', path: '/list-guardian' },
    ],
  },
  finance: {
    label: 'Finance Management',
    permissions: [
      { key: 'finance_dashboard', label: 'Finance Dashboard', path: '/finance' },
      { key: 'fee_management', label: 'Fee Management', path: '/finance/fee-management' },
      { key: 'fee_types', label: 'Fee Types', path: '/finance/fee-types' },
      { key: 'monthly_payments', label: 'Monthly Payments', path: '/finance/monthly-payments' },
      { key: 'payment_settings', label: 'Payment Settings', path: '/finance/monthly-payment-settings' },
      { key: 'expenses', label: 'Expenses', path: '/finance/expenses' },
      { key: 'expense_approval', label: 'Expense Approval', path: '/finance/expense-approval' },
      { key: 'budgets', label: 'Budgets', path: '/finance/budgets' },
      { key: 'financial_reports', label: 'Financial Reports', path: '/finance/reports' },
      { key: 'inventory_integration', label: 'Inventory Integration', path: '/finance/inventory-integration' },
    ],
  },
  inventory: {
    label: 'Inventory & Stock',
    permissions: [
      { key: 'inventory_dashboard', label: 'Inventory Dashboard', path: '/inventory' },
      { key: 'inventory_items', label: 'Items', path: '/inventory/items' },
      { key: 'purchase_orders', label: 'Purchase Orders', path: '/inventory/purchase-orders' },
      { key: 'stock_movements', label: 'Stock Movements', path: '/inventory/movements' },
      { key: 'suppliers', label: 'Suppliers', path: '/inventory/suppliers' },
      { key: 'inventory_reports', label: 'Inventory Reports', path: '/inventory/reports' },
    ],
  },
  assets: {
    label: 'Asset Management',
    permissions: [
      { key: 'asset_dashboard', label: 'Asset Dashboard', path: '/assets' },
      { key: 'asset_registry', label: 'Asset Registry', path: '/assets/registry' },
      { key: 'asset_assignments', label: 'Assignments', path: '/assets/assignments' },
      { key: 'asset_maintenance', label: 'Maintenance', path: '/assets/maintenance' },
      { key: 'asset_depreciation', label: 'Depreciation', path: '/assets/depreciation' },
      { key: 'asset_disposal', label: 'Disposal', path: '/assets/disposal' },
      { key: 'asset_reports', label: 'Asset Reports', path: '/assets/reports' },
    ],
  },
  hr: {
    label: 'HR & Staff Management',
    permissions: [
      { key: 'hr_dashboard', label: 'HR Dashboard', path: '/hr' },
      { key: 'salary_management', label: 'Salary Management', path: '/hr/salary' },
      { key: 'staff_attendance', label: 'Attendance System', path: '/hr/attendance' },
      { key: 'device_status', label: 'Device Status', path: '/hr/device-status' },
      { key: 'attendance_time_settings', label: 'Time & Shift Settings', path: '/hr/attendance-time-settings' },
      { key: 'attendance_deduction_settings', label: 'Attendance Deductions', path: '/hr/attendance-deduction-settings' },
      { key: 'leave_management', label: 'Leave Management', path: '/hr/leave' },
      { key: 'payroll_system', label: 'Payroll System', path: '/hr/payroll' },
      { key: 'performance', label: 'Performance', path: '/hr/performance' },
      { key: 'hr_reports', label: 'HR Reports', path: '/hr/reports' },
    ],
  },
  academic: {
    label: 'Academic',
    permissions: [
      { key: 'evaluation', label: 'Evaluation', path: '/evaluation' },
      { key: 'evaluation_book', label: 'Evaluation Book', path: '/evaluation-book' },
      { key: 'evaluation_book_reports', label: 'Eval Book Reports', path: '/evaluation-book/reports' },
      { key: 'mark_list_view', label: 'Mark Lists', path: '/mark-list-view' },
      { key: 'student_attendance_system', label: 'Student Attendance (Weekly)', path: '/student-attendance-system' },
      { key: 'student_attendance_settings', label: 'Student Attendance Settings', path: '/student-attendance-time-settings' },
      { key: 'create_mark_list', label: 'Create Mark List', path: '/create-mark-list' },
      { key: 'mark_list_management', label: 'Mark List Management', path: '/Mark-List-Management' },
      { key: 'report_card', label: 'Report Card', path: '/report-card' },
      { key: 'schedule', label: 'Schedule', path: '/schedule' },
      { key: 'post', label: 'Posts', path: '/post' },
      { key: 'tasks', label: 'Tasks', path: '/tasks' },
    ],
  },
  administration: {
    label: 'Administration',
    permissions: [
      { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { key: 'communication', label: 'Communication', path: '/communication' },
      { key: 'class_teacher_assignment', label: 'Class Teachers', path: '/class-teacher-assignment' },
      { key: 'evaluation_book_assignments', label: 'Eval Book Assignments', path: '/evaluation-book/assignments' },
      { key: 'settings', label: 'Settings', path: '/settings' },
      { key: 'admin_sub_accounts', label: 'Sub-Accounts', path: '/admin-sub-accounts' },
    ],
  },
};

// Get all permission keys as a flat array
export const getAllPermissionKeys = () => {
  const keys = [];
  Object.values(ADMIN_PERMISSIONS).forEach(category => {
    category.permissions.forEach(perm => {
      keys.push(perm.key);
    });
  });
  return keys;
};

// Get all permissions as a flat array
export const getAllPermissions = () => {
  const permissions = [];
  Object.values(ADMIN_PERMISSIONS).forEach(category => {
    permissions.push(...category.permissions);
  });
  return permissions;
};

// Get permission by key
export const getPermissionByKey = (key) => {
  for (const category of Object.values(ADMIN_PERMISSIONS)) {
    const found = category.permissions.find(p => p.key === key);
    if (found) return found;
  }
  return null;
};

// Get path for a permission key
export const getPermissionPath = (key) => {
  const permission = getPermissionByKey(key);
  return permission ? permission.path : null;
};

// Get all paths for given permission keys
export const getPermittedPaths = (permissionKeys) => {
  return permissionKeys
    .map(key => getPermissionPath(key))
    .filter(path => path !== null);
};

// Check if a path is permitted for given permission keys
export const isPathPermitted = (path, permissionKeys, userType = 'sub-account') => {
  // Primary admin has full access
  if (userType === 'admin') {
    return true;
  }

  // Sub-accounts with empty permissions have no access
  if (!permissionKeys || permissionKeys.length === 0) {
    return false;
  }
  
  const permittedPaths = getPermittedPaths(permissionKeys);
  
  // Check exact match or if path starts with a permitted path
  return permittedPaths.some(permittedPath => 
    path === permittedPath || path.startsWith(permittedPath + '/')
  );
};

export default ADMIN_PERMISSIONS;
