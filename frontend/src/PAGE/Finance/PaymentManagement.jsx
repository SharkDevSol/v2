import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import styles from './PaymentManagement.module.css';

import Button from '../../COMPONENTS/Button/Button';
import Input from '../../COMPONENTS/Input/Input';
import Select from '../../COMPONENTS/Select/Select';
import Card from '../../COMPONENTS/Card/Card';
import Table from '../../components/Table/Table';
import Badge from '../../COMPONENTS/Badge/Badge';

const PaymentManagement = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchPendingInvoices();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/finance/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvoices = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/invoices?status=ISSUED,PARTIALLY_PAID', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#FF9800',
      'COMPLETED': '#4CAF50',
      'FAILED': '#F44336',
      'REFUNDED': '#9E9E9E'
    };
    return colors[status] || '#9E9E9E';
  };

  const filteredPayments = payments.filter(payment =>
    payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusFilterOptions = useMemo(
    () =>
      ['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((status) => ({
        value: status,
        label: status === 'ALL' ? t('common.all', 'All') : status
      })),
    [t]
  );

  const getFeeTypes = (payment) =>
    payment.allocations
      ?.map((alloc) => {
        const invoice = alloc.invoice;
        if (invoice?.metadata?.feeType) {
          return invoice.metadata.feeType === 'CUSTOM' && invoice.metadata.customFeeName
            ? invoice.metadata.customFeeName
            : invoice.metadata.feeType;
        }
        return 'N/A';
      })
      .join(', ') || 'N/A';

  const tableColumns = useMemo(
    () => [
      { key: 'receiptNumber', header: t('finance.payments.receipt', 'Receipt #'), accessor: 'receiptNumber' },
      { key: 'studentId', header: t('finance.payments.student', 'Student ID'), accessor: 'studentId' },
      {
        key: 'paymentDate',
        header: t('finance.payments.date', 'Date'),
        render: (row) => new Date(row.paymentDate).toLocaleDateString()
      },
      {
        key: 'amount',
        header: t('finance.payments.amount', 'Amount'),
        render: (row) => `$${parseFloat(row.amount).toFixed(2)}`
      },
      {
        key: 'feeType',
        header: t('finance.payments.feeType', 'Fee type'),
        render: (row) => getFeeTypes(row)
      },
      { key: 'paymentMethod', header: t('finance.payments.method', 'Method'), accessor: 'paymentMethod' },
      {
        key: 'reference',
        header: t('finance.payments.reference', 'Reference'),
        render: (row) => row.referenceNumber || '—'
      },
      {
        key: 'status',
        header: t('finance.payments.status', 'Status'),
        render: (row) => (
          <Badge variant={row.status === 'COMPLETED' ? 'success' : row.status === 'FAILED' ? 'error' : 'warning'}>
            {row.status}
          </Badge>
        )
      }
    ],
    [t]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{t('finance.payments.title', 'Payments')}</h1>
          <p>{t('finance.payments.subtitle', 'Record and track student payments')}</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowRecordModal(true)}>
          {t('finance.payments.record', 'Record payment')}
        </Button>
      </div>

      <Card className={styles.filtersCard}>
        <div className={styles.filters}>
          <Select
            label={t('finance.payments.status', 'Status')}
            value={filter}
            onChange={setFilter}
            options={statusFilterOptions}
          />
          <Input
            label={t('common.search', 'Search')}
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('finance.payments.searchPlaceholder', 'Receipt or student...')}
            prefixIcon={<Search size={16} />}
          />
        </div>
      </Card>

      {loading ? (
        <div className={styles.loading}>{t('common.loading', 'Loading...')}</div>
      ) : (
        <Table
          columns={tableColumns}
          data={filteredPayments}
          paginated
          pageSize={15}
          emptyMessage={t('finance.payments.empty', 'No payments found')}
        />
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal 
          invoices={invoices}
          onClose={() => setShowRecordModal(false)}
          onSuccess={() => {
            setShowRecordModal(false);
            fetchPayments();
            fetchPendingInvoices();
          }}
        />
      )}
    </div>
  );
};

const RecordPaymentModal = ({ invoices, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    invoiceId: '',
    amount: '',
    paymentMethod: 'CASH',
    referenceNumber: '',
    campusId: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleInvoiceSelect = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData({
        ...formData,
        invoiceId,
        studentId: invoice.studentId,
        campusId: invoice.campusId,
        amount: (parseFloat(invoice.netAmount) - parseFloat(invoice.paidAmount)).toFixed(2)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Payment recorded successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Record Payment</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Select Invoice *</label>
            <select
              required
              value={formData.invoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - Student: {invoice.studentId} - Balance: $
                  {(parseFloat(invoice.netAmount) - parseFloat(invoice.paidAmount)).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <div className={styles.invoiceInfo}>
              <p><strong>Invoice:</strong> {selectedInvoice.invoiceNumber}</p>
              <p><strong>Total:</strong> ${parseFloat(selectedInvoice.netAmount).toFixed(2)}</p>
              <p><strong>Paid:</strong> ${parseFloat(selectedInvoice.paidAmount).toFixed(2)}</p>
              <p><strong>Balance:</strong> ${(parseFloat(selectedInvoice.netAmount) - parseFloat(selectedInvoice.paidAmount)).toFixed(2)}</p>
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

          <div className={styles.formGroup}>
            <label>Reference Number</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
              placeholder="Transaction reference (optional)"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentManagement;
