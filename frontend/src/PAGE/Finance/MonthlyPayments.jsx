import { useState, useEffect } from 'react';
import styles from './MonthlyPayments.module.css';
import api from '../../utils/api';

const MonthlyPayments = () => {
  const [overview, setOverview] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassDetails();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentDetails();
    }
  }, [selectedStudent]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/monthly-payments-view/overview');
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
      alert('Failed to fetch payment overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/monthly-payments-view/class/${selectedClass}`);
      setClassDetails(response.data);
    } catch (error) {
      console.error('Error fetching class details:', error);
      alert('Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/monthly-payments-view/student/${selectedStudent}`);
      setStudentDetails(response.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return styles.statusPaid;
      case 'PARTIALLY_PAID':
        return styles.statusPartial;
      case 'OVERDUE':
        return styles.statusOverdue;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return '✓ Paid';
      case 'PARTIALLY_PAID':
        return '⚠ Partial';
      case 'OVERDUE':
        return '⚠ Overdue';
      case 'PENDING':
        return '○ Pending';
      default:
        return status;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Monthly Payment Tracking</h1>
        
        <div className={styles.filters}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className={styles.select}
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className={styles.select}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}

      {overview && !selectedClass && (
        <div className={styles.overviewSection}>
          <div className={styles.summaryCards}>
            <div className={styles.card}>
              <h3>Total Students</h3>
              <p className={styles.bigNumber}>{overview.summary.totalStudents}</p>
            </div>
            <div className={`${styles.card} ${styles.cardSuccess}`}>
              <h3>Paid</h3>
              <p className={styles.bigNumber}>{overview.summary.totalPaid}</p>
            </div>
            <div className={`${styles.card} ${styles.cardWarning}`}>
              <h3>Partial</h3>
              <p className={styles.bigNumber}>{overview.summary.totalPartial}</p>
            </div>
            <div className={`${styles.card} ${styles.cardDanger}`}>
              <h3>Unpaid</h3>
              <p className={styles.bigNumber}>{overview.summary.totalUnpaid}</p>
            </div>
            <div className={`${styles.card} ${styles.cardInfo}`}>
              <h3>Total Collected (Unlocked)</h3>
              <p className={styles.bigNumber}>${(overview.summary.unlockedTotalPaid || overview.summary.totalCollected).toFixed(2)}</p>
            </div>
            <div className={`${styles.card} ${styles.cardInfo}`}>
              <h3>Total Pending (Unlocked)</h3>
              <p className={styles.bigNumber}>${(overview.summary.unlockedTotalPending || overview.summary.totalPending).toFixed(2)}</p>
            </div>
          </div>

          <div className={styles.classesSection}>
            <h2>Classes</h2>
            <div className={styles.classGrid}>
              {overview.classes.map((classData, index) => (
                <div 
                  key={index} 
                  className={styles.classCard}
                  onClick={() => setSelectedClass(classData.className)}
                >
                  <h3>{classData.className}</h3>
                  <div className={styles.classStats}>
                    <div className={styles.stat}>
                      <span className={styles.label}>Monthly Fee:</span>
                      <span className={styles.value}>${classData.monthlyFee.toFixed(2)}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Total Students:</span>
                      <span className={styles.value}>{classData.totalStudents}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={`${styles.label} ${styles.success}`}>Paid:</span>
                      <span className={styles.value}>{classData.paidStudents}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={`${styles.label} ${styles.danger}`}>Unpaid:</span>
                      <span className={styles.value}>{classData.unpaidStudents}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Collected (Unlocked):</span>
                      <span className={styles.value}>${(classData.unlockedTotalPaid || classData.totalCollected || 0).toFixed(2)}</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.label}>Pending (Unlocked):</span>
                      <span className={styles.value}>${(classData.unlockedTotalPending || classData.totalPending || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {classDetails && selectedClass && (
        <div className={styles.classDetailsSection}>
          <div className={styles.backButton}>
            <button onClick={() => {
              setSelectedClass(null);
              setClassDetails(null);
            }}>
              ← Back to Overview
            </button>
          </div>

          <h2>{classDetails.className} - {months[selectedMonth - 1]} {selectedYear}</h2>

          <div className={styles.summaryCards}>
            <div className={styles.card}>
              <h3>Total Students</h3>
              <p className={styles.bigNumber}>{classDetails.summary.totalStudents}</p>
            </div>
            <div className={`${styles.card} ${styles.cardSuccess}`}>
              <h3>Paid</h3>
              <p className={styles.bigNumber}>{classDetails.summary.paidCount}</p>
            </div>
            <div className={`${styles.card} ${styles.cardWarning}`}>
              <h3>Partial</h3>
              <p className={styles.bigNumber}>{classDetails.summary.partialCount}</p>
            </div>
            <div className={`${styles.card} ${styles.cardDanger}`}>
              <h3>Unpaid</h3>
              <p className={styles.bigNumber}>{classDetails.summary.unpaidCount}</p>
            </div>
          </div>

          <div className={styles.studentsTable}>
            <h3>Student Payment Status</h3>
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Invoice Number</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Payments</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classDetails.students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.studentId}</td>
                    <td>{student.invoiceNumber}</td>
                    <td>${student.amount.toFixed(2)}</td>
                    <td>${student.paidAmount.toFixed(2)}</td>
                    <td>${student.balance.toFixed(2)}</td>
                    <td>
                      <span className={styles.paymentCount}>
                        {student.paymentCount || 0} {student.paymentCount === 1 ? 'payment' : 'payments'}
                      </span>
                      {student.paymentCount > 0 && (
                        <button 
                          className={styles.viewHistoryBtn}
                          onClick={() => openPaymentHistory(student)}
                          title="View payment history"
                        >
                          📋
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusColor(student.status)}`}>
                        {getStatusText(student.status)}
                      </span>
                    </td>
                    <td>{new Date(student.dueDate).toLocaleDateString()}</td>
                    <td>
                      {student.status !== 'PAID' && (
                        <button 
                          className={styles.payButton}
                          onClick={() => openPaymentModal(student)}
                        >
                          Record Payment
                        </button>
                      )}
                      {student.status === 'PAID' && (
                        <span className={styles.paidLabel}>✓ Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPaymentModal && selectedStudent && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Record Payment</h2>
            <p>Student ID: {selectedStudent.studentId}</p>
            <p>Invoice: {selectedStudent.invoiceNumber}</p>
            <p>Balance Due: ${selectedStudent.balance.toFixed(2)}</p>

            <form onSubmit={handleRecordPayment}>
              <div className={styles.formGroup}>
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  max={selectedStudent.balance}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="ONLINE">Online Payment</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reference Number (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({...paymentForm, referenceNumber: e.target.value})}
                  placeholder="Transaction reference"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitButton}>
                  Record Payment
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedStudent(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentHistory && selectedStudent && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Payment History</h2>
            <div className={styles.historyHeader}>
              <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
              <p><strong>Invoice:</strong> {selectedStudent.invoiceNumber}</p>
              <p><strong>Total Amount:</strong> ${selectedStudent.amount.toFixed(2)}</p>
              <p><strong>Total Paid:</strong> ${selectedStudent.paidAmount.toFixed(2)}</p>
              <p><strong>Balance:</strong> ${selectedStudent.balance.toFixed(2)}</p>
              <p><strong>Number of Payments:</strong> {selectedStudent.paymentCount || 0}</p>
            </div>

            {selectedStudent.payments && selectedStudent.payments.length > 0 ? (
              <div className={styles.paymentHistoryList}>
                <h3>Payment Transactions</h3>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Receipt</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{payment.receiptNumber}</td>
                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td>${parseFloat(payment.amount).toFixed(2)}</td>
                        <td>
                          <span className={styles.methodBadge}>
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noPayments}>
                <p>No payments recorded yet.</p>
              </div>
            )}

            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => {
                  setShowPaymentHistory(false);
                  setSelectedStudent(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPayments;
