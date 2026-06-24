import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SuperAdmin = () => {
  const [branches, setBranches] = useState([]);
  const [aggregate, setAggregate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('superAdminToken'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (isLoggedIn) { fetchData(); }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, aggRes] = await Promise.all([
        api.get('/super-admin/branches'),
        api.get('/super-admin/aggregate/all')
      ]);
      setBranches(branchesRes.data.branches || []);
      setAggregate(aggRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      if (err.response?.status === 401) { handleLogout(); }
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/super-admin/login', loginForm);
      localStorage.setItem('superAdminToken', res.data.token);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#1a1a2e' }}>Super Admin</h1>
        <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>Multi-branch overview</p>
        {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px', borderRadius:8, marginBottom:16, fontSize:14 }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input type="text" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm(f => ({...f, username: e.target.value}))}
            style={{ padding:'10px 14px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:14 }} required />
          <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm(f => ({...f, password: e.target.value}))}
            style={{ padding:'10px 14px', borderRadius:8, border:'1.5px solid #e2e8f0', fontSize:14 }} required />
          <button type="submit" style={{ padding:'12px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontWeight:600, cursor:'pointer' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, color:'#1a1a2e' }}>Super Admin Dashboard</h1>
          <p style={{ margin:'4px 0 0', color:'#64748b', fontSize:14 }}>Cross-branch overview</p>
        </div>
        <button onClick={handleLogout} style={{ padding:'8px 20px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', cursor:'pointer' }}>Logout</button>
      </div>

      {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 16px', borderRadius:8, marginBottom:16, fontSize:14 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#64748b' }}>Loading...</div>
      ) : aggregate && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:16, marginBottom:24 }}>
            <StatCard label="Total Branches" value={branches.length} color="#667eea" />
            <StatCard label="Total Students" value={aggregate.enrollment?.totalStudents || 0} color="#10b981" />
            <StatCard label="Total Staff" value={aggregate.enrollment?.totalStaff || 0} color="#f59e0b" />
            <StatCard label="Total Revenue" value={`${(aggregate.finance?.totalRevenue || 0).toLocaleString()} Birr`} color="#ef4444" />
          </div>

          <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin:'0 0 16px', fontSize:18, color:'#1e293b' }}>Branches</h2>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #e2e8f0' }}>
                    <th style={{ padding:'10px 12px', textAlign:'left', color:'#475569' }}>Branch</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', color:'#475569' }}>Students</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', color:'#475569' }}>Staff</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', color:'#475569' }}>Classes</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', color:'#475569' }}>Revenue</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', color:'#475569' }}>Attendance</th>
                    <th style={{ padding:'10px 12px', textAlign:'center', color:'#475569' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map(b => (
                    <tr key={b.code} style={{ borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'10px 12px', fontWeight:600 }}>{b.name} <span style={{ color:'#94a3b8', fontWeight:400 }}>({b.code})</span></td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{b.stats?.students || b.studentCount || 0}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{b.stats?.staff || b.staffCount || 0}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{b.stats?.classes || b.classCount || 0}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{(b.stats?.revenue || 0).toLocaleString()}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>{b.stats?.attendance || 'N/A'}</td>
                      <td style={{ padding:'10px 12px', textAlign:'center' }}>
                        <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600, background:b.is_active ? '#dcfce7' : '#fee2e2', color:b.is_active ? '#16a34a' : '#dc2626' }}>
                          {b.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
    <p style={{ margin:'0 0 8px', fontSize:13, color:'#64748b' }}>{label}</p>
    <p style={{ margin:0, fontSize:28, fontWeight:700, color }}>{value}</p>
  </div>
);

export default SuperAdmin;
