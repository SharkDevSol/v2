import { useNavigate } from 'react-router-dom';
import { FiBook, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import styles from '../AIDashboard.module.css';

export default function ErrorDisplay({ error }) {
  const navigate = useNavigate();
  if (!error) return null;

  const isRich = error && error.type;
  const title = isRich ? error.title : 'Generation Failed';
  const desc = isRich ? error.description : (typeof error === 'string' ? error : 'An error occurred. Please try again.');
  const icon = isRich && error.icon === 'book'
    ? <FiBook style={{fontSize:48,color:'var(--text-muted)',marginBottom:12}} />
    : <FiAlertTriangle style={{fontSize:48,color:'var(--color-warning)',marginBottom:12}} />;
  const hasAction = isRich && error.action;

  return (
    <div className={styles.resultPlaceholder} style={{minHeight:300}}>
      {icon}
      <h3 style={{color:'var(--text-color)',margin:'0 0 8px'}}>{title}</h3>
      <p style={{color:'var(--text-secondary)',maxWidth:400,margin:'0 auto 16px',lineHeight:1.5}}>{desc}</p>
      {hasAction && (
        <button className={styles.genBtn} onClick={() => navigate(error.link)} style={{padding:'10px 20px',display:'inline-flex',alignItems:'center',gap:8}}>
          <FiUpload /> Upload Books
        </button>
      )}
    </div>
  );
}
