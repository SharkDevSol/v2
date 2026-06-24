export { default as Login } from './pages/Login/Login';
export { default as ModernDashboard } from './pages/Dashboard/ModernDashboard';
export { default as Home } from './pages/Home';
export { default as TaskPage } from './pages/TaskPage';
export { default as TaskDetail } from './pages/TaskDetail';
export { default as ListStudent } from './pages/List/ListStudent/ListStudent';
export { default as ListStaff } from './pages/List/ListStaff/ListStaff';
export { default as ListGuardian } from './pages/List/ListGuardian/ListGuardian';
export { default as EditStaff } from './pages/List/ListStaff/EditStaff';
export { default as HRDashboard } from './pages/HR/HRDashboard';
export { default as SalaryManagement } from './pages/HR/SalaryManagement';
export { default as AttendanceSystem } from './pages/HR/AttendanceSystem';
export { default as LeaveManagement } from './pages/HR/LeaveManagement';
export { default as KGEvaluation } from './pages/KG/KGEvaluation';
export { default as AttendanceTimeSettings } from './pages/HR/AttendanceTimeSettingsCombined';
export { default as PayrollSystem } from './pages/HR/PayrollSystem';
export { default as FaultsPage } from './pages/Faults/FaultsPage';
export { default as Setting } from './pages/Setting/Setting';
export { default as ScheduleDashboard } from './pages/Schedule/ScheduleDashboard';
export { default as Post } from './pages/Post/Post';
export { default as AdminChat } from './pages/Communication/AdminChat';

// Contexts
export { AppProvider, useApp } from './context/AppContext';
export { ThemeProvider, useTheme } from './contexts/ThemeContext';
export { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Utils
export { formatAPIError } from './utils/errorMessages';
export { getCurrentEthiopianMonth, getEthiopianMonthName } from './utils/ethiopianCalendar';
export { default as api } from './utils/api';
export { filterNavByPermissions, hasPermission } from './utils/permissionUtils';
