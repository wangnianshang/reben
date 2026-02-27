import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  onDelete: (id: number) => void;
  keyword: string;
  setKeyword: (k: string) => void;
  date: string;
  setDate: (d: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ 
  notes, loading, onDelete, keyword, setKeyword, date, setDate 
}) => {
  const [modalImage, setModalImage] = useState<string | null>(null);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Basic validation or formatting could happen here
      setDate(e.target.value);
  };

  return (
    <section className="list-section">
      {/* Search Header */}
      <div className="search-header">
        <h3>旧知识检索库</h3>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="搜索笔记内容..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="date-input-wrapper">
            <input
              type="text"
              className="date-input-text"
              placeholder="请选择日期（支持模糊搜索）"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
              }}
              value={date}
              onChange={handleDateChange}
            />
            {date && (
                <button 
                    className="clear-date-btn"
                    onClick={() => setDate('')}
                >
                    ×
                </button>
            )}
        </div>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📝</div>
          <p>还没有记录，开始你的第一条知识吧</p>
        </div>
      ) : (
        <div className="notes-list">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div 
                key={note.id} 
                className="note-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <motion.button
                  className="delete-btn"
                  onClick={() => onDelete(note.id)}
                  whileHover={{ scale: 1.1, color: 'red' }}
                >
                  🗑️
                </motion.button>
                <div className="note-time">{formatTime(note.created_at)}</div>
                
                <div className={`note-content ${note.type === 'image' ? 'image-content' : ''}`}>
                  {note.type === 'image' ? (
                    <div className="image-wrapper">
                        <img
                        src={note.content}
                        alt="笔记图片"
                        onClick={() => setModalImage(note.content)}
                        />
                        {note.description && (
                            <p className="note-description">{note.description}</p>
                        )}
                    </div>
                  ) : (
                    <p>{note.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {modalImage && (
            <motion.div 
                className="modal" 
                onClick={() => setModalImage(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
            <motion.img 
                src={modalImage} 
                alt="大图" 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
            />
            </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default NoteList;
