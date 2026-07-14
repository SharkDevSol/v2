# Skoolific V2 — School Management System

Multi-platform school management system with web, desktop (Tauri), and mobile (Capacitor) support. Built with React + Express + PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web)** | React 18, Vite, React Router v6, Lucide Icons, i18n |
| **Backend** | Node.js, Express, Prisma ORM |
| **Database** | PostgreSQL |
| **Desktop** | Tauri (Rust + WebView) |
| **Mobile** | Capacitor |
| **CI/CD** | GitHub Actions |

## Architecture

```
Browser (Port 5053)    Desktop (Tauri)    Mobile (Capacitor)
        │                    │                    │
        └────────┬───────────┴───────────┬────────┘
                 │                       │
         [Vite Dev Proxy]        [Direct API]
                 │                       │
                 └──────────┬────────────┘
                            │
                 Express API (Port 5052)
                            │
                      PostgreSQL (Port 5432)
```

- Frontend dev server runs on `http://localhost:5053`, proxies `/api` → `http://localhost:5052`
- Backend runs on `http://localhost:5052`
- PostgreSQL database: `v2_db` on `localhost:5432` (user: `postgres`)

---

## Project Structure

```
V2/
├── APP/                          ← Main web frontend (React + Vite)
│   ├── src/
│   │   ├── COMPONENTS/          ← Reusable UI components (20+)
│   │   ├── PAGE/                ← Page modules (30+)
│   │   ├── config/              ← API, axios, theme config
│   │   ├── context/             ← React contexts
│   │   ├── hooks/               ← Custom hooks
│   │   ├── i18n/                ← Internationalization
│   │   ├── services/            ← API service layer
│   │   ├── styles/              ← Global CSS, theme
│   │   └── utils/               ← Utilities
│   ├── public/                  ← Static assets, PWA manifests
│   └── vite.config.js
│
├── backend/                      ← Express API server
│   ├── config/                  ← DB, API config
│   ├── database/                ← SQL migrations + schemas
│   ├── middleware/              ← Auth, rate limiting, security
│   ├── prisma/                  ← Prisma schema + migrations
│   ├── routes/                  ← All API route files (70+)
│   ├── services/                ← Business logic (60+)
│   ├── utils/                   ← Helpers
│   └── server.js                ← Entry point
│
├── packages/                     ← Multi-platform apps
│   ├── app-shared/              ← Shared components (web)
│   ├── desktop-admin/           ← Tauri admin desktop app
│   ├── desktop-staff/           ← Tauri staff desktop app
│   ├── desktop-super-admin/     ← Tauri super-admin desktop
│   ├── desktop-flutter/         ← Flutter desktop app
│   ├── mobile-admin/            ← Capacitor admin mobile app
│   ├── mobile-staff/            ← Capacitor staff mobile app
│   ├── mobile-guardian/         ← React mobile guardian app
│   ├── mobile-student/          ← React mobile student app
│   ├── mobile-super-admin/      ← React mobile super-admin app
│   ├── frontend/                ← Legacy web frontend
│   └── backend/                 ← Legacy backend ref
│
└── .kiro/                        ← Specification files
```

---

## Backend — API Modules

