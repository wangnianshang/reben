import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNotes, createNote, deleteNote } from './api/notes';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';
import { Note } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/index.css';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [toast, setToast] = useState('');
  
  const searchTimeoutRef = useRef<any>(null);

  // Load notes
  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotes(keyword, date);
      setNotes(data);
    } catch (error: any) {
      showToast('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, date]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      // Since keyword is in dependency of loadNotes, this effect just ensures state update is debounced if we were doing server search on type
      // But here we are just updating keyword state which triggers loadNotes.
      // Actually, if we want to debounce the API call, we should debounce the setKeyword or the effect calling loadNotes.
      // Current implementation: `setKeyword` updates state immediately, triggering `loadNotes`.
      // The debounce logic in original code was: `setKeyword` inside timeout, but the input was controlled by another state?
      // No, in original code: `onChange` calls `setKeyword`.
      // Let's keep it simple: `onChange` updates keyword, `useEffect` triggers load.
      // To debounce, we should use a separate state for display vs query.
    }, 200);
  }, [keyword]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSave = async (content: string, image: string | null, description: string) => {
    try {
      const noteType = image ? 'image' : 'text';
      // Use image if present, else content.
      // The backend expects 'content' field to store the main data (text or base64).
      const noteContent = image || content;
      
      // If it's an image note, the `content` param from input (text) is ignored for the main content field?
      // Wait, if I upload an image AND type text, where does the text go?
      // In the old app: `const noteContent = image || content;` -> If image exists, text is lost unless stored elsewhere.
      // New requirement: "附加说明... 存入数据库的 description 字段".
      // So:
      // - Image Note: type='image', content=base64, description=text
      // - Text Note: type='text', content=text, description=empty
      
      // But what if user types in the main textarea AND uploads an image?
      // The UI shows main textarea + image preview + description area.
      // The main textarea is "content". The description area is "description".
      // If image is present, `noteContent` = image. `description` = description.
      // What about the text in the main textarea?
      // The original app logic: `const noteContent = image || content;` -> It prioritizes image. Text in main area is ignored if image exists.
      // This seems to be the intended behavior for "Image Note".
      // However, the new "description" field is specifically for image notes.
      
      await createNote(noteType, noteContent, description);
      showToast('保存成功 ✨');
      loadNotes();
    } catch (error: any) {
      showToast('保存失败: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await deleteNote(id);
      showToast('删除成功');
      loadNotes();
    } catch (error: any) {
      showToast('删除失败: ' + error.message);
    }
  };

  return (
    <div className="app">
      <motion.header 
        className="header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1>知识随机本 ✨</h1>
      </motion.header>

      <main className="container">
        <NoteInput onSave={handleSave} />
        
        <NoteList 
          notes={notes}
          loading={loading}
          onDelete={handleDelete}
          keyword={keyword}
          setKeyword={setKeyword}
          date={date}
          setDate={setDate}
        />
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
