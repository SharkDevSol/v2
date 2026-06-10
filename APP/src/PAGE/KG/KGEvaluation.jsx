import React, { useState, useEffect } from 'react';
import { formatAPIError } from '../../utils/errorMessages';

const KGEvaluation = () => {
  const [kgClasses, setKgClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const h = { 'x-branch-code': (localStorage.getItem('branchCode') || '').toUpperCase() };

  useEffect(() => {
    const fetchKGData = async () => {
      try {
        const res = await fetch('/api/students/form-structure', { headers: h });
        if (res.ok) {
          const data = await res.json();
          const configs = data.classConfigs || {};
          const kgList = Object.entries(configs)
            .filter(([, cfg]) => cfg.isKG)
            .map(([name]) => name);
          setKgClasses(kgList);
        }
      } catch (e) {
        setMessage(formatAPIError(e, 'Failed to load KG data'));
      } finally {
        setLoading(false);
      }
    };
    fetchKGData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>KG Evaluation</h1>
      {loading && <p>Loading...</p>}
      {message && <p style={{ color: '#ef4444' }}>{message}</p>}
      {kgClasses.length > 0 ? (
        <div>
          <p>KG Classes: {kgClasses.join(', ')}</p>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            KG evaluation features coming soon. Select a KG class to begin.
          </p>
        </div>
      ) : !loading && (
        <p style={{ color: '#6b7280' }}>No KG classes found. Enable KG in Task 1 and add KG classes in Task 2.</p>
      )}
    </div>
  );
};

export default KGEvaluation;
