import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotes, createNote, deleteNote } from './api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [toast, setToast] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // 加载笔记
  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotes(keyword, date);
      setNotes(data);
    } catch (error) {
      showToast('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, date]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // 防抖搜索
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setKeyword(keyword);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 显示提示
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  // 保存笔记
  const handleSave = async () => {
    if (!content.trim() && !image) {
      showToast('请输入内容或选择图片');
      return;
    }

    try {
      const noteType = image ? 'image' : 'text';
      const noteContent = image || content;
      await createNote(noteType, noteContent);
      setContent('');
      setImage(null);
      showToast('保存成功 ✨');
      loadNotes();
    } catch (error) {
      showToast('保存失败: ' + error.message);
    }
  };

  // 删除笔记
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await deleteNote(id);
      showToast('删除成功');
      loadNotes();
    } catch (error) {
      showToast('删除失败: ' + error.message);
    }
  };

  // 图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('图片不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // 清空输入，以便再次选择同一张图片
    e.target.value = '';
  };

  // 语音转文字
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('您的浏览器不支持语音识别功能');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => {
      setIsRecording(true);
      showToast('正在录音...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => prev + transcript);
      showToast('语音识别完成');
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        showToast('未检测到语音');
      } else {
        showToast('语音识别出错: ' + event.error);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // 格式化时间
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 清除日期筛选
  const clearDateFilter = () => {
    setDate('');
  };

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <h1>知识随机本 ✨</h1>
      </header>

      {/* 主内容区 */}
      <main className="container">
        {/* 输入区域 */}
        <section className="input-section">
          <div className="input-card">
            <h2>记录新知识</h2>

            <div className="textarea-wrapper">
              <textarea
                className="note-input"
                placeholder="记录今天的学习收获..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={5000}
              />
            </div>

            {/* 图片预览 */}
            {image && (
              <div className="image-preview">
                <img src={image} alt="预览" />
                <button
                  className="remove-btn"
                  onClick={() => setImage(null)}
                >
                  ×
                </button>
              </div>
            )}

            {/* 录音状态 */}
            {isRecording && (
              <div className="recording-status">
                <span className="recording-dot"></span>
                正在录音，请说话...
              </div>
            )}

            {/* 功能按钮 */}
            <div className="action-buttons">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden-input"
                accept="image/png,image/jpeg,image/gif"
                onChange={handleImageUpload}
              />
              <button
                className="btn btn-icon"
                onClick={() => fileInputRef.current?.click()}
                title="上传图片"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>

              <button
                className={`btn btn-icon ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceInput}
                title="语音输入"
                disabled={isRecording}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>

              <button
                className="btn btn-save"
                onClick={handleSave}
                disabled={!content.trim() && !image}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                保存笔记
              </button>
            </div>
          </div>
        </section>

        {/* 列表区域 */}
        <section className="list-section">
          {/* 搜索栏 */}
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="搜索笔记内容..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <input
              type="date"
              className="date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {date && (
              <button
                className="btn"
                onClick={clearDateFilter}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                清除筛选
              </button>
            )}
          </div>

          {/* 笔记列表 */}
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
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                  <div className="note-time">{formatTime(note.createdAt)}</div>
                  <div className={`note-content ${note.type === 'image' ? 'image-content' : ''}`}>
                    {note.type === 'image' ? (
                      <img
                        src={note.content}
                        alt="笔记图片"
                        onClick={() => {
                          setModalImage(note.content);
                          setShowModal(true);
                        }}
                      />
                    ) : (
                      note.content
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 提示消息 */}
      {toast && <div className="toast">{toast}</div>}

      {/* 图片模态框 */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <img src={modalImage} alt="大图" />
        </div>
      )}
    </div>
  );
}

export default App;
