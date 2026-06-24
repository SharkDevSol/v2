# API Configuration Guide

## Quick Start

### Option 1: Use Pre-configured Axios Instance (Recommended)
```javascript
import api from '@/config/axios.config';

// Automatically includes authentication and branch code
const response = await api.post('/api/v2/auth/login', { username, password, branchCode });
const students = await api.get('/api/students');
```

### Option 2: Use API Config with Standard Axios
```javascript
import { getEndpoint, API_ENDPOINTS } from '@/config/api.config';
import axios from 'axios';

const url = getEndpoint('AUTH.LOGIN');
const response = await axios.post(url, { username, password, branchCode });
```

## Configuration Files

### 1. `axios.config.js` - Pre-configured Axios Instance
A ready-to-use Axios instance with:
- ✅ Automatic authentication (token + branch code injection)
- ✅ Automatic token refresh on 401 errors
- ✅ Request/response logging in development
- ✅ Retry logic for failed requests (3 retries with exponential backoff)
- ✅ Centralized error handling
- ✅ Network error detection

**Import:**
```javascript
import api from '@/config/axios.config';
```

### 2. `api.config.js` - API Endpoints Configuration
Centralized endpoint definitions and helper functions:
- 100+ endpoint definitions organized by module
- Environment-based base URLs
- Helper functions for building URLs
- Query parameter support

**Import:**
```javascript
import { getEndpoint, API_ENDPOINTS } from '@/config/api.config';
```

## Common Use Cases

### Using Pre-configured Axios Instance (Recommended)

#### 1. Simple GET Request
```javascript
import api from '@/config/axios.config';

// Authentication and branch code automatically included
const response = await api.get('/api/students');
const students = response.data;
```

#### 2. GET with Dynamic ID
```javascript
import api from '@/config/axios.config';

const response = await api.get(`/api/students/${studentId}`);
const student = response.data;
```

#### 3. GET with Query Parameters
```javascript
import api from '@/config/axios.config';

const response = await api.get('/api/students/search', {
  params: { q: 'John', page: 1, limit: 10 }
});
```

#### 4. POST Request
```javascript
import api from '@/config/axios.config';

const response = await api.post('/api/students/register', studentData);
```

#### 5. PUT/PATCH Request
```javascript
import api from '@/config/axios.config';

const response = await api.put(`/api/students/${studentId}`, updatedData);
```

#### 6. DELETE Request
```javascript
import api from '@/config/axios.config';

const response = await api.delete(`/api/students/${studentId}`);
```

#### 7. Error Handling with Axios Instance
```javascript
import api from '@/config/axios.config';

try {
  const response = await api.get('/api/students');
} catch (error) {
  // Error is already processed by handleAPIError
  console.error(error.message); // User-friendly error message
  console.error(error.type); // 'server_error', 'network_error', or 'request_error'
  console.error(error.status); // HTTP status code
}
```

### Using API Config with Standard Axios

#### 1. Simple GET Request
```javascript
import { getEndpoint } from '@/config/api.config';
import axios from 'axios';

const url = getEndpoint('STUDENTS.LIST');
const response = await axios.get(url);
```

#### 2. GET with Dynamic ID
```javascript
import { getEndpoint } from '@/config/api.config';
import axios from 'axios';

const url = getEndpoint('STUDENTS.BY_ID', { id: studentId });
const response = await axios.get(url);
```

#### 3. GET with Query Parameters
```javascript
import { buildURL } from '@/config/api.config';
import axios from 'axios';

const url = buildURL('STUDENTS.SEARCH', {}, { 
  q: 'John', 
  page: 1, 
  limit: 10 
});
const response = await axios.get(url);
```

#### 4. POST with Authentication
```javascript
import { getEndpoint, createRequestConfig } from '@/config/api.config';
import axios from 'axios';

const url = getEndpoint('STUDENTS.REGISTER');
const config = createRequestConfig({
  method: 'POST',
  data: studentData,
  auth: true
});

const response = await axios.post(url, config.data, config);
```

