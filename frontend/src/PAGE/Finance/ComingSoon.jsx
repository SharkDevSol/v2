import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ComingSoon.module.css';

const ComingSoon = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🚧</div>
        <h1>{title}</h1>
        <p>{description}</p>
        <p className={styles.note}>This feature is currently under development.</p>
        <button onClick={() => navigate('/finance')} className={styles.backButton}>
          ← Back to Finance Dashboard
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
