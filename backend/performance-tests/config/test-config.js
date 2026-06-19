export const config = {
  baseURL: __ENV.BASE_URL || 'http://localhost:5052',
  testUsers: {
    admin: {
      username: __ENV.ADMIN_USERNAME || 'admin',
      password: __ENV.ADMIN_PASSWORD || 'admin123',
      branchCode: __ENV.BRANCH_CODE || 'IQRA'
    },
    teacher: {
      username: __ENV.TEACHER_USERNAME || 'teacher1',
      password: __ENV.TEACHER_PASSWORD || 'teacher123',
      branchCode: __ENV.BRANCH_CODE || 'IQRA'
    },
    student: {
      username: __ENV.STUDENT_USERNAME || 'student1',
      password: __ENV.STUDENT_PASSWORD || 'student123',
      branchCode: __ENV.BRANCH_CODE || 'IQRA'
    }
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
    iterations: 10,
    vus: 5
  },
  endpoints: {
    health: '/api/health',
    login: '/api/v2/branches/login',
    dashboard: '/api/dashboard/stats',
    studentList: '/api/students',
    markList: '/api/mark-list'
  }
};