#### 5. Error Handling
```javascript
import { getEndpoint, handleAPIError } from '@/config/api.config';
import axios from 'axios';

try {
  const url = getEndpoint('STUDENTS.LIST');
  const response = await axios.get(url);
} catch (error) {
  const errorInfo = handleAPIError(error);
  console.error(errorInfo.message);
  // errorInfo: { status, message, data, type }
}
```

## Available Endpoints

### Authentication
- `AUTH.LOGIN` - Login endpoint
- `AUTH.VALIDATE_BRANCH` - Validate branch code
- `AUTH.REFRESH_TOKEN` - Refresh authentication token
- `AUTH.LOGOUT` - Logout endpoint

### Students
- `STUDENTS.LIST` - Get all students
- `STUDENTS.BY_ID` - Get student by ID (requires `{ id }`)
- `STUDENTS.REGISTER` - Register new student
- `STUDENTS.UPDATE` - Update student (requires `{ id }`)
- `STUDENTS.DELETE` - Delete student (requires `{ id }`)
- `STUDENTS.SEARCH` - Search students
- `STUDENTS.BY_CLASS` - Get students by class (requires `{ id: classId }`)

### Staff
- `STAFF.BASE` - Staff base endpoint
- `STAFF.BY_ID` - Get staff by ID (requires `{ id }`)
- `STAFF.REGISTER` - Register new staff
- `STAFF.UPDATE` - Update staff (requires `{ id }`)
- `STAFF.DELETE` - Delete staff (requires `{ id }`)

### Attendance
- `ATTENDANCE.STUDENT.BASE` - Student attendance base
- `ATTENDANCE.STUDENT.MARK` - Mark student attendance
- `ATTENDANCE.STUDENT.BY_CLASS` - Get attendance by class (requires `{ id: classId }`)
- `ATTENDANCE.STAFF.BASE` - Staff attendance base
- `ATTENDANCE.STAFF.MARK` - Mark staff attendance

### Academic
- `ACADEMIC.MARK_LIST.BASE` - Mark list base
- `ACADEMIC.MARK_LIST.CREATE` - Create mark list
- `ACADEMIC.MARK_LIST.BY_CLASS` - Get mark list by class (requires `{ id: classId }`)
- `ACADEMIC.SCHEDULE.BASE` - Schedule base
- `ACADEMIC.EVALUATIONS.BASE` - Evaluations base

### Finance
- `FINANCE.FEES.BASE` - Fees base
- `FINANCE.PAYMENTS.MONTHLY` - Monthly payments
- `FINANCE.INVOICES.BASE` - Invoices base
- `FINANCE.EXPENSES.BASE` - Expenses base

### Communication
- `COMMUNICATION.POSTS.BASE` - Posts base
- `COMMUNICATION.POSTS.CREATE` - Create post
- `COMMUNICATION.CHAT.CONVERSATIONS` - Get conversations
- `COMMUNICATION.CHAT.MESSAGES` - Get messages (requires `{ id: conversationId }`)

### Dashboard
- `DASHBOARD.STATS` - Dashboard statistics
- `DASHBOARD.RECENT_FAULTS` - Recent faults
- `DASHBOARD.ATTENDANCE_SUMMARY` - Attendance summary

### Settings
- `SETTINGS.GENERAL` - General settings
- `SETTINGS.BRANDING` - Branding settings
- `SETTINGS.LANGUAGE` - Language settings
- `SETTINGS.PASSWORD` - Password settings

## Authentication Helpers

The `axios.config.js` file exports several helper functions for managing authentication:

### `setAuthToken(token, remember)`
Store authentication token.
```javascript
import { setAuthToken } from '@/config/axios.config';

// Store in sessionStorage (cleared on browser close)
setAuthToken(token, false);

// Store in localStorage (persists across sessions)
setAuthToken(token, true);
```

### `setRefreshToken(token, remember)`
Store refresh token.
```javascript
import { setRefreshToken } from '@/config/axios.config';

setRefreshToken(refreshToken, true);
```

### `setBranchCode(branchCode, remember)`
Store branch code.
```javascript
import { setBranchCode } from '@/config/axios.config';

setBranchCode('ib3', true);
```

