import React, { useState, useEffect } from 'react';
import styles from '../Finance/FeeManagement/FeeManagement.module.css';

const OrganizationStructure = () => {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('departments');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/hr/roles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return;
    
    try {
      const response = await fetch(`/api/hr/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        if (type === 'departments') fetchDepartments();
        else fetchRoles();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Organization Structure</h1>
          <p>Dynamic role & department builder (No-code style)</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + Add {activeTab === 'departments' ? 'Department' : 'Role'}
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('departments')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'departments' ? '#667eea' : 'white',
            color: activeTab === 'departments' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'roles' ? '#667eea' : 'white',
            color: activeTab === 'roles' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Roles
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.grid}>
          {activeTab === 'departments' ? (
            departments.length === 0 ? (
              <div className={styles.noData}>No departments found</div>
            ) : (
              departments.map(dept => (
                <div key={dept.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{dept.name}</h3>
                    <span className={`${styles.badge} ${dept.isActive ? styles.active : styles.inactive}`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <p><strong>Code:</strong> {dept.code}</p>
                    <p><strong>Head:</strong> {dept.headName || 'Not Assigned'}</p>
                    <p><strong>Staff Count:</strong> {dept.staffCount || 0}</p>
                    {dept.description && <p><strong>Description:</strong> {dept.description}</p>}
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => { setEditingItem(dept); setShowModal(true); }}>✏️ Edit</button>
                    <button onClick={() => handleDelete('departments', dept.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))
            )
          ) : (
            roles.length === 0 ? (
              <div className={styles.noData}>No roles found</div>
            ) : (
              roles.map(role => (
                <div key={role.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{role.name}</h3>
                    <span className={`${styles.badge} ${role.isActive ? styles.active : styles.inactive}`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <p><strong>Code:</strong> {role.code}</p>
                    <p><strong>Level:</strong> {role.level}</p>
                    <p><strong>Department:</strong> {role.departmentName || 'All'}</p>
                    <p><strong>Staff Count:</strong> {role.staffCount || 0}</p>
                    {role.description && <p><strong>Description:</strong> {role.description}</p>}
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => { setEditingItem(role); setShowModal(true); }}>✏️ Edit</button>
                    <button onClick={() => handleDelete('roles', role.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {showModal && (
        activeTab === 'departments' ? (
          <DepartmentModal 
            department={editingItem}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchDepartments(); }}
          />
        ) : (
          <RoleModal 
            role={editingItem}
            departments={departments}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchRoles(); }}
          />
        )
      )}
    </div>
  );
};

const DepartmentModal = ({ department, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: department?.code || '',
    name: department?.name || '',
    description: department?.description || '',
    headStaffId: department?.headStaffId || ''
  });
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = department ? `/api/hr/departments/${department.id}` : '/api/hr/departments';
      const method = department ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Department ${department ? 'updated' : 'created'} successfully!`);
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{department ? 'Edit Department' : 'Add Department'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Department Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g., IT, HR, FIN"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Department Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Information Technology"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Department Head</label>
            <select
              value={formData.headStaffId}
              onChange={(e) => setFormData({...formData, headStaffId: e.target.value})}
            >
              <option value="">-- Select Staff --</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name || `${s.firstName} ${s.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Optional description"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoleModal = ({ role, departments, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: role?.code || '',
    name: role?.name || '',
    level: role?.level || 'STAFF',
    departmentId: role?.departmentId || '',
    description: role?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = role ? `/api/hr/roles/${role.id}` : '/api/hr/roles';
      const method = role ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Role ${role ? 'updated' : 'created'} successfully!`);
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{role ? 'Edit Role' : 'Add Role'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Role Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g., TCH, MGR, DIR"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Role Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Teacher, Manager, Director"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Level *</label>
            <select
              required
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
            >
              <option value="STAFF">Staff</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MANAGER">Manager</option>
              <option value="DIRECTOR">Director</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Department</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
            >
              <option value="">-- All Departments --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Optional description"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationStructure;
