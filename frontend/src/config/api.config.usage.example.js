/**
 * API Config Usage Examples
 * 
 * This file demonstrates how to use the centralized API configuration
 * in your React components and services.
 */

import axios from 'axios';
import { 
  getBaseURL, 
  getEndpoint, 
  getEndpointPath,
  buildURL,
  createRequestConfig,
  handleAPIError,
  API_ENDPOINTS 
} from './api.config';

// ===========================================
// EXAMPLE 1: Simple GET Request
// ===========================================

async function fetchStudents() {
  try {
    const url = getEndpoint('STUDENTS.LIST');
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Failed to fetch students:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 2: GET Request with Dynamic ID
// ===========================================

async function fetchStudentById(studentId) {
  try {
    const url = getEndpoint('STUDENTS.BY_ID', { id: studentId });
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error(`Failed to fetch student ${studentId}:`, errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 3: GET Request with Query Parameters
// ===========================================

async function searchStudents(searchTerm, page = 1, limit = 10) {
  try {
    const url = buildURL('STUDENTS.SEARCH', {}, { 
      q: searchTerm, 
      page, 
      limit 
    });
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Search failed:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 4: POST Request with Authentication
// ===========================================

async function createStudent(studentData) {
  try {
    const url = getEndpoint('STUDENTS.REGISTER');
    const config = createRequestConfig({
      method: 'POST',
      data: studentData,
      auth: true // Include authentication token
    });
    
    const response = await axios.post(url, config.data, config);
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Failed to create student:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 5: Login (No Authentication Required)
// ===========================================

async function login(username, password, branchCode) {
  try {
    const url = getEndpoint('AUTH.LOGIN');
    const config = createRequestConfig({
      method: 'POST',
      data: { username, password, branchCode },
      auth: false // No auth token needed for login
    });
    
    const response = await axios.post(url, config.data, config);
    
    // Save token after successful login
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('branchCode', branchCode);
    }
    
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Login failed:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 6: Using Axios Instance (Recommended)
// ===========================================

// Create a configured axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const branchCode = localStorage.getItem('branchCode');
    if (branchCode) {
      config.headers['X-Branch-Code'] = branchCode;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorInfo = handleAPIError(error);
    
    // Handle 401 Unauthorized - redirect to login
    if (errorInfo.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('branchCode');
      window.location.href = '/login';
    }
    
    return Promise.reject(errorInfo);
  }
);

// Now use the configured instance
async function fetchStudentsWithInstance() {
  try {
    const path = getEndpointPath('STUDENTS.LIST');
    const response = await api.get(path);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error.message);
    throw error;
  }
}

// ===========================================
// EXAMPLE 7: React Component Usage
// ===========================================

import { useState, useEffect } from 'react';

function StudentListComponent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const url = getEndpoint('STUDENTS.LIST');
        const response = await axios.get(url);
        setStudents(response.data);
        setError(null);
      } catch (err) {
        const errorInfo = handleAPIError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
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
// EXAMPLE 8: Nested Endpoint Access
// ===========================================

async function fetchMarkListByClass(classId) {
  try {
    const url = getEndpoint('ACADEMIC.MARK_LIST.BY_CLASS', { id: classId });
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Failed to fetch mark list:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 9: File Upload
// ===========================================

async function uploadBrandingImage(file) {
  try {
    const url = getEndpoint('SETTINGS.BRANDING');
    const formData = new FormData();
    formData.append('image', file);
    
    const config = createRequestConfig({
      method: 'POST',
      auth: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const response = await axios.post(url, formData, config);
    return response.data;
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Failed to upload image:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 10: Multiple Requests in Parallel
// ===========================================

async function fetchDashboardData() {
  try {
    const [stats, recentFaults, attendanceSummary] = await Promise.all([
      axios.get(getEndpoint('DASHBOARD.STATS')),
      axios.get(getEndpoint('DASHBOARD.RECENT_FAULTS')),
      axios.get(getEndpoint('DASHBOARD.ATTENDANCE_SUMMARY'))
    ]);
    
    return {
      stats: stats.data,
      recentFaults: recentFaults.data,
      attendanceSummary: attendanceSummary.data
    };
  } catch (error) {
    const errorInfo = handleAPIError(error);
    console.error('Failed to fetch dashboard data:', errorInfo.message);
    throw errorInfo;
  }
}

// ===========================================
// EXAMPLE 11: Checking Endpoint Existence
// ===========================================

import { hasEndpoint } from './api.config';

function makeAPICall(endpointPath) {
  if (!hasEndpoint(endpointPath)) {
    console.error(`Endpoint ${endpointPath} does not exist in configuration`);
    return;
  }
  
  const url = getEndpoint(endpointPath);
  // Make the API call...
}

// ===========================================
// EXAMPLE 12: Getting All Module Endpoints
// ===========================================

import { getModuleEndpoints } from './api.config';

function logAllAuthEndpoints() {
  const authEndpoints = getModuleEndpoints('AUTH');
  console.log('Available auth endpoints:', authEndpoints);
  // Output: { LOGIN: '/api/v2/auth/login', VALIDATE_BRANCH: '/api/v2/branches/validate', ... }
}

// ===========================================
// EXPORT CONFIGURED API INSTANCE
// ===========================================

export { api };
export default api;
