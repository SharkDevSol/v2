import React, { useState } from 'react';
import styles from '../Finance/FinanceReports.module.css';

const InventoryReports = () => {
  const [selectedReport, setSelectedReport] = useState('stock-summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: 'stock-summary',
      name: 'Stock Summary',
      description: 'Current stock levels across all items',
      icon: '📊'
    },
    {
      id: 'low-stock',
      name: 'Low Stock Report',
      description: 'Items below minimum quantity threshold',
      icon: '⚠️'
    },
    {
      id: 'stock-valuation',
      name: 'Stock Valuation',
      description: 'Total inventory value by category',
      icon: '💰'
    },
    {
      id: 'movement-history',
      name: 'Movement History',
      description: 'Stock movements within date range',
      icon: '📦'
    },
    {
      id: 'purchase-analysis',
      name: 'Purchase Analysis',
      description: 'Purchase orders and spending analysis',
      icon: '🛒'
    },
    {
      id: 'supplier-performance',
      name: 'Supplier Performance',
      description: 'Supplier delivery and quality metrics',
      icon: '🏢'
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/inventory/reports/${selectedReport}?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      });

      const response = await fetch(`/api/inventory/reports/${selectedReport}/export?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('An error occurred');
    }
  };

  const renderReportContent = () => {
    if (!reportData) {
      return (
        <div className={styles.emptyState}>
          <p>Select a report and click "Generate Report" to view data</p>
        </div>
      );
    }

    switch (selectedReport) {
      case 'stock-summary':
        return <StockSummaryReport data={reportData} />;
      case 'low-stock':
        return <LowStockReport data={reportData} />;
      case 'stock-valuation':
        return <StockValuationReport data={reportData} />;
      case 'movement-history':
        return <MovementHistoryReport data={reportData} />;
      case 'purchase-analysis':
        return <PurchaseAnalysisReport data={reportData} />;
      case 'supplier-performance':
        return <SupplierPerformanceReport data={reportData} />;
      default:
        return <div>Report not available</div>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inventory Reports</h1>
        <p>View and analyze inventory data</p>
      </div>

      <div className={styles.reportSelector}>
        <div className={styles.reportGrid}>
          {reports.map(report => (
            <div
              key={report.id}
              className={`${styles.reportCard} ${selectedReport === report.id ? styles.selected : ''}`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className={styles.reportIcon}>{report.icon}</div>
              <h3>{report.name}</h3>
              <p>{report.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.dateRange}>
          <div className={styles.dateInput}>
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className={styles.dateInput}>
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.generateButton} onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : '📊 Generate Report'}
          </button>
          {reportData && (
            <>
              <button className={styles.exportButton} onClick={() => exportReport('pdf')}>
                📄 Export PDF
              </button>
              <button className={styles.exportButton} onClick={() => exportReport('xlsx')}>
                📊 Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.reportContent}>
        {renderReportContent()}
      </div>
    </div>
  );
};

const StockSummaryReport = ({ data }) => (
  <div className={styles.reportTable}>
    <h2>Stock Summary Report</h2>
    <table>
      <thead>
        <tr>
          <th>Item Code</th>
          <th>Item Name</th>
          <th>Category</th>
          <th>Current Stock</th>
          <th>Min Quantity</th>
          <th>Unit Price</th>
          <th>Total Value</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data?.items?.map((item, index) => (
          <tr key={index}>
            <td>{item.code}</td>
            <td>{item.name}</td>
            <td>{item.category}</td>
            <td>{parseFloat(item.quantity).toFixed(2)}</td>
            <td>{parseFloat(item.minQuantity).toFixed(2)}</td>
            <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
            <td>${(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)}</td>
            <td>
              <span style={{ 
                color: parseFloat(item.quantity) <= parseFloat(item.minQuantity) ? '#F44336' : '#4CAF50',
                fontWeight: 600
              }}>
                {parseFloat(item.quantity) <= parseFloat(item.minQuantity) ? 'Low Stock' : 'OK'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const LowStockReport = ({ data }) => (
  <div className={styles.reportTable}>
    <h2>Low Stock Report</h2>
    <div style={{ marginBottom: '16px', padding: '12px', background: '#fff3cd', borderRadius: '8px' }}>
      <strong>⚠️ {data?.items?.length || 0} items below minimum quantity</strong>
    </div>
    <table>
      <thead>
        <tr>
          <th>Item Code</th>
          <th>Item Name</th>
          <th>Current Stock</th>
          <th>Min Quantity</th>
          <th>Shortage</th>
          <th>Recommended Order</th>
        </tr>
      </thead>
      <tbody>
        {data?.items?.map((item, index) => (
          <tr key={index}>
            <td>{item.code}</td>
            <td>{item.name}</td>
            <td style={{ color: '#F44336', fontWeight: 600 }}>{parseFloat(item.quantity).toFixed(2)}</td>
            <td>{parseFloat(item.minQuantity).toFixed(2)}</td>
            <td>{(parseFloat(item.minQuantity) - parseFloat(item.quantity)).toFixed(2)}</td>
            <td>{(parseFloat(item.minQuantity) * 2).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StockValuationReport = ({ data }) => (
  <div className={styles.reportTable}>
    <h2>Stock Valuation Report</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>Total Items</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#2196F3' }}>{data?.totalItems || 0}</div>
      </div>
      <div style={{ padding: '16px', background: '#e8f5e9', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>Total Value</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#4CAF50' }}>${parseFloat(data?.totalValue || 0).toFixed(2)}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Item Count</th>
          <th>Total Quantity</th>
          <th>Total Value</th>
          <th>% of Total</th>
        </tr>
      </thead>
      <tbody>
        {data?.categories?.map((cat, index) => (
          <tr key={index}>
            <td>{cat.category}</td>
            <td>{cat.itemCount}</td>
            <td>{parseFloat(cat.totalQuantity).toFixed(2)}</td>
            <td>${parseFloat(cat.totalValue).toFixed(2)}</td>
            <td>{cat.percentage}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MovementHistoryReport = ({ data }) => (
  <div className={styles.reportTable}>
    <h2>Movement History Report</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Item</th>
          <th>Quantity</th>
          <th>From</th>
          <th>To</th>
          <th>Reference</th>
        </tr>
      </thead>
      <tbody>
        {data?.movements?.map((movement, index) => (
          <tr key={index}>
            <td>{new Date(movement.movementDate).toLocaleDateString()}</td>
            <td>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                background: movement.type === 'IN' ? '#e8f5e9' : movement.type === 'OUT' ? '#ffebee' : '#e3f2fd',
                color: movement.type === 'IN' ? '#4CAF50' : movement.type === 'OUT' ? '#F44336' : '#2196F3'
              }}>
                {movement.type}
              </span>
            </td>
            <td>{movement.itemName}</td>
            <td>{parseFloat(movement.quantity).toFixed(2)}</td>
            <td>{movement.fromLocation || '-'}</td>
            <td>{movement.toLocation || '-'}</td>
            <td>{movement.referenceNumber || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PurchaseAnalysisReport = ({ data }) => (
  <div className={styles.reportTable}>
    <h2>Purchase Analysis Report</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      <div style={{ padding: '16px', background: '#f3e5f5', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>Total Orders</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#9C27B0' }}>{data?.totalOrders || 0}</div>
      </div>
      <div style={{ padding: '16px', background: '#e8f5e9', borderRadius: '8px' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>Total Spending</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#4CAF50' }}>${parseFloat(data?.totalSpending || 0).toFixed(2)}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>PO Number</th>
          <th>Date</th>
          <th>Supplier</th>
          <th>Items</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data?.orders?.map((order, index) => (
          <tr key={index}>
            <td>{order.poNumber}</td>
            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
            <td>{order.supplierName}</td>
            <td>{order.itemCount}</td>
            <td>${parseFloat(order.totalAmount).toFixed(2)}</td>
            <td>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SupplierPerformanceReport = ({ data }) => (
  <div className={styles.reportTable}>
    <h2>Supplier Performance Report</h2>
    <table>
      <thead>
        <tr>
          <th>Supplier</th>
          <th>Total Orders</th>
          <th>Total Amount</th>
          <th>On-Time Delivery</th>
          <th>Average Lead Time</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        {data?.suppliers?.map((supplier, index) => (
          <tr key={index}>
            <td>{supplier.name}</td>
            <td>{supplier.orderCount}</td>
            <td>${parseFloat(supplier.totalAmount).toFixed(2)}</td>
            <td>{supplier.onTimePercentage}%</td>
            <td>{supplier.avgLeadTime} days</td>
            <td>
              <span style={{ color: '#FF9800', fontSize: '16px' }}>
                {'⭐'.repeat(Math.round(supplier.rating))}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default InventoryReports;
