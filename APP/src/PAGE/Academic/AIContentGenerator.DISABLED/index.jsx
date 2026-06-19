import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONTENT_MODES } from './contentModes';
import styles from './AIContentGenerator.module.css';

const AIContentGenerator = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Content Generator</h1>
        <p className={styles.subtitle}>
          Generate curriculum-aligned educational content powered by AI.
          Select a content type below to get started.
        </p>
      </div>

      <div className={styles.modeGrid}>
        {CONTENT_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.modeCard} ${hoveredCard === mode.id ? styles.modeCardHovered : ''}`}
            style={{ borderTopColor: mode.color }}
            onMouseEnter={() => setHoveredCard(mode.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(`/ai-content/${mode.id}`)}
          >
            <div className={styles.modeIcon}>{mode.icon}</div>
            <h3 className={styles.modeTitle}>{mode.title}</h3>
            <p className={styles.modeDescription}>{mode.description}</p>
            <div className={styles.modeArrow}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIContentGenerator;