### `getAuthToken()`, `getRefreshToken()`, `getBranchCode()`
Retrieve stored values.
```javascript
import { getAuthToken, getBranchCode } from '@/config/axios.config';

const token = getAuthToken();
const branchCode = getBranchCode();
```

### `clearAuth()`
Clear all authentication data.
```javascript
import { clearAuth } from '@/config/axios.config';

// On logout
clearAuth();
```

### `isAuthenticated()`
Check if user is authenticated.
```javascript
import { isAuthenticated } from '@/config/axios.config';

if (isAuthenticated()) {
  // User is logged in
}
```

### Complete Login Example
```javascript
import api, { setAuthToken, setRefreshToken, setBranchCode } from '@/config/axios.config';

async function login(username, password, branchCode, rememberMe) {
  try {
    // Login request (no auth needed for login endpoint)
    const response = await api.post('/api/v2/auth/login', {
      username,
      password,
      branchCode
    });
    
    const { token, refreshToken } = response.data;
    
    // Store credentials
    setAuthToken(token, rememberMe);
    setRefreshToken(refreshToken, rememberMe);
    setBranchCode(branchCode, rememberMe);
    
    // All subsequent requests will automatically include token and branch code
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}
```

## Automatic Features

### 1. Token Injection
Every request automatically includes:
```javascript
headers: {
  'Authorization': 'Bearer <token>',
  'X-Branch-Code': '<branchCode>'
}
```

### 2. Token Refresh
When a 401 error occurs:
1. Automatically attempts to refresh the token
2. Retries the original request with new token
3. If refresh fails, redirects to login page

### 3. Request Retry
Failed requests are automatically retried:
- Network errors: 3 retries
- 5xx server errors: 3 retries
- 429 (Too Many Requests): 3 retries
- Exponential backoff: 1s, 2s, 4s

### 4. Development Logging
In development mode, all requests and responses are logged:
```
🚀 API Request: POST /api/students
✅ API Response: 200 OK
❌ API Error: 404 Not Found
🔄 Retrying request (1/3) after 1000ms
```

## Helper Functions

### Core Helpers

#### `getBaseURL(service, environment)`
Get the base URL for a service.
```javascript
const backendURL = getBaseURL(); // http://localhost:5052
const frontendURL = getBaseURL('frontend'); // http://localhost:5173
```

#### `getEndpoint(endpointPath, params, environment)`
Get full endpoint URL.
```javascript
const url = getEndpoint('AUTH.LOGIN');
// http://localhost:5052/api/v2/auth/login

const url = getEndpoint('STUDENTS.BY_ID', { id: 123 });
// http://localhost:5052/api/students/123
```

#### `getEndpointPath(endpointPath, params)`
Get endpoint path without base URL (useful with Axios instance).
```javascript
const path = getEndpointPath('AUTH.LOGIN');
// /api/v2/auth/login
```

#### `hasEndpoint(endpointPath)`
Check if endpoint exists.
```javascript
if (hasEndpoint('AUTH.LOGIN')) {
  // Endpoint exists
}
```

#### `getModuleEndpoints(moduleName)`
Get all endpoints for a module.
```javascript
const authEndpoints = getModuleEndpoints('AUTH');
// { LOGIN: '/api/v2/auth/login', ... }
```

### Frontend-Specific Helpers

#### `buildURL(endpointPath, pathParams, queryParams)`
Build URL with query parameters.
```javascript
const url = buildURL('STUDENTS.LIST', {}, { page: 1, limit: 10 });
// http://localhost:5052/api/student-list?page=1&limit=10
```

#### `createRequestConfig(options)`
Create Axios request config with authentication.
```javascript
const config = createRequestConfig({
  method: 'POST',
  data: { username, password },
  auth: true // Includes token and branch code
});
```

#### `handleAPIError(error)`
Handle API errors consistently.
```javascript
try {
  const response = await axios.get(url);
} catch (error) {
  const errorInfo = handleAPIError(error);
  // { status, message, data, type }
}
```

#### `isDevelopment()`, `isProduction()`, `getEnvironment()`
Environment detection helpers.
```javascript
if (isDevelopment()) {
  console.log('Running in development mode');
}
```

## Environment Variables

### Required Variables
Create a `.env.development` or `.env.production` file:

```env
# Backend URL
VITE_BACKEND_URL=http://localhost:5052

# Frontend URL (optional)
VITE_FRONTEND_URL=http://localhost:5173
```

### Legacy Support
The config also supports the existing `VITE_API_URL` variable:
```env
VITE_API_URL=http://localhost:5050/api
```

## Best Practices

### 1. Use Pre-configured Axios Instance (Recommended)
The axios.config.js instance handles authentication, retries, and errors automatically:

```javascript
import api from '@/config/axios.config';

// ✅ Good - Automatic auth, retry, error handling
const response = await api.get('/api/students');

// ❌ Bad - Manual setup required
import axios from 'axios';
const response = await axios.get('http://localhost:5052/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Branch-Code': branchCode
  }
});
```

### 2. Create Custom Hooks
Encapsulate API logic in custom hooks:

```javascript
import { useState, useEffect } from 'react';
import api from '@/config/axios.config';

function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  return { students, loading, error };
}
```

### 3. Consistent Error Handling
Errors are automatically processed by `handleAPIError`:

```javascript
import api from '@/config/axios.config';

try {
  const response = await api.get('/api/students');
} catch (error) {
  // Error is already formatted
  switch (error.type) {
    case 'server_error':
      // Handle server errors (4xx, 5xx)
      console.error('Server error:', error.message);
      break;
    case 'network_error':
      // Handle network errors (no response)
      console.error('Network error:', error.message);
      break;
    case 'request_error':
      // Handle request setup errors
      console.error('Request error:', error.message);
      break;
  }
}
```

### 4. Use Endpoint Paths
For better maintainability, use endpoint paths from api.config.js:

```javascript
import api from '@/config/axios.config';
import { getEndpointPath } from '@/config/api.config';

// ✅ Good - Centralized endpoint definition
const response = await api.get(getEndpointPath('STUDENTS.LIST'));

// ❌ Bad - Hardcoded path
const response = await api.get('/api/students');
```

### 5. Handle Authentication State
Use the authentication helpers:

```javascript
import { isAuthenticated, clearAuth } from '@/config/axios.config';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}

function LogoutButton() {
  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## Migration Guide

### From Hardcoded URLs
```javascript
// Before
const response = await axios.get('https://iqrab3.skoolific.com/api/students');

// After
import api from '@/config/axios.config';
const response = await api.get('/api/students');
```

### From Environment Variables
```javascript
// Before
const response = await axios.get(`${import.meta.env.VITE_API_URL}/students`);

// After
import api from '@/config/axios.config';
const response = await api.get('/api/students');
```

### From Template Literals
```javascript
// Before
const response = await axios.get(`/api/students/${studentId}`);

// After
import api from '@/config/axios.config';
const response = await api.get(`/api/students/${studentId}`);
```

### From Manual Auth Headers
```javascript
// Before
const token = localStorage.getItem('authToken');
const response = await axios.get('/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Branch-Code': branchCode
  }
});

// After
import api from '@/config/axios.config';
const response = await api.get('/api/students');
// Auth headers automatically included
```

## Troubleshooting

### Issue: "Endpoint not found" warning
**Solution:** Check if the endpoint path is correct. Use `hasEndpoint` to verify.

### Issue: Environment variables not working
**Solution:** Ensure variables start with `VITE_` prefix and restart dev server.

### Issue: Dynamic endpoints not working
**Solution:** Pass parameters as second argument: `getEndpoint('STUDENTS.BY_ID', { id: 123 })`

### Issue: Query parameters not included
**Solution:** Use `buildURL` instead of `getEndpoint` for query parameters.

## More Examples

See `api.config.usage.example.js` for 12 comprehensive examples covering:
- Simple requests
- Dynamic endpoints
- Query parameters
- Authentication
- File uploads
- Error handling
- React components
- Custom hooks
- And more!

## Support

For questions or issues:
1. Check the usage examples file
2. Review this README
3. Check the main config file documentation
4. Contact the development team

---

**Last Updated:** 2024-01-XX  
**Version:** 1.0  
**Spec:** Skoolific V2 Upgrade - Phase 1.2