### Authentication & Access
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/authRoutes.js` | `/api/v2/auth/*` | JWT login, refresh, logout (multi-branch) |
| `routes/staff_auth.js` | `/api/v2/auth/staff/*` | Staff authentication |
| `routes/superAdminRoutes.js` | `/api/super-admin/*` | Super admin aggregation across branches |
| `middleware/auth.js` | — | JWT verification middleware |
| `middleware/branchAuth.js` | — | Branch-scoped authentication |

### Students
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/studentRoutes.js` | `/api/students/*` | Student CRUD |
| `routes/studentListRoutes.js` | `/api/student-list/*` | Student listing with filters |
| `routes/studentAttendanceRoutes.js` | `/api/student-attendance/*` | Attendance records |
| `routes/viewStudentAttendanceRoutes.js` | `/api/view-attendance/*` | Attendance views/reports |
| `routes/studentFaultsRoutes.js` | `/api/faults/*` | Student faults/discipline |
| `routes/studentActivitiesRoutes.js` | `/api/student-activities/*` | Extracurricular activities |
| `routes/usbAttendanceImport.js` | `/api/usb-attendance/*` | Import attendance via USB |

### Staff
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/staffRoutes.js` | `/api/staff/*` | Staff CRUD, sending, file extraction |
| `routes/staffAttendanceRoutes.js` | `/api/staff-attendance/*` | Staff attendance |
| `routes/staffFaultsRoutes.js` | `/api/staff-faults/*` | Staff faults/discipline |
| `routes/staffMachineMapping.js` | `/api/staff-machine/*` | Biometric machine mapping |
| `routes/staffAttendanceLog.js` | `/api/staff-attendance-logs/*` | Attendance logs |

### Attendance Systems
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/attendanceRoutes.js` | `/api/attendance/*` | Core attendance |
| `routes/adminAttendanceRoutes.js` | `/api/admin-attendance/*` | Admin attendance view |
| `routes/guardianAttendanceRoutes.js` | `/api/guardian-attendance/*` | Guardian attendance view |
| `routes/guardianStudentAttendance.js` | `/api/guardian-student-attendance/*` | Guardian per-student view |
| `routes/machineAttendance.js` | `/api/machine-attendance/*` | Biometric machine attendance |
| `routes/machineWebhook.js` | `/api/machine-webhook/*` | Machine real-time webhook |
| `routes/academic/studentAttendance.js` | `/api/academic/student-attendance/*` | Academic attendance module |

### Academic
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/evaluations.js` | `/api/evaluations/*` | Evaluation CRUD |
| `routes/evaluationBookRoutes.js` | `/api/evaluation-book/*` | Daily evaluation book |
| `routes/kgEvaluationRoutes.js` | `/api/kg-evaluations/*` | Kindergarten evaluation |
| `routes/markListRoutes.js` | `/api/mark-list/*` | Mark lists |
| `routes/examGradingRoutes.js` | `/api/exam-grading/*` | Exam auto-grading |
| `routes/examPublishingRoutes.js` | `/api/exam-publishing/*` | Exam publishing |
| `routes/examRepeatRoutes.js` | `/api/exam-repeat/*` | Exam repeat management |
| `routes/classTeacherRoutes.js` | `/api/class-teacher/*` | Class teacher assignments |

### Finance
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/financeAccountRoutes.js` | `/api/finance/accounts/*` | Chart of accounts |
| `routes/financeFeeStructureRoutes.js` | `/api/finance/fee-structures/*` | Fee structure setup |
| `routes/financeDiscountRoutes.js` | `/api/finance/discounts/*` | Discount management |
| `routes/financeScholarshipRoutes.js` | `/api/finance/scholarships/*` | Scholarship management |
| `routes/financeInvoiceRoutes.js` | `/api/finance/invoices/*` | Invoice generation |
| `routes/financeSimpleInvoiceRoutes.js` | `/api/finance/simple-invoices/*` | Simple/quick invoices |
| `routes/financeProgressiveInvoiceRoutes.js` | `/api/finance/progressive-invoices/*` | Progressive/installment invoices |
| `routes/financePaymentRoutes.js` | `/api/finance/payments/*` | Payment recording |
| `routes/financeMonthlyPaymentRoutes.js` | `/api/finance/monthly-payments/*` | Monthly payment tracking |
| `routes/financeMonthlyPaymentViewRoutes.js` | `/api/finance/monthly-payments-view/*` | Monthly payment reports |
| `routes/financeLateFeeRoutes.js` | `/api/finance/late-fee-rules/*` | Late fee rules |
| `routes/financeLateFeeApplicationRoutes.js` | `/api/finance/late-fee-apply/*` | Late fee application |
| `routes/financeClassStudentRoutes.js` | `/api/finance/class-students/*` | Student fee records |
| `routes/simpleFeeManagement.js` | `/api/simple-fees/*` | Simple fee management |
| `routes/simpleFeePayments.js` | `/api/fee-payments/*` | Simple fee payments |

### HR
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/hr/index.js` | `/api/hr/*` | HR dashboard |
| `routes/hr/attendance.js` | `/api/hr/attendance/*` | HR attendance |
| `routes/hr/leaveManagement.js` | `/api/hr/leave/*` | Leave requests/approvals |
| `routes/hr/payroll.js` | `/api/hr/payroll/*` | Payroll processing |
| `routes/hr/salaryManagement.js` | `/api/hr/salary/*` | Salary structure |
| `routes/shiftSettings.js` | `/api/hr/shift-settings/*` | Shift configuration |
| `routes/attendanceTimeSettings.js` | `/api/hr/attendance-time-settings/*` | Time settings |

### Communication
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/chatRoutes.js` | `/api/chats/*` | Chat system (admin/teacher/guardian) |
| `routes/postRoutes.js` | `/api/posts/*` | Announcements/posts |
| `routes/classCommunicationRoutes.js` | `/api/class-communication/*` | Class-level communication |
| `routes/guardianNotificationRoutes.js` | `/api/guardian-notifications/*` | Guardian push/email notifications |

### Inventory & Assets
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/inventory/index.js` | `/api/inventory/*` | Inventory dashboard |
| `routes/inventory/items.js` | `/api/inventory/items/*` | Item management |
| `routes/assets/index.js` | `/api/assets/*` | Asset dashboard |
| `routes/assets/accounts.js` | `/api/assets/accounts/*` | Asset accounts |
| `routes/assets/budgets.js` | `/api/assets/budgets/*` | Asset budgets |
| `routes/assets/expenses.js` | `/api/assets/expenses/*` | Asset expenses |
| `routes/assets/feeStructures.js` | `/api/assets/fee-structures/*` | Asset fee structures |
| `routes/assets/invoices.js` | `/api/assets/invoices/*` | Asset invoices |
| `routes/assets/payments.js` | `/api/assets/payments/*` | Asset payments |

### Reports & Dashboard
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/reportsRoutes.js` | `/api/reports/*` | All reports |
| `routes/dashboardRoutes.js` | `/api/dashboard/*` | Dashboard stats |
| `routes/dashboardStatsRoutes.js` | `/api/dashboard-stats/*` | Detailed statistics |
| `routes/finance/dashboardReports.js` | `/api/reports/finance/*` | Finance reports |
| `routes/hr/dashboardReports.js` | `/api/reports/hr/*` | HR reports |
| `routes/inventory/dashboardReports.js` | `/api/reports/inventory/*` | Inventory reports |
| `routes/assets/dashboardReports.js` | `/api/reports/assets/*` | Asset reports |
| `routes/academic/dashboardReports.js` | `/api/reports/academic/*` | Academic reports |

### System
| Route File | Endpoints | Description |
|------------|-----------|-------------|
| `routes/settingsRoutes.js` | `/api/settings/*` | System settings |
| `routes/branchRoutes.js` | `/api/v2/branches/*` | Branch management |
| `routes/schoolSetupRoutes.js` | `/api/school-setup/*` | School configuration |
| `routes/userProfileRoutes.js` | `/api/user-profile/*` | User profiles |
| `routes/userActivityRoutes.js` | `/api/user-activity/*` | Activity logging |
| `routes/subAccountRoutes.js` | `/api/admin/sub-accounts/*` | Admin sub-accounts |
| `routes/taskStatusRoutes.js` | `/api/tasks/*` | Task management |
| `routes/yearRolloverRoutes.js` | `/api/year-rollover/*` | Academic year rollover |
| `routes/deviceUserManagement.js` | `/api/device-users/*` | Device user management |
| `routes/aboutUsRoutes.js` | `/api/public/about-us/*` | Public about info |
| `routes/healthRoutes.js` | `/api/health` | Health check |

### Backend Services (Key)
| Service | Description |
|---------|-------------|
| `DatabaseConnectionManager` | Multi-branch database connection pool |
| `AttendanceAutoMarker` | Auto-marks absent students/staff |
| `BackupRestoreService` | Automatic database backup/restore |
| `YearRolloverService` | Academic year rollover logic |
| `ExamGradingRepository` | Exam auto-grading engine |
| `NotificationService` | Push, email, SMS notifications |
| `TelegramBotService` | Telegram bot integration |
| `SMSService` | SMS sending |
| `SyncCoordinator` | Biometric device sync |
| `DeviceUserMonitoringService` | Device user monitoring |
| `ConflictResolutionService` | Data conflict resolution |
| `CacheService` | In-memory cache |

---

## Frontend — Page Modules

### Dashboard
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Dashboard/ModernDashboard.jsx` | `/`, `/dashboard` | Main dashboard with charts, stats, quick actions |
| `PAGE/Dashboard/DashboardRedesign.jsx` | `/dashboard-detailed` | Redesigned detailed dashboard |
| `PAGE/Dashboard/Dashboard.jsx` | `/dashboard-old` | Legacy dashboard |

### Registration
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/CreateRegister/CreateRegisterStudent/` | `/create-register-student` | Register new students with form builder |
| `PAGE/CreateRegister/CreateRegisterStaff/` | `/create-register-staff` | Register new staff with form builder |

### Lists
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/List/ListStudent/` | `/list-student` | View, search, filter, export student list |
| `PAGE/List/ListStaff/` | `/list-staff` | View, search, filter, export staff list |
| `PAGE/List/ListGuardian/` | `/list-guardian` | View, search, filter guardian list |

### Finance Management
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Finance/` | `/finance` | Finance dashboard — overview of all finance modules |
| `PAGE/Finance/ChartOfAccounts/` | `/finance/accounts` | Chart of accounts management |
| `PAGE/Finance/FeeManagement/` | `/finance/fee-management` | Fee structures, types, and management |
| `PAGE/Finance/` (invoices) | `/finance/invoices` | Invoice generation and tracking |
| `PAGE/Finance/` (payments) | `/finance/payments` | Payment recording and reconciliation |
| `PAGE/Finance/` (monthly) | `/finance/monthly-payments` | Monthly payment schedules |
| `PAGE/Finance/` (payroll) | `/finance/payroll` | Payroll processing |
| `PAGE/Finance/` (reports) | `/finance/reports` | Financial reports |
| `PAGE/Finance/` (budgets) | `/finance/budgets` | Budget management |
| `PAGE/Finance/` (expenses) | `/finance/expenses` | Expense management |

### Inventory & Stock
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Inventory/` | `/inventory` | Inventory dashboard |
| `PAGE/Inventory/` (items) | `/inventory/items` | Item master management |
| `PAGE/Inventory/` (purchase orders) | `/inventory/purchase-orders` | Purchase order management |
| `PAGE/Inventory/` (stock) | `/inventory/stock-movements` | Stock movement tracking |
| `PAGE/Inventory/` (suppliers) | `/inventory/suppliers` | Supplier management |

### Asset Management
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Assets/` | `/assets` | Asset dashboard |
| `PAGE/Assets/` (registry) | `/assets/registry` | Asset registry |
| `PAGE/Assets/` (assignments) | `/assets/assignments` | Asset assignments |
| `PAGE/Assets/` (maintenance) | `/assets/maintenance` | Maintenance tracking |
| `PAGE/Assets/` (depreciation) | `/assets/depreciation` | Depreciation calculations |

### HR & Staff Management
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/HR/` | `/hr` | HR dashboard |
| `PAGE/HR/` (salary) | `/hr/salary` | Salary structure and management |
| `PAGE/HR/` (attendance) | `/hr/attendance` | Staff attendance system |
| `PAGE/HR/` (device status) | `/hr/device-status` | Biometric device status |
| `PAGE/HR/` (time settings) | `/hr/attendance-time-settings` | Attendance/shift time settings |
| `PAGE/HR/` (leave) | `/hr/leave` | Leave management |
| `PAGE/HR/` (payroll) | `/hr/payroll` | HR payroll |
| `PAGE/HR/` (reports) | `/hr/reports` | HR reports |

### Academic
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Evaluation/` | `/evaluation` | Create, list, and manage evaluations |
| `PAGE/EvaluationBook/` | `/evaluation-book` | Daily evaluation book system |
| `PAGE/EvaluationBook/` (assignments) | `/evaluation-book/assignments` | Teacher assignment for evaluations |
| `PAGE/EvaluationBook/` (teacher) | `/evaluation-book/teacher` | Teacher's class list |
| `PAGE/EvaluationBook/` (daily) | `/evaluation-book/daily/:className` | Daily evaluation entry |
| `PAGE/EvaluationBook/` (guardian) | `/evaluation-book/guardian` | Guardian evaluation inbox |
| `PAGE/KGEvaluation/` | `/kg/evaluation` | Kindergarten evaluation |
| `PAGE/CreateMarklist/` | `/create-mark-list` | Mark list creation |
| `PAGE/CreateMarklist/MarkListManagement.jsx` | `/Mark-List-Management` | Mark list management |
| `PAGE/CreateMarklist/SubjectMappingSetup.jsx` | `/Subject-Mapping-Setup` | Subject mappings for marks |
| `PAGE/CreateMarklist/ReportCard/` | `/report-card` | Report card generation |
| `PAGE/MarkListView/` | `/mark-list-view` | View mark lists |
| `PAGE/Academic/StudentAttendanceSystem.jsx` | `/student-attendance-system` | Student attendance (weekly view) |
| `PAGE/Academic/StudentAttendanceTimeSettings.jsx` | `/student-attendance-time-settings` | Attendance time configuration |
| `PAGE/Schedule/` | `/schedule` | Schedule dashboard |
| `PAGE/Schedule/Timetable` | `/schedule/Timetable` | Timetable view |
| `PAGE/Schedule/ClassShiftForm` | `/schedule/ClassShiftForm` | Class shift assignment |
| `PAGE/Schedule/requirements` | `/schedule/requirements` | Class requirements |

### Communication
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Communication/` | `/communication` | Admin chat and messaging |
| `PAGE/Communication/` (guardian) | `/communication/guardian` | Guardian communication |
| `PAGE/Post/` | `/post` | Announcements and posts |

### Reports
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Reports/` (students) | `/reports/students` | Student reports |
| `PAGE/Reports/` (staff) | `/reports/staff` | Staff reports |
| `PAGE/Reports/` (academic) | `/reports/academic` | Academic performance reports |
| `PAGE/Reports/` (attendance) | `/reports/attendance` | Attendance reports |
| `PAGE/Reports/` (behavior) | `/reports/behavior` | Behavior/discipline reports |
| `PAGE/Reports/` (evaluations) | `/reports/evaluations` | Evaluation reports |

### Student & Staff Apps
| Page | Routes | Description |
|------|--------|-------------|
| `Students/` | `/students/*` | Student portal (posts, class, communication, profile) |
| `Staff/` | `/staff/*` | Staff portal (posts, attendance, marks, exams, evaluation, communication) |
| `Guardian/` | `/guardian/*` | Guardian portal (wards, attendance, marks, messages, profile) |

### System & Configuration
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/Setting/` | `/settings` | System settings and configuration |
| `PAGE/AdminSubAccounts/` | `/admin-sub-accounts` | Admin sub-account management |
| `PAGE/SuperAdmin/` | `/super-admin` | Super admin panel (cross-branch) |
| `PAGE/Diagnostics/` | `/diagnostics` | System diagnostics |

### Other
| Page | Routes | Description |
|------|--------|-------------|
| `PAGE/AboutUs/` | `/about-us` | Public about page |
| `PAGE/Faults/` | `/faults` | Student faults/discipline |
| `PAGE/TaskPage.jsx` | `/tasks` | Task board |
| `PAGE/TaskDetail.jsx` | `/tasks/:taskId` | Task detail view |
| `PAGE/LiveAttendanceMonitor.jsx` | `/live-attendance` | Live attendance monitor |

### Reusable UI Components
| Component | Description |
|-----------|-------------|
| `Button` | Multi-variant button system (primary, secondary, outline, ghost, danger) |
| `Card` | Flexible card container |
| `Input` | Text input with validation |
| `Select` | Dropdown selector |
| `Checkbox` | Checkbox with label |
| `Radio` / `RadioGroup` | Radio button group |
| `Textarea` | Multi-line text input |
| `DatePicker` | Date selection with calendar |
| `FileUpload` | File upload with preview |
| `FormGroup` | Form field wrapper with label/error |
| `ValidatedInput` / `ValidatedSelect` / `ValidatedTextarea` | Form components with built-in validation |
| `Table` | Data table |
| `Modal` | Modal dialog |
| `Toast` / `ToastContainer` / `useToast` | Toast notification system |
| `Sidebar` | Navigation sidebar |
| `Header` | App header with breadcrumbs, profile menu, search, notifications |
| `Layout` / `PageHeader` / `PageLayout` | Page layout components |
| `StatCard` | Statistics display card |
| `Badge` | Status badge |
| `LoadingSpinner` | Loading indicator |
| `Skeleton` | Skeleton loading placeholder |
| `LazyImage` | Lazy-loaded image |
| `LanguageSelector` | Language switcher (i18n) |
| `ThemeToggle` | Dark/light theme toggle |

---

## Multi-Platform Packages

| Package | Platform | Framework | Purpose |
|---------|----------|-----------|---------|
| `packages/desktop-admin/` | Desktop | Tauri (Rust) | Admin web app wrapped as desktop app |
| `packages/desktop-staff/` | Desktop | Tauri (Rust) | Staff web app wrapped as desktop app |
| `packages/desktop-super-admin/` | Desktop | Tauri (Rust) | Super admin web app wrapped as desktop app |
| `packages/desktop-flutter/` | Desktop | Flutter | Flutter-based desktop app |
| `packages/mobile-admin/` | Mobile | Capacitor | Admin mobile app |
| `packages/mobile-staff/` | Mobile | Capacitor | Staff mobile app |
| `packages/mobile-guardian/` | Mobile | React + Vite | Guardian mobile app |
| `packages/mobile-student/` | Mobile | React + Vite | Student mobile app |
| `packages/mobile-super-admin/` | Mobile | React + Vite | Super admin mobile app |
| `packages/app-shared/` | Web (shared) | React | Shared components between web apps |
| `packages/backend/` | Server | Node.js | Legacy backend package |
| `packages/frontend/` | Web | React + Vite | Legacy web frontend package |

---

## Middleware Stack

| Middleware | Purpose |
|-----------|---------|
| `auth.js` | JWT authentication + token verification |
| `branchAuth.js` | Multi-branch database context |
| `rateLimiter.js` | API rate limiting (general + login) |
| `security.js` | HTTPS redirect, security headers, XSS protection |
| `sanitizeRequest.js` | Input sanitization + SQL injection prevention |
| `inputValidation.js` | Request body validation |
| `fileValidation.js` | File upload validation |
| `csrfProtection.js` | CSRF token validation |
| `auditLogger.js` | Audit logging for sensitive operations |
| `activityTracker.js` | User activity tracking |
| `financeAuth.js` | Finance-specific auth checks |
| `jwtValidator.js` | JWT token validation |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Variables
Copy `.env.example` to `.env` in both `APP/` and `backend/`:

**Backend `.env`**
```
DB_NAME=v2_db
DB_USER=postgres
DB_PASSWORD=12341234
DB_HOST=localhost
DB_PORT=5432
PORT=5052
JWT_SECRET=your-secret
```

**Frontend `APP/.env`**
```
VITE_API_URL=http://localhost:5052/api
```

### Running Locally

```bash
# 1. Database
# Ensure PostgreSQL is running and create the database:
# createdb v2_db

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npm run dev    # Starts on http://localhost:5052

# 3. Frontend
cd APP
npm install
npm run dev    # Starts on http://localhost:5053
```

### Building for Production

```bash
# Backend
cd backend
npm run build   # or: npm start (with PM2 via ecosystem.config.js)

# Frontend
cd APP
npm run build   # Outputs to APP/dist/
```

---

## Database

- **Engine:** PostgreSQL
- **Branch architecture:** Each school branch can use its own database or a shared one
- **ORM:** Prisma for schema management + raw SQL for complex queries
- **Migrations:** Both Prisma migrations (`prisma/migrations/`) and raw SQL migrations (`database/`)
- **Key tables:** Students, Staff, Guardians, Attendance, Evaluations, Marks, Finance (accounts, invoices, payments, fees), HR (attendance, leave, payroll), Inventory, Assets, Schedule, Communication

---

## Key Features Summary

- **Multi-branch** — Single installation serves multiple school branches
- **Multi-platform** — Web, Desktop (Tauri), Mobile (Capacitor)
- **Student Management** — Registration, profiles, attendance, discipline, activities
- **Staff Management** — Registration, profiles, attendance, leave, payroll
- **Finance** — Fee structures, invoices, payments, discounts, scholarships, budgets, expenses, payroll
- **Academic** — Evaluations, mark lists, report cards, exams, grading
- **HR** — Attendance tracking, leave management, salary, payroll, shifts
- **Inventory** — Items, purchase orders, stock movements, suppliers
- **Assets** — Registry, assignments, maintenance, depreciation
- **Communication** — Chat, announcements, guardian notifications
- **Attendance** — Manual, biometric machine, USB import, auto-marking
- **Reports** — Academic, attendance, behavior, evaluations, finance, HR, inventory, assets
- **Schedule** — Timetable, class shifts, requirements
- **KG Module** — Kindergarten-specific evaluation
- **Guardian Portal** — Ward tracking, attendance, marks, communication
- **Student Portal** — Posts, class info, communication, profile
- **Staff Portal** — Attendance, marks, exams, evaluation, posts
- **PWA Support** — Installable web apps for all user types
- **Notifications** — Push, email, SMS, Telegram
- **i18n** — Internationalization support
- **Dark/Light Theme** — Theme toggle
- **Backup & Restore** — Automatic database backups
- **Year Rollover** — Academic year transition
- **Device Sync** — Biometric machine synchronization
