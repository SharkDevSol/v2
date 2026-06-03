import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:3000/api/super-admin';

function Dashboard({ credentials, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAggregatedData();
  }, []);

  const fetchAggregatedData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aggregate/all`, {
        headers: { 'Authorization': `Bearer ${credentials.token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError('Failed to load aggregated data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(n || 0);
  };

  const renderOverview = () => {
    if (!data) return null;
    const { enrollment, finance, attendance, academic } = data;

    return (
      <div>
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">🎓</div>
            <div className="stat-value">{enrollment.totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <div className="stat-sub">
              ♂ {enrollment.byGender.male} | ♀ {enrollment.byGender.female}
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{formatCurrency(finance.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-sub">Pending: {formatCurrency(finance.totalPending)}</div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{attendance.attendanceRate || 'N/A'}%</div>
            <div className="stat-label">Attendance Rate</div>
            <div className="stat-sub">Present: {attendance.totalPresent} | Absent: {attendance.totalAbsent}</div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{academic.averageScore || 'N/A'}</div>
            <div className="stat-label">Avg Score</div>
            <div className="stat-sub">Pass Rate: {academic.passingRate || 'N/A'}%</div>
          </div>
        </div>

        <div className="branch-comparison">
          <h3>📊 Branch Comparison</h3>
          <div className="branch-table-wrapper">
            <table className="branch-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Students</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {enrollment.byBranch && enrollment.byBranch.filter(b => !b.error).map(branch => {
                  const fin = finance.byBranch?.find(f => f.branchCode === branch.branchCode);
                  const att = attendance.byBranch?.find(a => a.branchCode === branch.branchCode);
                  const acad = academic.byBranch?.find(a => a.branchCode === branch.branchCode);
                  return (
                    <tr key={branch.branchCode}>
                      <td><strong>{branch.branchName}</strong></td>
                      <td>{branch.totalStudents}</td>
                      <td>{branch.byGender?.male || 0}</td>
                      <td>{branch.byGender?.female || 0}</td>
                      <td>{formatCurrency(fin?.totalRevenue)}</td>
                      <td>{formatCurrency(fin?.totalExpenses)}</td>
                      <td>{att?.totalPresent || 0}</td>
                      <td>{att?.totalAbsent || 0}</td>
                      <td>{acad?.averageScore || 'N/A'}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEnrollment = () => {
    if (!data?.enrollment) return null;
    const e = data.enrollment;
    return (
      <div>
        <div className="detail-grid">
          <div className="detail-card">
            <h4>By Status</h4>
            <div className="bar-list">
              <div className="bar-item">
                <span>Active</span>
                <div className="bar"><div className="bar-fill bg-green" style={{ width: `${(e.byStatus.active / Math.max(e.totalStudents, 1)) * 100}%` }}></div></div>
                <span>{e.byStatus.active}</span>
              </div>
              <div className="bar-item">
                <span>Inactive</span>
                <div className="bar"><div className="bar-fill bg-yellow" style={{ width: `${(e.byStatus.inactive / Math.max(e.totalStudents, 1)) * 100}%` }}></div></div>
                <span>{e.byStatus.inactive}</span>
              </div>
              <div className="bar-item">
                <span>Graduated</span>
                <div className="bar"><div className="bar-fill bg-blue" style={{ width: `${(e.byStatus.graduated / Math.max(e.totalStudents, 1)) * 100}%` }}></div></div>
                <span>{e.byStatus.graduated}</span>
              </div>
            </div>
          </div>
          <div className="detail-card">
            <h4>By Grade</h4>
            <div className="bar-list">
              {Object.entries(e.byGrade || {}).map(([grade, count]) => (
                <div key={grade} className="bar-item">
                  <span>{grade}</span>
                  <div className="bar"><div className="bar-fill bg-purple" style={{ width: `${(count / Math.max(e.totalStudents, 1)) * 100}%` }}></div></div>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBranchDetail = () => {
    if (!data?.enrollment?.byBranch) return null;
    return (
      <div className="branch-detail-grid">
        {data.enrollment.byBranch.filter(b => !b.error).map(branch => {
          const fin = data.finance?.byBranch?.find(f => f.branchCode === branch.branchCode);
          const att = data.attendance?.byBranch?.find(a => a.branchCode === branch.branchCode);
          const acad = data.academic?.byBranch?.find(a => a.branchCode === branch.branchCode);
          return (
            <div key={branch.branchCode} className="branch-card">
              <h4>🏫 {branch.branchName} ({branch.branchCode})</h4>
              <div className="branch-metrics">
                <div className="metric"><span>Students</span><strong>{branch.totalStudents}</strong></div>
                <div className="metric"><span>Staff</span><strong>{branch.byGender ? '-' : '-'}</strong></div>
                <div className="metric"><span>Revenue</span><strong>{formatCurrency(fin?.totalRevenue)}</strong></div>
                <div className="metric"><span>Expenses</span><strong>{formatCurrency(fin?.totalExpenses)}</strong></div>
                <div className="metric"><span>Net Income</span><strong className={fin?.netIncome >= 0 ? 'text-green' : 'text-red'}>{formatCurrency(fin?.netIncome)}</strong></div>
                <div className="metric"><span>Present</span><strong>{att?.totalPresent || 0}</strong></div>
                <div className="metric"><span>Absent</span><strong>{att?.totalAbsent || 0}</strong></div>
                <div className="metric"><span>Att Rate</span><strong>{att?.attendanceRate || 'N/A'}%</strong></div>
                <div className="metric"><span>Avg Score</span><strong>{acad?.averageScore || 'N/A'}%</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏫 Skoolific Super Admin</h1>
          <span className="super-admin-badge">⭐ Super Admin</span>
          <span className="school-badge">{credentials?.schoolName || 'Dire Schools'}</span>
        </div>
        <div className="header-right">
          <span className="user-info">👤 {credentials?.username}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
          <button onClick={fetchAggregatedData} className="refresh-button" disabled={loading}>🔄</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button className={`tab-btn ${activeTab === 'enrollment' ? 'active' : ''}`} onClick={() => setActiveTab('enrollment')}>🎓 Enrollment</button>
        <button className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} onClick={() => setActiveTab('branches')}>🏫 Branches</button>
      </nav>

      <main className="dashboard-main">
        {error && <div className="error-banner">{error}</div>}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading cross-branch aggregated data...</p>
          </div>
        )}

        {!loading && data && (
          <>
            <div className="timestamp-bar">
              Last updated: {new Date(data.enrollment?.timestamp || Date.now()).toLocaleString()}
              {' | '}Total branches: {data.enrollment?.byBranch?.filter(b => !b.error).length || 0}
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'enrollment' && renderEnrollment()}
            {activeTab === 'branches' && renderBranchDetail()}
          </>
        )}

        {!loading && !data && !error && (
          <div className="empty-state">
            <h2>👋 Welcome, {credentials?.username}!</h2>
            <p>Click refresh to load cross-branch data from all branches.</p>
            <button onClick={fetchAggregatedData} className="load-button">Load Data</button>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>Skoolific V2.0.0 | Super Admin Dashboard | Cross-Branch Data Aggregation</p>
      </footer>
    </div>
  );
}

export default Dashboard;
