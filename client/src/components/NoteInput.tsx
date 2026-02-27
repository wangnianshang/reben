import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteInputProps {
  onSave: (content: string, image: string | null, description: string) => Promise<void>;
}

const NoteInput: React.FC<NoteInputProps> = ({ onSave }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    setError(null);
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(file.type)) {
      setError('仅支持 JPG, PNG, GIF, SVG 格式');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.onerror = () => setError('图片读取失败，请重试');
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('您的浏览器不支持语音识别功能');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => prev + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setError('语音识别出错: ' + event.error);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSaveClick = async () => {
    if (!content.trim() && !image) {
      setError('请输入内容或选择图片');
      return;
    }
    await onSave(content, image, description);
    setContent('');
    setImage(null);
    setDescription('');
    setError(null);
  };

  return (
    <motion.section 
      className="input-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
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

        <div 
          className={`image-upload-area ${isDragOver ? 'drag-over' : ''} ${image ? 'has-image' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <AnimatePresence>
            {image ? (
              <motion.div 
                className="image-preview"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <img src={image} alt="预览" />
                <motion.div 
                  className="check-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ✅
                </motion.div>
                <button
                  className="remove-btn"
                  onClick={() => setImage(null)}
                >
                  ×
                </button>
              </motion.div>
            ) : (
              <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <p>拖拽图片到这里，或点击上传</p>
                <span className="upload-hint">支持 JPG/PNG/GIF/SVG, ≤ 5MB</span>
              </div>
            )}
          </AnimatePresence>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden-input"
            accept="image/png,image/jpeg,image/gif,image/svg+xml"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>

        {/* Description Field */}
        <AnimatePresence>
          {image && (
            <motion.div 
              className="description-field"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <textarea
                className="description-input"
                placeholder="添加附加说明..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                style={{ 
                    borderColor: description.length >= 500 ? 'red' : undefined 
                }}
              />
              <div className={`char-count ${description.length >= 500 ? 'error' : ''}`}>
                  {description.length}/500
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <div className="error-message">{error}</div>}

        {/* Recording Status */}
        {isRecording && (
          <div className="recording-status">
            <span className="recording-dot"></span>
            正在录音，请说话...
          </div>
        )}

        <div className="action-buttons">
          <motion.button
            className={`btn btn-icon ${isRecording ? 'recording' : ''}`}
            onClick={handleVoiceInput}
            title="语音输入"
            disabled={isRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎤
          </motion.button>

          <motion.button
            className="btn btn-save"
            onClick={handleSaveClick}
            disabled={(!content.trim() && !image) || description.length > 500}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            保存笔记
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default NoteInput;
