/**
 * Axios Configuration Usage Examples
 * 
 * This file demonstrates how to use the pre-configured Axios instance
 * from axios.config.js throughout the application.
 * 
 * The axios.config.js instance provides:
 * - Automatic authentication (token + branch code)
 * - Automatic token refresh on 401 errors
 * - Request/response logging in development
 * - Retry logic for failed requests
 * - Centralized error handling
 */

import api, {
  setAuthToken,
  setRefreshToken,
  setBranchCode,
  getAuthToken,
  getBranchCode,
  clearAuth,
  isAuthenticated
} from '@/config/axios.config';

// ===========================================
// EXAMPLE 1: Login and Store Credentials
// ===========================================

async function loginExample() {
  try {
    // Login request (no auth needed for login endpoint)
    const response = await api.post('/api/v2/auth/login', {
      username: 'admin',
      password: 'password123',
      branchCode: 'ib3'
    });
    
    const { token, refreshToken, user } = response.data;
    
    // Store credentials (true = localStorage, false = sessionStorage)
    const rememberMe = true;
    setAuthToken(token, rememberMe);
    setRefreshToken(refreshToken, rememberMe);
    setBranchCode('ib3', rememberMe);
    
    console.log('Login successful:', user);
    
    // All subsequent requests will automatically include token and branch code
    return user;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 2: Simple GET Request
// ===========================================

async function getStudentsExample() {
  try {
    // Authentication and branch code automatically included
    const response = await api.get('/api/students');
    const students = response.data;
    
    console.log('Students:', students);
    return students;
  } catch (error) {
    console.error('Failed to fetch students:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 3: GET with Dynamic ID
// ===========================================

async function getStudentByIdExample(studentId) {
  try {
    const response = await api.get(`/api/students/${studentId}`);
    const student = response.data;
    
    console.log('Student:', student);
    return student;
  } catch (error) {
    console.error(`Failed to fetch student ${studentId}:`, error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 4: GET with Query Parameters
// ===========================================

async function searchStudentsExample(searchQuery, page = 1, limit = 10) {
  try {
    const response = await api.get('/api/students/search', {
      params: {
        q: searchQuery,
        page,
        limit
      }
    });
    
    const { students, total, currentPage } = response.data;
    
    console.log(`Found ${total} students (page ${currentPage})`);
    return { students, total, currentPage };
  } catch (error) {
    console.error('Search failed:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 5: POST Request
// ===========================================

async function createStudentExample(studentData) {
  try {
    const response = await api.post('/api/students/register', studentData);
    const newStudent = response.data;
    
    console.log('Student created:', newStudent);
    return newStudent;
  } catch (error) {
    console.error('Failed to create student:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 6: PUT Request
// ===========================================

async function updateStudentExample(studentId, updatedData) {
  try {
    const response = await api.put(`/api/students/${studentId}`, updatedData);
    const updatedStudent = response.data;
    
    console.log('Student updated:', updatedStudent);
    return updatedStudent;
  } catch (error) {
    console.error(`Failed to update student ${studentId}:`, error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 7: DELETE Request
// ===========================================

async function deleteStudentExample(studentId) {
  try {
    const response = await api.delete(`/api/students/${studentId}`);
    
    console.log('Student deleted successfully');
    return response.data;
  } catch (error) {
    console.error(`Failed to delete student ${studentId}:`, error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 8: Error Handling
// ===========================================

async function errorHandlingExample() {
  try {
    const response = await api.get('/api/students');
    return response.data;
  } catch (error) {
    // Error is already processed by handleAPIError
    // error object has: { status, message, data, type }
    
    switch (error.type) {
      case 'server_error':
        // 4xx or 5xx errors
        console.error('Server error:', error.message);
        if (error.status === 404) {
          console.error('Resource not found');
        } else if (error.status === 403) {
          console.error('Access denied');
        }
        break;
        
      case 'network_error':
        // No response from server
        console.error('Network error:', error.message);
        console.error('Please check your internet connection');
        break;
        
      case 'request_error':
        // Error in request setup
        console.error('Request error:', error.message);
        break;
    }
    
    throw error;
  }
}

// ===========================================
// EXAMPLE 9: File Upload
// ===========================================

async function uploadFileExample(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', 'Student photo');
    
    const response = await api.post('/api/students/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const { fileUrl } = response.data;
    console.log('File uploaded:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('File upload failed:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 10: React Component with Hooks
// ===========================================

import { useState, useEffect } from 'react';

function StudentListComponent() {
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
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Students</h2>
      <ul>
        {students.map(student => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ===========================================
// EXAMPLE 11: Custom Hook for API Calls
// ===========================================

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
  
  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/students');
      setStudents(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { students, loading, error, refetch };
}

// Usage in component
function StudentListWithHook() {
  const { students, loading, error, refetch } = useStudents();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Students</h2>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {students.map(student => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ===========================================
// EXAMPLE 12: Protected Route Component
// ===========================================

import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Usage
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// ===========================================
// EXAMPLE 13: Logout Function
// ===========================================

function LogoutButton() {
  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await api.post('/api/v2/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error.message);
    } finally {
      // Clear auth data regardless of API call result
      clearAuth();
      
      // Redirect to login
      window.location.href = '/login';
    }
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}

// ===========================================
// EXAMPLE 14: Check Authentication Status
// ===========================================

function AuthStatusComponent() {
  const authenticated = isAuthenticated();
  const token = getAuthToken();
  const branchCode = getBranchCode();
  
  return (
    <div>
      <p>Authenticated: {authenticated ? 'Yes' : 'No'}</p>
      {authenticated && (
        <>
          <p>Token: {token?.substring(0, 20)}...</p>
          <p>Branch Code: {branchCode}</p>
        </>
      )}
    </div>
  );
}

// ===========================================
// EXAMPLE 15: Parallel Requests
// ===========================================

async function fetchDashboardDataExample() {
  try {
    // Make multiple requests in parallel
    const [studentsRes, staffRes, attendanceRes] = await Promise.all([
      api.get('/api/students'),
      api.get('/api/staff'),
      api.get('/api/attendance/summary')
    ]);
    
    return {
      students: studentsRes.data,
      staff: staffRes.data,
      attendance: attendanceRes.data
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 16: Request with Custom Headers
// ===========================================

async function customHeadersExample() {
  try {
    const response = await api.get('/api/students', {
      headers: {
        'X-Custom-Header': 'custom-value',
        'Accept-Language': 'en-US'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 17: Request with Timeout
// ===========================================

async function timeoutExample() {
  try {
    // Override default timeout (30s) for this specific request
    const response = await api.get('/api/students', {
      timeout: 5000 // 5 seconds
    });
    
    return response.data;
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.error('Request timed out after 5 seconds');
    }
    throw error;
  }
}

// ===========================================
// EXAMPLE 18: Abort Request
// ===========================================

async function abortRequestExample() {
  const controller = new AbortController();
  
  try {
    const response = await api.get('/api/students', {
      signal: controller.signal
    });
    
    return response.data;
  } catch (error) {
    if (error.name === 'CanceledError') {
      console.log('Request was cancelled');
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}

// Usage: Cancel request after 2 seconds
function AbortExample() {
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchStudents() {
      try {
        const response = await api.get('/api/students', {
          signal: controller.signal
        });
        setStudents(response.data);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to fetch students:', error.message);
        }
      }
    }
    
    fetchStudents();
    
    // Cleanup: abort request if component unmounts
    return () => controller.abort();
  }, []);
  
  return <div>{/* Render students */}</div>;
}

// ===========================================
// EXPORT EXAMPLES
// ===========================================

export {
  loginExample,
  getStudentsExample,
  getStudentByIdExample,
  searchStudentsExample,
  createStudentExample,
  updateStudentExample,
  deleteStudentExample,
  errorHandlingExample,
  uploadFileExample,
  StudentListComponent,
  useStudents,
  ProtectedRoute,
  LogoutButton,
  AuthStatusComponent,
  fetchDashboardDataExample,
  customHeadersExample,
  timeoutExample,
  abortRequestExample
};
