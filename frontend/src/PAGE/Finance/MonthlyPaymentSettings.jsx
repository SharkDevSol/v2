import { useState, useEffect } from 'react';
import styles from './MonthlyPaymentSettings.module.css';
import api from '../../utils/api';
import { getCurrentEthiopianMonth } from '../../utils/ethiopianCalendar';

const MonthlyPaymentSettings = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [loading, setLoading] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [lateFeeRules, setLateFeeRules] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddLateFee, setShowAddLateFee] = useState(false);
  const [currentEthiopianDate, setCurrentEthiopianDate] = useState(() => {
    return getCurrentEthiopianMonth();
  });

  const [classForm, setClassForm] = useState({
    className: '',
    monthlyFee: '',
    registrationFee: '', // Added registration fee
    description: '',
    selectedMonths: [] // Array of month numbers (1-12)
  });

  // Ethiopian calendar months
  const months = [
    { value: 1, name: 'Meskerem (መስከረም)', days: 30 },
    { value: 2, name: 'Tikimt (ጥቅምት)', days: 30 },
    { value: 3, name: 'Hidar (ኅዳር)', days: 30 },
    { value: 4, name: 'Tahsas (ታኅሣሥ)', days: 30 },
    { value: 5, name: 'Tir (ጥር)', days: 30 },
    { value: 6, name: 'Yekatit (የካቲት)', days: 30 },
    { value: 7, name: 'Megabit (መጋቢት)', days: 30 },
    { value: 8, name: 'Miazia (ሚያዝያ)', days: 30 },
    { value: 9, name: 'Ginbot (ግንቦት)', days: 30 },
    { value: 10, name: 'Sene (ሰኔ)', days: 30 },
    { value: 11, name: 'Hamle (ሐምሌ)', days: 30 },
    { value: 12, name: 'Nehase (ነሐሴ)', days: 30 },
    { value: 13, name: 'Pagume (ጳጉሜን)', days: 5 }
  ];

  const [lateFeeForm, setLateFeeForm] = useState({
    name: '',
    gracePeriodDays: 0,
    penaltyType: 'FIXED_AMOUNT',
    penaltyValue: '',
    applicableFeeCategories: ['TUITION']
  });

  const [generatingInvoices, setGeneratingInvoices] = useState(false);

  // General Settings state
  const [generalSettings, setGeneralSettings] = useState({
    paymentMethods: {
      cash: true,
      bankTransfer: true,
      mobileMoney: true,
      onlinePayment: true
    },
    invoiceSettings: {
      defaultDueDays: 30,
      invoicePrefix: 'INV-'
    },
    notifications: {
      paymentReminders: true,
      paymentConfirmations: true,
      overdueNotifications: false
    }
  });

  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    // Fetch available classes and default account on component mount
    fetchAvailableClasses();
    fetchDefaultAccount();
    
    // Update Ethiopian date every minute
    const interval = setInterval(() => {
      setCurrentEthiopianDate(getCurrentEthiopianMonth());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchFeeStructures();
    } else if (activeTab === 'latefees') {
      fetchLateFeeRules();
    }
  }, [activeTab]);

  const fetchAvailableClasses = async () => {
    try {
      const response = await api.get('/finance/classes');
      setAvailableClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching available classes:', error);
      // Don't show error to user, just log it
    }
  };

  const fetchDefaultAccount = async () => {
    try {
      // Fetch accounts and find an income account for tuition
      const response = await api.get('/finance/accounts/tree');
      const accounts = response.data.data || [];
      
      // Find an income account (preferably for tuition)
      const findIncomeAccount = (accts) => {
        for (const acc of accts) {
          if (acc.type === 'INCOME' && acc.isActive && acc.isLeaf) {
            return acc;
          }
          if (acc.children && acc.children.length > 0) {
            const found = findIncomeAccount(acc.children);
            if (found) return found;
          }
        }
        return null;
      };

      const incomeAccount = findIncomeAccount(accounts);
      if (incomeAccount) {
        setDefaultAccount(incomeAccount);
      } else {
        console.warn('No income account found. Please create one first.');
      }
    } catch (error) {
      console.error('Error fetching default account:', error);
    }
  };

  const fetchFeeStructures = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/fee-structures');
      setFeeStructures(response.data.data || []);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      // If tables don't exist yet, show empty state instead of error
      if (error.response?.status === 500) {
        setFeeStructures([]);
        console.log('Fee structures table may not exist yet. Run setup script first.');
      } else {
        alert('Failed to fetch fee structures');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLateFeeRules = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/late-fee-rules');
      setLateFeeRules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching late fee rules:', error);
      // If tables don't exist yet, show empty state instead of error
      if (error.response?.status === 500) {
        setLateFeeRules([]);
        console.log('Late fee rules table may not exist yet. Run setup script first.');
      } else {
        alert('Failed to fetch late fee rules');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    
    // Validate we have a default account
    if (!defaultAccount) {
      alert('No income account found. Please run: node backend/scripts/setup-default-accounts.js');
      return;
    }

    // Validate at least one month is selected
    if (classForm.selectedMonths.length === 0) {
      alert('Please select at least one month');
      return;
    }

    try {
      // Generate academic year UUID based on current year
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const academicYearName = `${currentYear}-${nextYear}`;
      const academicYearId = '00000000-0000-0000-0000-' + currentYear.toString().padStart(12, '0');

      // Store selected months and registration fee in the description field as JSON
      const monthsData = {
        months: classForm.selectedMonths,
        description: classForm.description || 'Monthly tuition fee',
        registrationFee: parseFloat(classForm.registrationFee) || 0
      };

      await api.post('/finance/fee-structures', {
        name: `${classForm.className} Monthly Fee ${academicYearName}`,
        academicYearId: academicYearId,
        gradeLevel: classForm.className,
        description: JSON.stringify(monthsData), // Store months data here
        items: [{
          feeCategory: 'TUITION',
          amount: parseFloat(classForm.monthlyFee),
          accountId: defaultAccount.id,
          paymentType: 'RECURRING',
          description: classForm.description || 'Monthly tuition fee'
        }]
      });

      const firstMonthTotal = parseFloat(classForm.monthlyFee) + parseFloat(classForm.registrationFee);
      alert(`Class fee structure added successfully!\n\nPayments will be generated for ${classForm.selectedMonths.length} months.\n\nFirst month: ${firstMonthTotal} Birr (${classForm.monthlyFee} + ${classForm.registrationFee} registration)\nOther months: ${classForm.monthlyFee} Birr`);
      setShowAddClass(false);
      setClassForm({ className: '', monthlyFee: '', registrationFee: '', description: '', selectedMonths: [] });
      fetchFeeStructures();
    } catch (error) {
      console.error('Error adding class:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add class fee structure';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        const detailMsg = errorDetails.map(d => d.message).join('\n');
        alert(`${errorMsg}\n\n${detailMsg}`);
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleAddLateFee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance/late-fee-rules', {
        name: lateFeeForm.name,
        type: lateFeeForm.penaltyType,
        value: parseFloat(lateFeeForm.penaltyValue),
        gracePeriodDays: parseInt(lateFeeForm.gracePeriodDays),
        applicableFeeCategories: lateFeeForm.applicableFeeCategories,
        isActive: true
      });

      alert('Late fee rule added successfully!');
      setShowAddLateFee(false);
      setLateFeeForm({
        name: '',
        gracePeriodDays: 0,
        penaltyType: 'FIXED_AMOUNT',
        penaltyValue: '',
        applicableFeeCategories: ['TUITION']
      });
      fetchLateFeeRules();
    } catch (error) {
      console.error('Error adding late fee rule:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add late fee rule';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        const detailMsg = errorDetails.map(d => d.message).join('\n');
        alert(`${errorMsg}\n\n${detailMsg}`);
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus, type) => {
    try {
      if (type === 'feeStructure') {
        await api.put(`/finance/fee-structures/${id}`, {
          isActive: !currentStatus
        });
        fetchFeeStructures();
      } else if (type === 'lateFee') {
        await api.put(`/finance/late-fee-rules/${id}`, {
          isActive: !currentStatus
        });
        fetchLateFeeRules();
      }
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDeleteFeeStructure = async (id, className) => {
    if (!confirm(`Are you sure you want to delete the fee structure for ${className}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/finance/fee-structures/${id}`);
      alert('Fee structure deleted successfully!');
      fetchFeeStructures();
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete fee structure';
      alert(errorMsg);
    }
  };

  const handleDeleteLateFeeRule = async (id, ruleName) => {
    if (!confirm(`Are you sure you want to delete the late fee rule "${ruleName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/finance/late-fee-rules/${id}`);
      alert('Late fee rule deleted successfully!');
      fetchLateFeeRules();
    } catch (error) {
      console.error('Error deleting late fee rule:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete late fee rule';
      alert(errorMsg);
    }
  };

  const handleApplyLateFees = async () => {
    if (!confirm('Apply late fees to all overdue invoices?\n\nThis will add late fees to students who are past the grace period.')) {
      return;
    }

    try {
      const response = await api.post('/finance/apply-late-fees');
      const { appliedCount, results } = response.data;
      
      if (appliedCount === 0) {
        alert('No late fees applied. All invoices are either paid or within grace period.');
      } else {
        alert(`✅ Late fees applied successfully!\n\n${appliedCount} invoices received late fees.\n\nRefresh the Monthly Payments page to see updated balances.`);
      }
    } catch (error) {
      console.error('Error applying late fees:', error);
      alert('Failed to apply late fees: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveGeneralSettings = async () => {
    setSavingSettings(true);
    try {
      // Store settings in localStorage for now
      // In production, this would be saved to the backend
      localStorage.setItem('financeGeneralSettings', JSON.stringify(generalSettings));
      alert('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Load general settings on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('financeGeneralSettings');
      if (savedSettings) {
        setGeneralSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleGenerateInvoices = async (feeStructure) => {
    setGeneratingInvoices(true);
    try {
      // Validate fee structure has required data
      if (!feeStructure || !feeStructure.id) {
        alert('Invalid fee structure. Please refresh the page and try again.');
        setGeneratingInvoices(false);
        return;
      }

      // Parse months data to show in confirmation
      let selectedMonths = [];
      try {
        const monthsData = JSON.parse(feeStructure.description || '{}');
        selectedMonths = monthsData.months || [];
      } catch (error) {
        console.error('Error parsing months data:', error);
      }

      const ethiopianMonthNames = [
        'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
        'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
      ];

      const monthsList = selectedMonths.map(m => ethiopianMonthNames[m - 1]).join(', ');

      if (!confirm(`Generate invoices for ALL ${selectedMonths.length} months for ${feeStructure.gradeLevel}?\n\nMonths: ${monthsList}\n\nThis will create ${selectedMonths.length} invoices for each student.\n\nBalance will accumulate automatically:\n- Month 1: 1,300 Birr\n- Month 2: 2,600 Birr (if Month 1 unpaid)\n- Month 3: 4,000 Birr (if Months 1-2 unpaid + late fees)\n\nContinue?`)) {
        setGeneratingInvoices(false);
        return;
      }

      // Generate ALL invoices at once
      const response = await api.post('/finance/progressive-invoices/generate-all', {
        feeStructureId: feeStructure.id
      });

      const result = response.data.data;

      let message = `✅ All invoices generated successfully!\n\n`;
      message += `Total Months: ${result.totalMonths}\n`;
      message += `New Students: ${result.summary.newStudents}\n`;
      if (result.summary.existingStudents > 0) {
        message += `Students with Existing Invoices: ${result.summary.existingStudents}\n`;
      }
      message += `Total Invoices Created: ${result.totalInvoices}\n`;
      message += `Monthly Fee: ${result.summary.monthlyFee} Birr\n`;
      if (result.summary.registrationFee > 0) {
        message += `Registration Fee: ${result.summary.registrationFee} Birr\n`;
        message += `First Month Total: ${result.summary.firstMonthTotal} Birr\n`;
      }
      message += `Total per Student: ${result.summary.totalPerStudent} Birr\n\n`;
      message += `📊 Monthly Breakdown:\n`;
      
      result.monthlyResults.slice(0, 5).forEach(month => {
        message += `- ${month.monthName}: ${month.successCount} invoices\n`;
      });
      
      if (result.monthlyResults.length > 5) {
        message += `... and ${result.monthlyResults.length - 5} more months\n`;
      }
      
      message += `\n💡 Balance Accumulation:\n`;
      message += `Unpaid amounts will automatically accumulate each month with late fees applied to overdue invoices.`;

      alert(message);
      
      // Refresh fee structures to update UI
      fetchFeeStructures();
      
    } catch (error) {
      console.error('Error generating invoices:', error);
      const errorMsg = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data?.details;
      
      // More detailed error message
      let fullErrorMsg = `Failed to generate invoices:\n\n${errorMsg}`;
      
      if (errorDetails) {
        fullErrorMsg += `\n\nDetails: ${errorDetails}`;
      }
      
      // Add helpful hints based on error type
      if (errorMsg.includes('No months configured')) {
        fullErrorMsg += '\n\n💡 Hint: This fee structure has no months selected. Please delete it and create a new one with months selected.';
      } else if (errorMsg.includes('No students found')) {
        fullErrorMsg += '\n\n💡 Hint: There are no students in this class. Please add students first.';
      } else if (errorMsg.includes('already generated')) {
        // Ask if user wants to regenerate
        const shouldRegenerate = confirm(fullErrorMsg + '\n\n⚠️ Do you want to DELETE existing invoices and regenerate them?\n\nWARNING: This will delete all existing invoices and payments for this fee structure!');
        
        if (shouldRegenerate) {
          // Retry with regenerate flag
          try {
            const response = await api.post('/finance/progressive-invoices/generate-all', {
              feeStructureId: feeStructure.id,
              regenerate: true
            });

            const result = response.data.data;

            let message = `✅ Invoices regenerated successfully!\n\n`;
            message += `⚠️ All previous invoices and payments were deleted\n\n`;
            message += `Total Months: ${result.totalMonths}\n`;
            message += `Total Students: ${result.summary.newStudents}\n`;
            message += `Total Invoices Created: ${result.totalInvoices}\n`;
            message += `Monthly Fee: ${result.summary.monthlyFee} Birr\n`;
            if (result.summary.registrationFee > 0) {
              message += `Registration Fee: ${result.summary.registrationFee} Birr\n`;
              message += `First Month Total: ${result.summary.firstMonthTotal} Birr\n`;
            }
            message += `Total per Student: ${result.summary.totalPerStudent} Birr\n\n`;
            message += `📊 Monthly Breakdown:\n`;
            
            result.monthlyResults.slice(0, 5).forEach(month => {
              message += `- ${month.monthName}: ${month.successCount} invoices\n`;
            });
            
            if (result.monthlyResults.length > 5) {
              message += `... and ${result.monthlyResults.length - 5} more months\n`;
            }

            alert(message);
            fetchFeeStructures();
          } catch (regenerateError) {
            console.error('Error regenerating invoices:', regenerateError);
            alert(`Failed to regenerate invoices: ${regenerateError.response?.data?.message || regenerateError.message}`);
          }
        }
        return; // Exit early, don't show the error alert again
      }
      
      alert(fullErrorMsg);
    } finally {
      setGeneratingInvoices(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Monthly Payment Settings</h1>
          <p>Configure monthly fees, late fees, and payment rules</p>
          <div style={{ 
            marginTop: '10px', 
            padding: '8px 15px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            borderRadius: '8px',
            display: 'inline-block',
            fontSize: '0.9em',
            fontWeight: '500'
          }}>
            📅 Current Ethiopian Date: {currentEthiopianDate.day} {currentEthiopianDate.monthName} {currentEthiopianDate.year}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'classes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Class Fees
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'latefees' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('latefees')}
        >
          Late Fees
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General Settings
        </button>
      </div>

      {loading && <div className={styles.loading}>Loading...</div>}

      {/* Class Fees Tab */}
      {activeTab === 'classes' && !loading && (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Class Monthly Fees</h2>
            <button 
              className={styles.addButton}
              onClick={() => setShowAddClass(true)}
            >
              + Add Class Fee
            </button>
          </div>

          <div className={styles.cardGrid}>
            {feeStructures.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No Class Fees Configured</h3>
                <p>Click "+ Add Class Fee" to add your first class fee structure.</p>
                <p className={styles.hint}>💡 Tip: Run the setup script first if you haven't already:</p>
                <code>cd backend && node scripts/setup-monthly-payments.js</code>
              </div>
            ) : (
              feeStructures.map((structure) => {
                // Parse months data
                let selectedMonths = [];
                let monthsDescription = '';
                try {
                  const monthsData = JSON.parse(structure.description || '{}');
                  selectedMonths = monthsData.months || [];
                  monthsDescription = monthsData.description || '';
                } catch (error) {
                  // If parsing fails, it's an old structure without months data
                }

                const ethiopianMonthNames = [
                  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
                  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
                ];
                const monthsText = selectedMonths.length > 0 
                  ? selectedMonths.map(m => ethiopianMonthNames[m - 1]).join(', ')
                  : 'All months';

                return (
                  <div key={structure.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3>{structure.gradeLevel || structure.name}</h3>
                      <div className={styles.cardActions}>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={structure.isActive}
                            onChange={() => handleToggleActive(structure.id, structure.isActive, 'feeStructure')}
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteFeeStructure(structure.id, structure.gradeLevel || structure.name)}
                          title="Delete fee structure"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.feeAmount}>
                        ${structure.items?.[0]?.amount || 0}/month
                      </div>
                      <div className={styles.cardDetails}>
                        <p><strong>Academic Year:</strong> {structure.academicYearId}</p>
                        <p><strong>Status:</strong> {structure.isActive ? '✓ Active' : '✗ Inactive'}</p>
                        {selectedMonths.length > 0 && (
                          <>
                            <p><strong>Payment Months:</strong> {selectedMonths.length} months</p>
                            <p className={styles.monthsList}>{monthsText}</p>
                          </>
                        )}
                      </div>
                      <button 
                        className={styles.generateButton}
                        onClick={() => handleGenerateInvoices(structure)}
                        disabled={generatingInvoices || !structure.isActive}
                      >
                        {generatingInvoices ? '⏳ Generating...' : '📄 Generate All Months'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {showAddClass && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h2>Add Class Fee Structure</h2>
                
                {!defaultAccount && (
                  <div className={styles.warningBox}>
                    <strong>⚠️ Setup Required</strong>
                    <p>No income account found. Please run the setup script first:</p>
                    <code>cd backend && node scripts/setup-default-accounts.js</code>
                  </div>
                )}
                
                <form onSubmit={handleAddClass}>
                  <div className={styles.formGroup}>
                    <label>Class Name *</label>
                    <select
                      value={classForm.className}
                      onChange={(e) => setClassForm({...classForm, className: e.target.value})}
                      required
                      disabled={!defaultAccount}
                    >
                      <option value="">-- Select a Class --</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.value} value={cls.value}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <small className={styles.hint}>
                      Select from existing classes in your school
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Monthly Fee Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={classForm.monthlyFee}
                      onChange={(e) => setClassForm({...classForm, monthlyFee: e.target.value})}
                      placeholder="e.g., 1300"
                      required
                      disabled={!defaultAccount}
                    />
                    <small className={styles.hint}>
                      This amount will be charged every month
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Registration Fee Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={classForm.registrationFee}
                      onChange={(e) => setClassForm({...classForm, registrationFee: e.target.value})}
                      placeholder="e.g., 200"
                      required
                      disabled={!defaultAccount}
                    />
                    <small className={styles.hint}>
                      This will be added to the first month only (e.g., 1300 + 200 = 1500 for first month)
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Select Months for Payment *</label>
                    <div className={styles.infoBox} style={{ 
                      background: '#e3f2fd', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      marginBottom: '10px',
                      fontSize: '0.9em'
                    }}>
                      <strong>📅 Current Month:</strong> {currentEthiopianDate.monthName} (Month {currentEthiopianDate.month})
                      <br />
                      <small>Students can pay up to the current month. Future months are locked.</small>
                    </div>
                    <div className={styles.monthGrid}>
                      {months.map((month) => {
                        const isPastOrCurrent = month.value <= currentEthiopianDate.month;
                        const isFuture = month.value > currentEthiopianDate.month;
                        
                        return (
                          <label 
                            key={month.value} 
                            className={styles.monthCheckbox}
                            style={isFuture ? { opacity: 0.6 } : {}}
                          >
                            <input
                              type="checkbox"
                              checked={classForm.selectedMonths.includes(month.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setClassForm({
                                    ...classForm,
                                    selectedMonths: [...classForm.selectedMonths, month.value].sort((a, b) => a - b)
                                  });
                                } else {
                                  setClassForm({
                                    ...classForm,
                                    selectedMonths: classForm.selectedMonths.filter(m => m !== month.value)
                                  });
                                }
                              }}
                              disabled={!defaultAccount}
                            />
                            <span>
                              {month.name}
                              {isPastOrCurrent && <span style={{ color: '#4CAF50', marginLeft: '5px' }}>✓</span>}
                              {isFuture && <span style={{ color: '#999', marginLeft: '5px' }}>🔒</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <small className={styles.hint}>
                      {classForm.selectedMonths.length > 0 
                        ? `${classForm.selectedMonths.length} month(s) selected` 
                        : 'Select the months when students should pay'}
                      <br />
                      <strong>Note:</strong> Months marked with ✓ are unlocked (past or current). Months with 🔒 are future months.
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={classForm.description}
                      onChange={(e) => setClassForm({...classForm, description: e.target.value})}
                      placeholder="Optional description"
                      rows="3"
                      disabled={!defaultAccount}
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button 
                      type="submit" 
                      className={styles.submitButton}
                      disabled={!defaultAccount}
                    >
                      Add Class Fee
                    </button>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => setShowAddClass(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Late Fees Tab */}
      {activeTab === 'latefees' && !loading && (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeader}>
            <h2>Late Fee Rules</h2>
            <div className={styles.headerButtons}>
              <button 
                className={styles.applyButton}
                onClick={handleApplyLateFees}
              >
                ⚡ Apply Late Fees Now
              </button>
              <button 
                className={styles.addButton}
                onClick={() => setShowAddLateFee(true)}
                disabled={lateFeeRules.length >= 2}
                title={lateFeeRules.length >= 2 ? 'Maximum 2 late fee rules allowed' : 'Add a new late fee rule'}
              >
                + Add Late Fee Rule {lateFeeRules.length >= 2 && '(Max 2)'}
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {lateFeeRules.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No Late Fee Rules Configured</h3>
                <p>Click "+ Add Late Fee Rule" to add your first late fee rule.</p>
                <p className={styles.hint}>💡 Late fees are optional but help encourage timely payments.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Rule Name</th>
                    <th>Grace Period</th>
                    <th>Penalty Type</th>
                    <th>Penalty Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lateFeeRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.name}</td>
                      <td>{rule.gracePeriodDays} days</td>
                      <td>{rule.type}</td>
                      <td>
                        {rule.type === 'PERCENTAGE' ? `${rule.value}%` : `$${rule.value}`}
                      </td>
                      <td>
                        <span className={rule.isActive ? styles.statusActive : styles.statusInactive}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={rule.isActive}
                              onChange={() => handleToggleActive(rule.id, rule.isActive, 'lateFee')}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteLateFeeRule(rule.id, rule.name)}
                            title="Delete Rule"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {showAddLateFee && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h2>Add Late Fee Rule</h2>
                <form onSubmit={handleAddLateFee}>
                  <div className={styles.formGroup}>
                    <label>Rule Name *</label>
                    <input
                      type="text"
                      value={lateFeeForm.name}
                      onChange={(e) => setLateFeeForm({...lateFeeForm, name: e.target.value})}
                      placeholder="e.g., Standard Late Fee"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Grace Period (Days) *</label>
                    <input
                      type="number"
                      value={lateFeeForm.gracePeriodDays}
                      onChange={(e) => setLateFeeForm({...lateFeeForm, gracePeriodDays: e.target.value})}
                      placeholder="e.g., 5"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Penalty Type *</label>
                    <select
                      value={lateFeeForm.penaltyType}
                      onChange={(e) => setLateFeeForm({...lateFeeForm, penaltyType: e.target.value})}
                      required
                    >
                      <option value="FIXED_AMOUNT">Fixed Amount</option>
                      <option value="PERCENTAGE">Percentage</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Penalty Value *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={lateFeeForm.penaltyValue}
                      onChange={(e) => setLateFeeForm({...lateFeeForm, penaltyValue: e.target.value})}
                      placeholder={lateFeeForm.penaltyType === 'PERCENTAGE' ? 'e.g., 5 (for 5%)' : 'e.g., 50'}
                      required
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.submitButton}>
                      Add Late Fee Rule
                    </button>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={() => setShowAddLateFee(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className={styles.tabContent}>
          <h2>General Payment Settings</h2>
          
          <div className={styles.settingsSection}>
            <h3>Payment Methods</h3>
            <div className={styles.checkboxGroup}>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.paymentMethods.cash}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    paymentMethods: { ...generalSettings.paymentMethods, cash: e.target.checked }
                  })}
                /> Cash
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.paymentMethods.bankTransfer}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    paymentMethods: { ...generalSettings.paymentMethods, bankTransfer: e.target.checked }
                  })}
                /> Bank Transfer
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.paymentMethods.mobileMoney}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    paymentMethods: { ...generalSettings.paymentMethods, mobileMoney: e.target.checked }
                  })}
                /> Mobile Money
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.paymentMethods.onlinePayment}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    paymentMethods: { ...generalSettings.paymentMethods, onlinePayment: e.target.checked }
                  })}
                /> Online Payment
              </label>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h3>Invoice Settings</h3>
            <div className={styles.formGroup}>
              <label>Default Due Date (Days from issue)</label>
              <input 
                type="number" 
                value={generalSettings.invoiceSettings.defaultDueDays}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  invoiceSettings: { ...generalSettings.invoiceSettings, defaultDueDays: parseInt(e.target.value) || 30 }
                })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Invoice Prefix</label>
              <input 
                type="text" 
                value={generalSettings.invoiceSettings.invoicePrefix}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  invoiceSettings: { ...generalSettings.invoiceSettings, invoicePrefix: e.target.value }
                })}
              />
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h3>Notifications</h3>
            <div className={styles.checkboxGroup}>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.notifications.paymentReminders}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    notifications: { ...generalSettings.notifications, paymentReminders: e.target.checked }
                  })}
                /> Send payment reminders
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.notifications.paymentConfirmations}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    notifications: { ...generalSettings.notifications, paymentConfirmations: e.target.checked }
                  })}
                /> Send payment confirmations
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={generalSettings.notifications.overdueNotifications}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    notifications: { ...generalSettings.notifications, overdueNotifications: e.target.checked }
                  })}
                /> Send overdue notifications
              </label>
            </div>
          </div>

          <button 
            className={styles.saveButton}
            onClick={handleSaveGeneralSettings}
            disabled={savingSettings}
          >
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonthlyPaymentSettings;
