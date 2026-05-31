import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, FileText, Users } from 'lucide-react';
import styles from './FinanceReports.module.css';
import api from '../../utils/api';
import { getCurrentEthiopianMonth } from '../../utils/ethiopianCalendar';

import Card from '../../COMPONENTS/Card/Card';
import Button from '../../COMPONENTS/Button/Button';
import StatCard from '../../COMPONENTS/StatCard/StatCard';

const FinanceReports = () => {
  const { t } = useTranslation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentEthiopianMonth, setCurrentEthiopianMonth] = useState(() => {
    const currentMonth = getCurrentEthiopianMonth();
    return currentMonth.month;
  });
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);
  const [unpaidStudents, setUnpaidStudents] = useState([]);

  const ethiopianMonths = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
  ];

  useEffect(() => {
    const currentMonth = getCurrentEthiopianMonth();
    setCurrentEthiopianMonth(currentMonth.month);
    fetchOverview();
  }, []);

  // Auto-update Ethiopian month every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMonth = getCurrentEthiopianMonth();
      const newMonth = currentMonth.month;
      
      if (newMonth !== currentEthiopianMonth) {
        console.log(`📅 Ethiopian month changed from ${currentEthiopianMonth} to ${newMonth}`);
        setCurrentEthiopianMonth(newMonth);
        fetchOverview();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentEthiopianMonth]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/monthly-payments-view/overview?currentMonth=${currentEthiopianMonth}`);
      console.log('📊 Financial Reports Data:', response.data);
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
      alert('Failed to fetch financial reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/monthly-payments-view/unpaid-students?currentMonth=${currentEthiopianMonth}`);
      console.log('📋 Unpaid Students Data:', response.data);
      setUnpaidStudents(response.data.students || []);
      setShowUnpaidModal(true);
    } catch (error) {
      console.error('Error fetching unpaid students:', error);
      alert('Failed to fetch unpaid students details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading financial reports...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className={styles.container}>
        <h2>No data available</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{t('finance.reports.title', 'Financial Reports')}</h1>
          <p>{t('finance.reports.subtitle', 'Comprehensive financial overview and analytics')}</p>
        </div>
        <div className={styles.exportActions}>
          <Button variant="secondary" icon={<FileText size={16} />} onClick={() => window.print()}>
            {t('finance.reports.exportPdf', 'Export PDF')}
          </Button>
          <Button variant="secondary" icon={<FileSpreadsheet size={16} />} onClick={fetchUnpaidStudents}>
            {t('finance.reports.exportExcel', 'Export unpaid list')}
          </Button>
        </div>
      </div>

      {/* Current Month Indicator */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '12px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <div>
          <h2 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.5em' }}>
            Current Ethiopian Month: {ethiopianMonths[currentEthiopianMonth - 1]}
          </h2>
          <p style={{ margin: 0, fontSize: '1em', opacity: 0.9 }}>
            Showing unlocked months 1-{currentEthiopianMonth} ({ethiopianMonths.slice(0, currentEthiopianMonth).join(', ')})
          </p>
        </div>
        <div style={{ fontSize: '3.5em', opacity: 0.3 }}>📅</div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '3.5em', marginBottom: '15px', opacity: 0.9 }}>👥</div>
          <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1em' }}>Total Students</h3>
          <p style={{ color: 'white', fontSize: '3em', fontWeight: 'bold', margin: '15px 0' }}>
            {overview.summary.totalStudents}
          </p>
          <div style={{ display: 'flex', gap: '25px', marginTop: '15px', fontSize: '1em', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
            <div>
              <span style={{ opacity: 0.8 }}>Paying:</span>
              <strong style={{ marginLeft: '8px', fontSize: '1.2em' }}>{overview.summary.payingStudents || 0}</strong>
            </div>
            <div>
              <span style={{ opacity: 0.8 }}>Exempt:</span>
              <strong style={{ marginLeft: '8px', fontSize: '1.2em' }}>{overview.summary.freeStudents || 0}</strong>
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '3.5em', marginBottom: '15px', opacity: 0.9 }}>💰</div>
          <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1em' }}>Total Expected (Unlocked)</h3>
          <p style={{ color: 'white', fontSize: '3em', fontWeight: 'bold', margin: '15px 0' }}>
            {overview.summary.unlockedTotalAmount?.toFixed(2) || '0.00'}
          </p>
          <p style={{ fontSize: '0.95em', opacity: 0.85, margin: 0 }}>
            Birr (Months 1-{currentEthiopianMonth}, Paying Students Only)
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '3.5em', marginBottom: '15px', opacity: 0.9 }}>✓</div>
          <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1em' }}>Total Paid</h3>
          <p style={{ color: 'white', fontSize: '3em', fontWeight: 'bold', margin: '15px 0' }}>
            {overview.summary.unlockedTotalPaid?.toFixed(2) || '0.00'}
          </p>
          <p style={{ fontSize: '0.95em', opacity: 0.85, margin: 0 }}>Birr</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '3.5em', marginBottom: '15px', opacity: 0.9 }}>⏳</div>
          <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1em' }}>Total Pending</h3>
          <p style={{ color: 'white', fontSize: '3em', fontWeight: 'bold', margin: '15px 0' }}>
            {overview.summary.unlockedTotalPending?.toFixed(2) || '0.00'}
          </p>
          <p style={{ fontSize: '0.95em', opacity: 0.85, margin: 0 }}>Birr</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '3.5em', marginBottom: '15px', opacity: 0.9 }}>📈</div>
          <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1em' }}>Collection Rate</h3>
          <p style={{ color: 'white', fontSize: '3em', fontWeight: 'bold', margin: '15px 0' }}>
            {overview.summary.unlockedTotalAmount > 0 
              ? ((overview.summary.unlockedTotalPaid / overview.summary.unlockedTotalAmount) * 100).toFixed(1)
              : '0.0'}%
          </p>
          <p style={{ fontSize: '0.95em', opacity: 0.85, margin: 0 }}>Payment Collection Rate</p>
        </div>

        <div 
          onClick={fetchUnpaidStudents}
          style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ fontSize: '3.5em', marginBottom: '15px', opacity: 0.9 }}>⚠️</div>
          <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1em' }}>Unpaid Students (Unlocked)</h3>
          <p style={{ color: 'white', fontSize: '3em', fontWeight: 'bold', margin: '15px 0' }}>
            {overview.summary.unpaidUnlockedStudents || 0}
          </p>
          <p style={{ fontSize: '0.95em', opacity: 0.85, margin: 0 }}>Students with unpaid unlocked months</p>
          <p style={{ fontSize: '0.85em', opacity: 0.7, margin: '10px 0 0 0', fontStyle: 'italic' }}>Click to view details</p>
        </div>
      </div>

      {/* Class Breakdown Table */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '25px', fontSize: '1.8em' }}>Class-wise Breakdown</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <th style={{ padding: '18px 15px', textAlign: 'left', fontWeight: '600', fontSize: '0.95em' }}>Class</th>
                <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Total Students</th>
                <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Paying</th>
                <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Exempt</th>
                <th style={{ padding: '18px 15px', textAlign: 'right', fontWeight: '600', fontSize: '0.95em' }}>Total Amount</th>
                <th style={{ padding: '18px 15px', textAlign: 'right', fontWeight: '600', fontSize: '0.95em' }}>Total Paid</th>
                <th style={{ padding: '18px 15px', textAlign: 'right', fontWeight: '600', fontSize: '0.95em' }}>Total Pending</th>
                <th style={{ padding: '18px 15px', textAlign: 'center', fontWeight: '600', fontSize: '0.95em' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {overview.classes.map((classData, index) => (
                <tr key={index} style={{ 
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                  borderBottom: '1px solid #e0e0e0',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white'}
                >
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#1a202c', fontSize: '1em' }}>{classData.className}</td>
                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '1em' }}>{classData.totalStudents}</td>
                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '1em' }}>{classData.payingStudents || 0}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '16px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}>
                      {classData.freeStudents || 0}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '1em' }}>
                    {classData.unlockedTotalAmount?.toFixed(2) || '0.00'} Birr
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#28a745', fontWeight: 'bold', fontSize: '1em' }}>
                    {classData.unlockedTotalPaid?.toFixed(2) || '0.00'} Birr
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold', fontSize: '1em' }}>
                    {classData.unlockedTotalPending?.toFixed(2) || '0.00'} Birr
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '16px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                      background: classData.unlockedTotalAmount > 0 && (classData.unlockedTotalPaid / classData.unlockedTotalAmount) > 0.7 
                        ? '#28a745' 
                        : classData.unlockedTotalAmount > 0 && (classData.unlockedTotalPaid / classData.unlockedTotalAmount) > 0.4
                        ? '#ffc107'
                        : '#dc3545',
                      color: 'white',
                      display: 'inline-block'
                    }}>
                      {classData.unlockedTotalAmount > 0 
                        ? ((classData.unlockedTotalPaid / classData.unlockedTotalAmount) * 100).toFixed(1)
                        : '0.0'}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 'bold', fontSize: '1.05em' }}>
                <td style={{ padding: '18px 15px' }}>TOTAL</td>
                <td style={{ padding: '18px 15px', textAlign: 'center' }}>{overview.summary.totalStudents}</td>
                <td style={{ padding: '18px 15px', textAlign: 'center' }}>{overview.summary.payingStudents || 0}</td>
                <td style={{ padding: '18px 15px', textAlign: 'center' }}>{overview.summary.freeStudents || 0}</td>
                <td style={{ padding: '18px 15px', textAlign: 'right' }}>{overview.summary.unlockedTotalAmount?.toFixed(2) || '0.00'} Birr</td>
                <td style={{ padding: '18px 15px', textAlign: 'right' }}>{overview.summary.unlockedTotalPaid?.toFixed(2) || '0.00'} Birr</td>
                <td style={{ padding: '18px 15px', textAlign: 'right' }}>{overview.summary.unlockedTotalPending?.toFixed(2) || '0.00'} Birr</td>
                <td style={{ padding: '18px 15px', textAlign: 'center' }}>
                  {overview.summary.unlockedTotalAmount > 0 
                    ? ((overview.summary.unlockedTotalPaid / overview.summary.unlockedTotalAmount) * 100).toFixed(1)
                    : '0.0'}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Unpaid Students Modal */}
      {showUnpaidModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowUnpaidModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '25px 30px',
              borderBottom: '2px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.8em' }}>⚠️ Unpaid Students Details</h2>
              <button
                onClick={() => setShowUnpaidModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '30px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className={styles.loader}></div>
                  <p>Loading unpaid students...</p>
                </div>
              ) : unpaidStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <div style={{ fontSize: '4em', marginBottom: '20px' }}>✓</div>
                  <h3>No unpaid students found</h3>
                  <p>All students have paid their unlocked months!</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <p style={{ margin: 0, color: '#856404' }}>
                      <strong>Total Unpaid Students:</strong> {unpaidStudents.length}
                    </p>
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                          <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Student Name</th>
                          <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Class</th>
                          <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Unpaid Months</th>
                          <th style={{ padding: '15px', textAlign: 'right', fontWeight: '600' }}>Total Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unpaidStudents.map((student, index) => (
                          <tr 
                            key={index}
                            style={{
                              backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                              borderBottom: '1px solid #e0e0e0'
                            }}
                          >
                            <td style={{ padding: '15px', fontWeight: '500' }}>{student.student_name}</td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <span style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 'bold'
                              }}>
                                {student.class}
                              </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <span style={{
                                background: '#dc3545',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '12px',
                                fontSize: '0.9em',
                                fontWeight: 'bold'
                              }}>
                                {student.unpaid_months_count}
                              </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#dc3545' }}>
                              {student.total_pending?.toFixed(2) || '0.00'} Birr
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 'bold' }}>
                          <td colSpan="3" style={{ padding: '15px', textAlign: 'right' }}>TOTAL PENDING:</td>
                          <td style={{ padding: '15px', textAlign: 'right' }}>
                            {unpaidStudents.reduce((sum, s) => sum + (s.total_pending || 0), 0).toFixed(2)} Birr
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReports;
