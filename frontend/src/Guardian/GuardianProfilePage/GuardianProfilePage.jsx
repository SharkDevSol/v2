import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiEdit2, FiLogOut } from 'react-icons/fi';
import { FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './GuardianProfilePage.module.css';

const GuardianProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [guardianData, setGuardianData] = useState({
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    phone: '+251 911 234 567',
    relation: 'Father',
    address: 'Addis Ababa, Ethiopia',
    wards: [
      { name: 'Ibrahim Ahmed', grade: '10', section: 'A' },
      { name: 'Fatima Ahmed', grade: '8', section: 'B' }
    ]
  });

  const handleLogout = () => {
    localStorage.removeItem('guardianInfo');
    navigate('/app/guardian-login');
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <FaUserShield size={48} />
            </div>
            <button className={styles.editAvatarBtn}>
              <FiEdit2 size={14} />
            </button>
          </div>
          <div className={styles.headerInfo}>
            <h1>{guardianData.name}</h1>
            <p className={styles.relation}>{guardianData.relation}</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Personal Information</h2>
            <button 
              className={styles.editBtn}
              onClick={() => setIsEditing(!isEditing)}
            >
              <FiEdit2 /> {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <FiMail className={styles.icon} />
              <div>
                <label>Email</label>
                {isEditing ? (
                  <input type="email" value={guardianData.email} />
                ) : (
                  <p>{guardianData.email}</p>
                )}
              </div>
            </div>
            <div className={styles.infoItem}>
              <FiPhone className={styles.icon} />
              <div>
                <label>Phone</label>
                {isEditing ? (
                  <input type="tel" value={guardianData.phone} />
                ) : (
                  <p>{guardianData.phone}</p>
                )}
              </div>
            </div>
            <div className={styles.infoItem}>
              <FiUser className={styles.icon} />
              <div>
                <label>Address</label>
                {isEditing ? (
                  <input type="text" value={guardianData.address} />
                ) : (
                  <p>{guardianData.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>My Wards</h2>
          <div className={styles.wardsGrid}>
            {guardianData.wards.map((ward, index) => (
              <motion.div
                key={index}
                className={styles.wardCard}
                whileHover={{ scale: 1.02 }}
              >
                <div className={styles.wardAvatar}>
                  <FiUser size={24} />
                </div>
                <div className={styles.wardInfo}>
                  <h3>{ward.name}</h3>
                  <p>Grade {ward.grade} - Section {ward.section}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GuardianProfilePage;
