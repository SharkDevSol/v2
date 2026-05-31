import React from 'react';

const StaffSalaryDetails = ({ staff, onClose }) => {
  const baseSalary = parseFloat(staff.salaries[0]?.baseSalary || 0);
  
  let totalAllowances = 0;
  staff.allowances?.forEach(allowance => {
    if (allowance.calculationType === 'PERCENTAGE') {
      totalAllowances += (baseSalary * parseFloat(allowance.amount)) / 100;
    } else {
      totalAllowances += parseFloat(allowance.amount);
    }
  });
  
  let totalDeductions = 0;
  staff.deductions?.forEach(deduction => {
    if (deduction.calculationType === 'PERCENTAGE') {
      totalDeductions += (baseSalary * parseFloat(deduction.amount)) / 100;
    } else {
      totalDeductions += parseFloat(deduction.amount);
    }
  });
  
  let totalRetention = 0;
  staff.retentionBenefits?.forEach(benefit => {
    if (benefit.calculationType === 'PERCENTAGE') {
      totalRetention += (baseSalary * parseFloat(benefit.amount)) / 100;
    } else {
      totalRetention += parseFloat(benefit.amount);
    }
  });
  
  const netSalary = baseSalary + totalAllowances + totalRetention - totalDeductions;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Salary Details - {staff.firstName} {staff.lastName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div style={{ padding: '20px 0' }}>
          <h3>Base Salary</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
            ${baseSalary.toFixed(2)}
          </p>

          <h3 style={{ marginTop: '20px' }}>Deductions (-)</h3>
          {staff.deductions?.length > 0 ? (
            <>
              {staff.deductions.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{d.deductionType.name}</span>
                  <span style={{ color: '#e74c3c' }}>
                    -${d.calculationType === 'PERCENTAGE' 
                      ? ((baseSalary * parseFloat(d.amount)) / 100).toFixed(2)
                      : parseFloat(d.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', fontWeight: 'bold' }}>
                <span>Total Deductions:</span>
                <span style={{ color: '#e74c3c', float: 'right' }}>-${totalDeductions.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#7f8c8d' }}>No deductions</p>
          )}

          <h3 style={{ marginTop: '20px' }}>Allowances (+)</h3>
          {staff.allowances?.length > 0 ? (
            <>
              {staff.allowances.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{a.allowanceType.name}</span>
                  <span style={{ color: '#27ae60' }}>
                    +${a.calculationType === 'PERCENTAGE' 
                      ? ((baseSalary * parseFloat(a.amount)) / 100).toFixed(2)
                      : parseFloat(a.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', fontWeight: 'bold' }}>
                <span>Total Allowances:</span>
                <span style={{ color: '#27ae60', float: 'right' }}>+${totalAllowances.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#7f8c8d' }}>No allowances</p>
          )}

          <h3 style={{ marginTop: '20px' }}>Retention Benefits (+)</h3>
          {staff.retentionBenefits?.length > 0 ? (
            <>
              {staff.retentionBenefits.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{r.retentionBenefitType.name}</span>
                  <span style={{ color: '#9b59b6' }}>
                    +${r.calculationType === 'PERCENTAGE' 
                      ? ((baseSalary * parseFloat(r.amount)) / 100).toFixed(2)
                      : parseFloat(r.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', fontWeight: 'bold' }}>
                <span>Total Benefits:</span>
                <span style={{ color: '#9b59b6', float: 'right' }}>+${totalRetention.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#7f8c8d' }}>No retention benefits</p>
          )}

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>NET SALARY</h2>
            <p style={{ margin: '10px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>
              ${netSalary.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-cancel">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSalaryDetails;
