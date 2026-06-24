import React, { useState, useEffect } from 'react';
import styles from './PaymentManagement.module.css';

const FeePaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    fromDate: '',
    toDate: ''
  });
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPayments: 0,
    totalBalance: 0,
    studentsWithBalance: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchFeeStructures();
  }, [filter, dateFilter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      if (dateFilter.fromDate) params.append('fromDate', dateFilter.fromDate);
      if (dateFilter.toDate) params.append('toDate', dateFilter.toDate);
      
      const response = await fetch(`/api/fee-payments?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data);
        
        // Calculate stats
        const uniqueStudents = new Map();
        let totalCollected = 0;
        
        data.data.forEach(payment => {
          const key = `${payment.student_id}-${payment.fee_structure_id}`;
          const feeAmount = parseFloat(payment.fee_amount || 0);
          const totalPaid = parseFloat(payment.total_paid || 0);
          const balance = feeAmount - totalPaid;
          
          totalCollected += parseFloat(payment.amount);
          
          if (!uniqueStudents.has(key)) {
            uniqueStudents.set(key, {
              feeAmount,
              totalPaid,
              balance
            });
          }
        });
        
        let totalBalance = 0;
        let studentsWithBalance = 0;
        
        uniqueStudents.forEach(student => {
          totalBalance += student.balance;
          if (student.balance > 0) {
            studentsWithBalance++;
          }
        });
        
        setStats({
          totalCollected,
          totalPayments: data.data.length,
          totalBalance,
          studentsWithBalance
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/simple-fees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Only show active fee structures
        setFeeStructures(data.data.filter(f => f.isActive));
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment record?')) return;
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/fee-payments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchPayments();
        alert('Payment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handlePrintDirect = (payment) => {
    // Calculate amounts
    const feeAmount = parseFloat(payment.fee_amount || 0);
    const totalPaid = parseFloat(payment.total_paid || 0);
    const balance = feeAmount - totalPaid;
    const isPaid = balance <= 0;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    // Write the HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${payment.receipt_number}</title>
        <style>
          @page {
            size: 105mm 148mm;
            margin: 2mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            padding: 2mm;
            font-size: 7pt;
            line-height: 1.1;
          }
          
          h1 {
            font-size: 10pt;
            margin-bottom: 1px;
            text-align: center;
            font-weight: bold;
          }
          
          h2 {
            font-size: 9pt;
            margin: 2mm 0 1mm 0;
            text-align: center;
            font-weight: bold;
          }
          
          h3 {
            font-size: 7pt;
            margin: 1.5mm 0 0.5mm 0;
            border-bottom: 0.5px solid #333;
            padding-bottom: 0.5mm;
            font-weight: bold;
          }
          
          p {
            margin: 0.5mm 0;
            font-size: 6pt;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0.5mm 0;
          }
          
          td {
            padding: 0.3mm 0;
            font-size: 6.5pt;
            vertical-align: top;
          }
          
          .header {
            text-align: center;
            border-bottom: 0.5px solid #333;
            padding-bottom: 1.5mm;
            margin-bottom: 1.5mm;
          }
          
          .section {
            margin-bottom: 1.5mm;
          }
          
          .amount-box {
            background: #f5f5f5;
            padding: 1mm;
            border: 0.5px solid #ddd;
            margin: 1mm 0;
          }
          
          .total-row {
            border-top: 0.5px solid #333;
            padding-top: 0.5mm;
            margin-top: 0.5mm;
            font-weight: bold;
          }
          
          .footer {
            border-top: 0.5px dashed #999;
            padding-top: 1mm;
            margin-top: 1.5mm;
            text-align: center;
            font-size: 5pt;
            color: #666;
          }
          
          .badge {
            display: inline-block;
            padding: 1mm 2mm;
            background: ${isPaid ? '#4CAF50' : '#FF9800'};
            color: white;
            border-radius: 2mm;
            font-size: 6pt;
            font-weight: bold;
            margin: 0.5mm 0;
          }
          
          @media print {
            body {
              padding: 1mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SCHOOL NAME</h1>
          <p>School Address | City, State | (123) 456-7890</p>
        </div>
        
        <h2>PAYMENT RECEIPT</h2>
        <p style="text-align: center; font-weight: bold; font-size: 8pt;">${payment.receipt_number}</p>
        <p style="text-align: center;"><span class="badge">${isPaid ? '✅ PAID' : '⚠️ PARTIAL'}</span></p>
        
        <div class="section">
          <h3>Student & Fee Info</h3>
          <table>
            <tr>
              <td style="width: 30%;">Student:</td>
              <td style="font-weight: bold;">${payment.student_name || '-'} (${payment.student_id})</td>
            </tr>
            <tr>
              <td>Class:</td>
              <td style="font-weight: bold;">${payment.class_name || '-'}</td>
            </tr>
            <tr>
              <td>Fee:</td>
              <td style="font-weight: bold;">${payment.fee_name || '-'} (${payment.fee_type === 'CUSTOM' && payment.custom_fee_name ? payment.custom_fee_name : payment.fee_type})</td>
            </tr>
            <tr>
              <td>Year/Term:</td>
              <td style="font-weight: bold;">${payment.academic_year || '-'}${payment.term ? ' / ' + payment.term : ''}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h3>Payment Info</h3>
          <table>
            <tr>
              <td style="width: 30%;">Date:</td>
              <td style="font-weight: bold;">${new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td style="font-weight: bold; color: #4CAF50; font-size: 8pt;">$${parseFloat(payment.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Method:</td>
              <td style="font-weight: bold;">${payment.payment_method.replace('_', ' ')}</td>
            </tr>
            ${payment.reference_number ? `<tr><td>Ref:</td><td style="font-weight: bold;">${payment.reference_number}</td></tr>` : ''}
          </table>
        </div>
        
        <div class="amount-box">
          <table style="font-size: 6.5pt;">
            <tr>
              <td>Total Fee:</td>
              <td style="text-align: right; font-weight: bold;">$${feeAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>This Payment:</td>
              <td style="text-align: right; font-weight: bold; color: #2196F3;">$${parseFloat(payment.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total Paid:</td>
              <td style="text-align: right; font-weight: bold; color: #4CAF50;">$${totalPaid.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td style="font-size: 7pt;">Balance:</td>
              <td style="text-align: right; font-size: 8pt; color: ${isPaid ? '#4CAF50' : '#f44336'};">$${balance.toFixed(2)} ${isPaid ? '✅' : ''}</td>
            </tr>
          </table>
        </div>
        
        ${payment.notes ? `
        <div class="section">
          <h3>Notes</h3>
          <p style="font-style: italic; font-size: 5.5pt;">${payment.notes}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p style="font-weight: bold;">Thank you for your payment!</p>
          <p>Official receipt - Keep for your records</p>
          <p style="font-size: 4.5pt; margin-top: 0.5mm;">Printed: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const clearDateFilter = () => {
    setDateFilter({ fromDate: '', toDate: '' });
  };

  const filteredPayments = payments.filter(payment =>
    payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Fee Payment Tracking</h1>
          <p>Record and track payments for fee structures</p>
        </div>
        <button 
          className={styles.recordButton}
          onClick={() => setShowRecordModal(true)}
        >
          + Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Total Collected</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.totalCollected.toFixed(2)}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
            {stats.totalPayments} payment{stats.totalPayments !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Total Outstanding</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.totalBalance.toFixed(2)}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
            {stats.studentsWithBalance} student{stats.studentsWithBalance !== 1 ? 's' : ''} with balance
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Collection Rate</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {stats.totalCollected + stats.totalBalance > 0 
              ? ((stats.totalCollected / (stats.totalCollected + stats.totalBalance)) * 100).toFixed(1)
              : 0}%
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
            of total fees
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Average Payment</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            ${stats.totalPayments > 0 ? (stats.totalCollected / stats.totalPayments).toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
            per transaction
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map(status => (
            <button
              key={status}
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by receipt, student ID, or name..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: '1', minWidth: '250px' }}
          />
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>From:</label>
            <input
              type="date"
              className={styles.dateInput}
              value={dateFilter.fromDate}
              onChange={(e) => setDateFilter({...dateFilter, fromDate: e.target.value})}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>To:</label>
            <input
              type="date"
              className={styles.dateInput}
              value={dateFilter.toDate}
              onChange={(e) => setDateFilter({...dateFilter, toDate: e.target.value})}
            />
          </div>
          
          {(dateFilter.fromDate || dateFilter.toDate) && (
            <button 
              onClick={clearDateFilter}
              className={styles.clearButton}
              title="Clear date filter"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className={styles.loading}>Loading payments...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Fee Type</th>
                <th>Fee Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="10" className={styles.noData}>
                    No payments found. Click "Record Payment" to add one.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => {
                  const feeAmount = parseFloat(payment.fee_amount || 0);
                  const totalPaid = parseFloat(payment.total_paid || 0);
                  const balance = feeAmount - totalPaid;
                  
                  return (
                    <tr key={payment.id}>
                      <td className={styles.receiptNumber}>{payment.receipt_number}</td>
                      <td>{payment.student_id}</td>
                      <td>{payment.student_name || '-'}</td>
                      <td>{payment.class_name || '-'}</td>
                      <td className={styles.feeType}>
                        {payment.fee_type === 'CUSTOM' && payment.custom_fee_name 
                          ? payment.custom_fee_name 
                          : payment.fee_type}
                      </td>
                      <td className={styles.amount}>${feeAmount.toFixed(2)}</td>
                      <td className={styles.amount}>${totalPaid.toFixed(2)}</td>
                      <td className={styles.amount} style={{ 
                        color: balance > 0 ? '#f44336' : '#4CAF50',
                        fontWeight: 'bold'
                      }}>
                        ${balance.toFixed(2)}
                        {balance <= 0 && ' ✅'}
                      </td>
                      <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td>{payment.payment_method}</td>
                      <td>{payment.reference_number || '-'}</td>
                      <td>
                        <div className={styles.actions}>
                          <button 
                            className={styles.actionButton} 
                            title="View Details"
                            onClick={() => handleViewDetails(payment)}
                          >
                            👁️
                          </button>
                          <button 
                            className={styles.actionButton} 
                            title="Print Receipt"
                            onClick={() => handlePrintDirect(payment)}
                          >
                            🖨️
                          </button>
                          <button 
                            className={styles.actionButton} 
                            title="Delete"
                            onClick={() => handleDelete(payment.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal 
          feeStructures={feeStructures}
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => {
            setShowRecordModal(false);
            fetchPayments();
          }}
        />
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal 
          payment={selectedPayment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

const RecordPaymentModal = ({ feeStructures, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    feeStructureId: '',
    selectedClass: '', // For multi-class fee structures
    studentId: '',
    studentName: '',
    className: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentBalance, setStudentBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const handleFeeSelect = (feeId) => {
    const fee = feeStructures.find(f => f.id === parseInt(feeId));
    console.log('Fee selected:', fee);
    if (fee) {
      setSelectedFee(fee);
      setFormData({
        ...formData,
        feeStructureId: feeId,
        amount: fee.amount,
        selectedClass: '', // Reset class selection
        studentId: '',
        studentName: '',
        className: ''
      });
      setStudents([]); // Clear students
      
      // If fee has only one class, auto-load students
      if (fee.classNames && fee.classNames.length === 1) {
        console.log('Auto-loading students for class:', fee.classNames[0]);
        fetchStudents(fee.classNames[0]);
        setFormData(prev => ({
          ...prev,
          className: fee.classNames[0]
        }));
      }
    }
  };

  const handleClassSelect = (className) => {
    console.log('Class selected:', className);
    setFormData({
      ...formData,
      selectedClass: className,
      className: className,
      studentId: '',
      studentName: ''
    });
    fetchStudents(className);
  };

  const fetchStudents = async (className) => {
    console.log('Fetching students for class:', className);
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/fee-payments/students/${className}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Students response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students loaded:', data.data.length);
        setStudents(data.data);
      } else {
        console.error('Failed to fetch students:', response.status);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    console.log('Student selected:', studentId);
    console.log('Available students:', students);
    // Convert to string for comparison since select value is always string
    const student = students.find(s => String(s.student_id) === String(studentId));
    console.log('Found student:', student);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.student_id,
        studentName: student.student_name,
        className: student.class_name || formData.className
      });
      
      // Fetch student's payment history for this fee
      if (selectedFee) {
        fetchStudentBalance(student.student_id, selectedFee.id);
      }
    }
  };

  const fetchStudentBalance = async (studentId, feeStructureId) => {
    setLoadingBalance(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/fee-payments/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter payments for this specific fee structure
        const feePayments = data.data.payments.filter(p => p.fee_structure_id === feeStructureId);
        const totalPaid = feePayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const feeAmount = parseFloat(selectedFee.amount);
        const balance = feeAmount - totalPaid;
        
        setStudentBalance({
          totalPaid,
          feeAmount,
          balance,
          paymentCount: feePayments.length
        });
      }
    } catch (error) {
      console.error('Error fetching student balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/fee-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Payment recorded successfully! Receipt: ${result.data.receipt_number}`);
        onSuccess();
      } else {
        alert(result.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const showClassSelector = selectedFee && selectedFee.classNames && selectedFee.classNames.length > 1;
  const showStudentSelector = selectedFee && (
    (selectedFee.classNames && selectedFee.classNames.length === 1) ||
    (showClassSelector && formData.selectedClass)
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Record Fee Payment</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Select Fee Structure *</label>
            <select
              required
              value={formData.feeStructureId}
              onChange={(e) => handleFeeSelect(e.target.value)}
            >
              <option value="">-- Select Fee --</option>
              {feeStructures.map(fee => (
                <option key={fee.id} value={fee.id}>
                  {fee.name} - {fee.feeType === 'CUSTOM' && fee.customFeeName ? fee.customFeeName : fee.feeType} 
                  {' '}(${parseFloat(fee.amount).toFixed(2)})
                  {fee.classNames && fee.classNames.length > 0 && ` - Classes: ${fee.classNames.join(', ')}`}
                </option>
              ))}
            </select>
          </div>

          {selectedFee && (
            <div className={styles.feeInfo} style={{
              background: '#f0f7ff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #2196F3'
            }}>
              <p><strong>Fee:</strong> {selectedFee.name}</p>
              <p><strong>Type:</strong> {selectedFee.feeType === 'CUSTOM' && selectedFee.customFeeName ? selectedFee.customFeeName : selectedFee.feeType}</p>
              <p><strong>Amount:</strong> ${parseFloat(selectedFee.amount).toFixed(2)}</p>
              <p><strong>Academic Year:</strong> {selectedFee.academicYear}</p>
              {selectedFee.term && <p><strong>Term:</strong> {selectedFee.term}</p>}
              {selectedFee.classNames && selectedFee.classNames.length > 0 && (
                <p><strong>Classes:</strong> {selectedFee.classNames.join(', ')}</p>
              )}
            </div>
          )}

          {/* Show class selector if fee has multiple classes */}
          {showClassSelector && (
            <div className={styles.formGroup}>
              <label>Select Class *</label>
              <select
                required
                value={formData.selectedClass}
                onChange={(e) => handleClassSelect(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {selectedFee.classNames.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          )}

          {/* Show student selector after class is selected */}
          {showStudentSelector && (
            <div className={styles.formGroup}>
              <label>Select Student *</label>
              {loadingStudents ? (
                <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                  Loading students...
                </div>
              ) : students.length === 0 ? (
                <div style={{ padding: '10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                  No students found in this class
                </div>
              ) : (
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">-- Select Student --</option>
                  {students.map(student => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.student_name} ({student.student_id})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Show selected student info with balance */}
          {formData.studentId && formData.studentName && (
            <div style={{
              background: '#e8f5e9',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              border: '1px solid #4CAF50'
            }}>
              <p style={{ margin: '4px 0' }}><strong>Student:</strong> {formData.studentName}</p>
              <p style={{ margin: '4px 0' }}><strong>Student ID:</strong> {formData.studentId}</p>
              <p style={{ margin: '4px 0' }}><strong>Class:</strong> {formData.className}</p>
              
              {loadingBalance ? (
                <p style={{ margin: '8px 0', color: '#666', fontStyle: 'italic' }}>Loading payment history...</p>
              ) : studentBalance && (
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #4CAF50' 
                }}>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Fee Amount:</strong> ${studentBalance.feeAmount.toFixed(2)}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Already Paid:</strong> ${studentBalance.totalPaid.toFixed(2)}
                    {studentBalance.paymentCount > 0 && ` (${studentBalance.paymentCount} payment${studentBalance.paymentCount > 1 ? 's' : ''})`}
                  </p>
                  <p style={{ 
                    margin: '4px 0', 
                    fontSize: '1.1rem',
                    color: studentBalance.balance > 0 ? '#f44336' : '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    <strong>Balance Due:</strong> ${studentBalance.balance.toFixed(2)}
                  </p>
                  {studentBalance.balance <= 0 && (
                    <p style={{ 
                      margin: '8px 0', 
                      padding: '8px',
                      background: '#c8e6c9',
                      borderRadius: '4px',
                      color: '#2e7d32',
                      fontWeight: 'bold'
                    }}>
                      ✅ This fee is fully paid!
                    </p>
                  )}
                  {studentBalance.balance > 0 && studentBalance.balance < studentBalance.feeAmount && (
                    <p style={{ 
                      margin: '8px 0', 
                      padding: '8px',
                      background: '#fff3cd',
                      borderRadius: '4px',
                      color: '#856404'
                    }}>
                      ⚠️ Partial payment received. Remaining: ${studentBalance.balance.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Amount *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Default amount from fee structure. You can adjust if needed.
            </small>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Payment Date *</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Payment Method *</label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Card</option>
                <option value="ONLINE">Online</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Reference Number {formData.paymentMethod !== 'CASH' && '*'}</label>
            <input
              type="text"
              required={formData.paymentMethod !== 'CASH'}
              value={formData.referenceNumber}
              onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
              placeholder={formData.paymentMethod === 'CASH' ? 'Optional for cash payments' : 'Required for non-cash payments'}
            />
            {formData.paymentMethod !== 'CASH' && (
              <small style={{ color: '#f44336', display: 'block', marginTop: '5px' }}>
                * Reference number is required for {formData.paymentMethod.replace('_', ' ').toLowerCase()} payments
              </small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes (optional)"
              rows="3"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !formData.studentId} 
              className={styles.submitButton}
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentDetailsModal = ({ payment, onClose }) => {
  const feeAmount = parseFloat(payment.fee_amount || 0);
  const totalPaid = parseFloat(payment.total_paid || 0);
  const balance = feeAmount - totalPaid;
  const isPaid = balance <= 0;

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    // Get the receipt content
    const receiptContent = document.getElementById('printable-receipt');
    
    if (!receiptContent) {
      alert('Receipt content not found');
      return;
    }
    
    // Write the HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${payment.receipt_number}</title>
        <style>
          @page {
            size: 105mm 148mm;
            margin: 5mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            font-size: 10pt;
            line-height: 1.4;
          }
          
          h1 {
            font-size: 14pt;
            margin: 0 0 5px 0;
            text-align: center;
          }
          
          h2 {
            font-size: 12pt;
            margin: 10px 0 5px 0;
            text-align: center;
          }
          
          h3 {
            font-size: 10pt;
            margin: 10px 0 5px 0;
            border-bottom: 2px solid #333;
            padding-bottom: 3px;
          }
          
          p {
            margin: 3px 0;
            font-size: 9pt;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
          }
          
          td {
            padding: 3px 0;
            font-size: 9pt;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .section {
            margin-bottom: 10px;
          }
          
          .amount-box {
            background: #f5f5f5;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            margin: 10px 0;
          }
          
          .total-row {
            border-top: 2px solid #333;
            padding-top: 5px;
            margin-top: 5px;
            font-weight: bold;
          }
          
          .footer {
            border-top: 2px dashed #999;
            padding-top: 10px;
            margin-top: 15px;
            text-align: center;
            font-size: 8pt;
            color: #666;
          }
          
          .badge {
            display: inline-block;
            padding: 5px 12px;
            background: ${isPaid ? '#4CAF50' : '#FF9800'};
            color: white;
            border-radius: 15px;
            font-size: 9pt;
            font-weight: bold;
            margin: 5px 0;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SCHOOL NAME</h1>
          <p>School Address Line 1</p>
          <p>City, State, ZIP Code</p>
          <p>Phone: (123) 456-7890 | Email: info@school.com</p>
        </div>
        
        <h2>PAYMENT RECEIPT</h2>
        <p style="text-align: center; font-weight: bold; font-size: 11pt;">${payment.receipt_number}</p>
        <p style="text-align: center;"><span class="badge">${isPaid ? '✅ FULLY PAID' : '⚠️ PARTIAL PAYMENT'}</span></p>
        
        <div class="section">
          <h3>Student Information</h3>
          <table>
            <tr>
              <td style="width: 40%;">Student ID:</td>
              <td style="font-weight: bold;">${payment.student_id}</td>
            </tr>
            <tr>
              <td>Student Name:</td>
              <td style="font-weight: bold;">${payment.student_name || '-'}</td>
            </tr>
            <tr>
              <td>Class:</td>
              <td style="font-weight: bold;">${payment.class_name || '-'}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h3>Fee Information</h3>
          <table>
            <tr>
              <td style="width: 40%;">Fee Name:</td>
              <td style="font-weight: bold;">${payment.fee_name || '-'}</td>
            </tr>
            <tr>
              <td>Fee Type:</td>
              <td style="font-weight: bold;">${payment.fee_type === 'CUSTOM' && payment.custom_fee_name ? payment.custom_fee_name : payment.fee_type}</td>
            </tr>
            <tr>
              <td>Academic Year:</td>
              <td style="font-weight: bold;">${payment.academic_year || '-'}</td>
            </tr>
            ${payment.term ? `<tr><td>Term:</td><td style="font-weight: bold;">${payment.term}</td></tr>` : ''}
          </table>
        </div>
        
        <div class="section">
          <h3>Payment Details</h3>
          <table>
            <tr>
              <td style="width: 40%;">Payment Date:</td>
              <td style="font-weight: bold;">${new Date(payment.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td style="font-weight: bold; color: #4CAF50; font-size: 12pt;">$${parseFloat(payment.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Payment Method:</td>
              <td style="font-weight: bold;">${payment.payment_method.replace('_', ' ')}</td>
            </tr>
            ${payment.reference_number ? `<tr><td>Reference Number:</td><td style="font-weight: bold;">${payment.reference_number}</td></tr>` : ''}
          </table>
        </div>
        
        <div class="amount-box">
          <h3 style="margin-top: 0;">Amount Breakdown</h3>
          <table>
            <tr>
              <td>Total Fee Amount:</td>
              <td style="text-align: right; font-weight: bold;">$${feeAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>This Payment:</td>
              <td style="text-align: right; font-weight: bold; color: #2196F3;">$${parseFloat(payment.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total Paid to Date:</td>
              <td style="text-align: right; font-weight: bold; color: #4CAF50;">$${totalPaid.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td style="font-size: 11pt;">Balance Due:</td>
              <td style="text-align: right; font-size: 13pt; color: ${isPaid ? '#4CAF50' : '#f44336'};">$${balance.toFixed(2)} ${isPaid ? '✅' : ''}</td>
            </tr>
          </table>
        </div>
        
        ${payment.notes ? `
        <div class="section">
          <h3>Notes</h3>
          <p style="background: #f8f9fa; padding: 8px; border-radius: 5px; font-style: italic;">${payment.notes}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p style="font-weight: bold;">Thank you for your payment!</p>
          <p>This is an official receipt. Please keep it for your records.</p>
          <p style="font-size: 7pt; margin-top: 8px;">Printed on: ${new Date().toLocaleString()}</p>
          <p style="font-size: 7pt;">Receipt ID: ${payment.id} | Created: ${new Date(payment.created_at).toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className={`${styles.modalHeader} no-print`}>
          <h2>Payment Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.form}>
          {/* Print Button - Hidden when printing */}
          <div className="no-print" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button 
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🖨️ Print Receipt (A6)
            </button>
          </div>

          {/* Receipt Content - This will be printed */}
          <div className="receipt-content" id="printable-receipt" style={{ padding: '20px', background: 'white' }}>
            {/* School Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid #333'
            }}>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                margin: '0 0 8px 0',
                color: '#333'
              }}>
                SCHOOL NAME
              </h1>
              <p style={{ 
                fontSize: '0.85rem', 
                margin: '4px 0',
                color: '#666'
              }}>
                School Address Line 1
              </p>
              <p style={{ 
                fontSize: '0.85rem', 
                margin: '4px 0',
                color: '#666'
              }}>
                City, State, ZIP Code
              </p>
              <p style={{ 
                fontSize: '0.85rem', 
                margin: '4px 0',
                color: '#666'
              }}>
                Phone: (123) 456-7890 | Email: info@school.com
              </p>
            </div>

            {/* Receipt Title */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                color: '#333',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                PAYMENT RECEIPT
              </h2>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#667eea',
                letterSpacing: '0.5px'
              }}>
                {payment.receipt_number}
              </div>
            </div>

            {/* Payment Status Badge */}
            <div style={{ 
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ 
                display: 'inline-block',
                padding: '6px 16px', 
                background: isPaid ? '#4CAF50' : '#FF9800',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {isPaid ? '✅ FULLY PAID' : '⚠️ PARTIAL PAYMENT'}
              </span>
            </div>

            {/* Student Information */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '6px',
                textTransform: 'uppercase'
              }}>
                Student Information
              </h3>
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666', width: '40%' }}>Student ID:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>{payment.student_id}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666' }}>Student Name:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>{payment.student_name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666' }}>Class:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>{payment.class_name || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fee Information */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333',
                borderBottom: '2px solid #2196F3',
                paddingBottom: '6px',
                textTransform: 'uppercase'
              }}>
                Fee Information
              </h3>
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666', width: '40%' }}>Fee Name:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>{payment.fee_name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666' }}>Fee Type:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#2196F3' }}>
                      {payment.fee_type === 'CUSTOM' && payment.custom_fee_name 
                        ? payment.custom_fee_name 
                        : payment.fee_type}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666' }}>Academic Year:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>{payment.academic_year || '-'}</td>
                  </tr>
                  {payment.term && (
                    <tr>
                      <td style={{ padding: '4px 0', color: '#666' }}>Term:</td>
                      <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>{payment.term}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment Information */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333',
                borderBottom: '2px solid #FF9800',
                paddingBottom: '6px',
                textTransform: 'uppercase'
              }}>
                Payment Details
              </h3>
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666', width: '40%' }}>Payment Date:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>
                      {new Date(payment.payment_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 0', color: '#666' }}>Payment Method:</td>
                    <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>
                      {payment.payment_method.replace('_', ' ')}
                    </td>
                  </tr>
                  {payment.reference_number && (
                    <tr>
                      <td style={{ padding: '4px 0', color: '#666' }}>Reference Number:</td>
                      <td style={{ padding: '4px 0', fontWeight: '600', color: '#333' }}>
                        {payment.reference_number}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Amount Breakdown */}
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: '#333',
                textTransform: 'uppercase'
              }}>
                Amount Breakdown
              </h3>
              <table style={{ width: '100%', fontSize: '0.95rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#666' }}>Total Fee Amount:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                      ${feeAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#666' }}>This Payment:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600', color: '#2196F3' }}>
                      ${parseFloat(payment.amount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#666' }}>Total Paid to Date:</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600', color: '#4CAF50' }}>
                      ${totalPaid.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: '2px solid #333' }}>
                    <td style={{ padding: '10px 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                      Balance Due:
                    </td>
                    <td style={{ 
                      padding: '10px 0 0 0', 
                      textAlign: 'right', 
                      fontSize: '1.3rem', 
                      fontWeight: 'bold', 
                      color: isPaid ? '#4CAF50' : '#f44336'
                    }}>
                      ${balance.toFixed(2)}
                      {isPaid && ' ✅'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {payment.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#333'
                }}>
                  Notes:
                </h3>
                <div style={{
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#666',
                  fontStyle: 'italic',
                  border: '1px solid #e0e0e0'
                }}>
                  {payment.notes}
                </div>
              </div>
            )}

            {/* Footer - Only visible when printing */}
            <div className="print-only" style={{ 
              marginTop: '30px', 
              paddingTop: '15px', 
              borderTop: '2px dashed #999',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              <p style={{ margin: '6px 0', fontWeight: '600' }}>Thank you for your payment!</p>
              <p style={{ margin: '6px 0' }}>This is an official receipt. Please keep it for your records.</p>
              <p style={{ margin: '6px 0', fontSize: '0.75rem', color: '#999' }}>
                Printed on: {new Date().toLocaleString()}
              </p>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.75rem', color: '#999' }}>
                Receipt ID: {payment.id} | Created: {new Date(payment.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons - Hidden when printing */}
          <div className={`${styles.modalActions} no-print`} style={{ marginTop: '24px' }}>
            <button 
              onClick={onClose} 
              className={styles.submitButton}
              style={{ width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeePaymentManagement;
