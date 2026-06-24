import React from 'react';
import { FiUser, FiMessageCircle } from 'react-icons/fi';
import styles from './ConversationList.module.css';

const ConversationList = ({ conversations, activeId, onSelect, loading }) => {
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (conv, currentUserId) => {
    return conv.participants?.find(p => p.user_id !== currentUserId);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className={styles.empty}>
        <FiMessageCircle />
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {conversations.map(conv => {
        const other = getOtherParticipant(conv, conv.currentUserId);
        const isActive = conv.id === activeId;
        
        return (
          <div
            key={conv.id}
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            onClick={() => onSelect(conv)}
          >
            <div className={styles.avatar}>
              <FiUser />
            </div>
            <div className={styles.content}>
              <div className={styles.header}>
                <span className={styles.name}>{other?.user_name || 'Unknown'}</span>
                <span className={styles.time}>
                  {formatTime(conv.last_message?.created_at)}
                </span>
              </div>
              <div className={styles.preview}>
                {conv.last_message?.message_text || 'No messages yet'}
              </div>
            </div>
            {conv.unread_count > 0 && (
              <div className={styles.badge}>{conv.unread_count}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
