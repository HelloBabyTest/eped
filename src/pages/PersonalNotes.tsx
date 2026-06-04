import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, FileText, Download, Trash2, 
  Upload, Loader2, StickyNote, X, AlertCircle,
  MessageSquare, Sparkles, Send, Bot, User,
  Eye, EyeOff, Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Note {
  id: string;
  title: string;
  content: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export default function PersonalNotes({ adminUserId }: { adminUserId?: string }) {
  const { t } = useLanguage();

  const cachedData = (() => {
    const userId = adminUserId || localStorage.getItem('current_user_id') || '';
    if (!userId) return null;
    const cache = localStorage.getItem('cache_personal_notes_' + userId);
    if (cache) {
      try { return JSON.parse(cache); } catch (_) { return null; }
    }
    return null;
  })();

  const [notes, setNotes] = useState<Note[]>(cachedData?.notes || []);
  const [isVisibleToEditor, setIsVisibleToEditor] = useState(cachedData ? cachedData.isVisibleToEditor !== false : true);
  const [loading, setLoading] = useState(!cachedData);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatQuery, setChatQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userQuery = chatQuery.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setChatQuery('');
    setIsChatLoading(true);

    try {
      const notesContext = notes.map(n => 
        `Sarlavha: ${n.title}\nMazmuni: ${n.content}\nSana: ${new Date(n.created_at).toLocaleDateString()}`
      ).join('\n\n---\n\n');

      const systemInstruction = "Siz pedagogning shaxsiy yordamchisisiz. Sizning vazifangiz uning shaxsiy qaydnomalaridan ma'lumotlarni izlash va savollariga javob berish. " +
        "Faqat quyida keltirilgan qaydlardagi ma'lumotlarga asoslanib javob bering. Agar javob qaydlarda bo'lmasa, uni olib qochmasdan to'g'ridan-to'g'ri 'Bu ma'lumot qaydlaringizda topilmadi' deb ayting. Doimo o'zbek tilida javob bering.\n\n" +
        "QAYDNOMALAR:\n" + (notesContext || "Hozircha qaydnomalar mavjud emas.");

      const contents = [
        ...chatMessages.map(msg => `${msg.role === 'user' ? 'Foydalanuvchi' : 'Model'}: ${msg.text}`),
        `Foydalanuvchi: ${userQuery}`
      ].join('\n\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: contents,
          systemInstruction
        })
      });

      if (!res.ok) {
        let errMsg = 'Server error';
        try {
          const errData = await res.json();
          errMsg = errData.error || errData.message || errMsg;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'model', text: data.text || 'Kechirasiz, javob topilmadi.' }]);
      } else {
        throw new Error('Server returned HTML instead of JSON');
      }
    } catch (err: any) {
      console.error("AI Error:", err);
      setChatMessages(prev => [...prev, { role: 'model', text: `Xatolik: ${err.message || "Tugatamiz va qayta urinib ko'ring."}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const fetchNotes = useCallback(async () => {
    try {
      let targetUserId = adminUserId;
      if (!targetUserId) {
         const { data: { session } } = await supabase.auth.getSession();
         if (!session?.user) return;
         targetUserId = session.user.id;
      }

      const { data, error } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      let vis = true;
      const settingsNote = (data || []).find(n => n.title === 'SYSTEM_SETTINGS');
      if (settingsNote) {
        try {
          const settings = JSON.parse(settingsNote.content);
          vis = settings.visibleToEditor !== false;
          setIsVisibleToEditor(vis);
        } catch (e) {
          setIsVisibleToEditor(true);
        }
      } else {
        setIsVisibleToEditor(true);
      }

      const notesCleaned = (data || []).filter(n => n.title !== 'SYSTEM_SETTINGS');
      setNotes(notesCleaned);
      localStorage.setItem('cache_personal_notes_' + targetUserId, JSON.stringify({ notes: notesCleaned, isVisibleToEditor: vis }));
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adminUserId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const targetUserId = adminUserId || user.id;

      let fileUrl = '';
      let fileName = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${targetUserId}/${Math.random()}.${fileExt}`;
        fileName = file.name;

        const { error: uploadError } = await supabase.storage
          .from('teacher_files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('teacher_files')
          .getPublicUrl(filePath);
        
        fileUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('personal_notes')
        .insert({
          user_id: targetUserId,
          title: newNote.title,
          content: newNote.content,
          file_url: fileUrl,
          file_name: fileName,
        });

      if (insertError) {
        if (insertError.message.includes('file_name')) {
          console.warn("Retrying without file_name column due to schema cache error");
          const { error: retryError } = await supabase
            .from('personal_notes')
            .insert({
              user_id: targetUserId,
              title: newNote.title,
              content: newNote.content,
              file_url: fileUrl,
            });
          
          if (retryError) throw retryError;
        } else {
          throw insertError;
        }
      }

      setNewNote({ title: '', content: '' });
      setFile(null);
      setIsAdding(false);
      fetchNotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm(t('delete') + '?')) return;

    try {
      if (fileUrl) {
        // Extract path from public URL
        const path = fileUrl.split('/teacher_files/')[1];
        if (path) {
          await supabase.storage.from('teacher_files').remove([path]);
        }
      }

      const { error } = await supabase
        .from('personal_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchNotes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    const { handleFileDownload } = await import('../lib/downloadHelper');
    handleFileDownload(fileUrl, fileName);
  };

  const toggleVisibility = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const newValue = !isVisibleToEditor;
      
      // Find existing settings note
      const { data: existing } = await supabase
        .from('personal_notes')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', 'SYSTEM_SETTINGS')
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('personal_notes')
          .update({ content: JSON.stringify({ visibleToEditor: newValue }) })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('personal_notes')
          .insert({
            user_id: user.id,
            title: 'SYSTEM_SETTINGS',
            content: JSON.stringify({ visibleToEditor: newValue })
          });
        if (insertError) throw insertError;
      }
      
      setIsVisibleToEditor(newValue);
    } catch (err: any) {
      console.error('Error toggling visibility:', err);
    }
  };

  const isEditor = !!adminUserId;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{t('personalNotes')}</h1>
            {!isEditor && (
              <button
                onClick={toggleVisibility}
                title={isVisibleToEditor ? "Tahrirlovchiga ko'rinadigan" : "Tahrirlovchidan yashirilgan"}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium ${
                  isVisibleToEditor 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                }`}
              >
                {isVisibleToEditor ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Tahrirlovchiga ko'rinadi
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Tahrirlovchidan yashirilgan
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-gray-500 mt-1">O'zingiz uchun muhim qaydlarni saqlang.</p>
        </div>
        {!isEditor && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            {t('addNote')}
          </button>
        )}
      </div>

      {isEditor && !isVisibleToEditor ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Qaydnomalar yashirilgan</h3>
          <p className="text-gray-500">Ushbu foydalanuvchi o'zining shaxsiy qaydnomalarini tahrirlovchilardan yashirib qo'ygan.</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Add Note Modal */}
          <AnimatePresence>
            {isAdding && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setIsAdding(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">{t('addNote')}</h2>
                      <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleAddNote} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')}</label>
                        <input
                          required
                          value={newNote.title}
                          onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder="Qayd sarlavhasi..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('content')}</label>
                        <textarea
                          rows={4}
                          value={newNote.content}
                          onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Qayd mazmuni..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('file')}</label>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-gray-100 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all group bg-gray-50/50"
                          >
                            <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                            <span className="text-sm text-gray-500 group-hover:text-indigo-600">
                              {file ? file.name : 'Faylni tanlang (PDF, Word, Rasm...)'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsAdding(false)}
                          className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          type="submit"
                          disabled={uploading}
                          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('save')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Notes Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <StickyNote className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('noNotes')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <motion.div
                  layout
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <button
                      onClick={() => handleDelete(note.id, note.file_url)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow whitespace-pre-wrap overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {note.content}
                  </p>
                  
                  <div className="mt-auto">
                    {note.file_url && (
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 max-w-[150px]">
                          <Download className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{note.file_name}</span>
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); handleDownload(note.file_url, note.file_name); }}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap ml-2"
                        >
                          {t('download')}
                        </button>
                      </div>
                    )}
                    
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* AI Chat Floating Button */}
      {(!isEditor || isVisibleToEditor) && (
        <>
          <AnimatePresence>
            {!chatOpen && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setChatOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-40 group flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* AI Chat Panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <h3 className="font-bold">AI Yordamchi</h3>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-indigo-600" />
                      </div>
                      <p className="text-sm">Assalomu alaykum! Qaydnomalaringizdan nimani topib berishim mumkin?</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-white border border-gray-200 shadow-sm'}`}>
                          {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 shadow-sm rounded-tl-none text-gray-800'}`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-tl-none text-gray-800 w-16 flex items-center justify-center h-[46px]">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleAskAI} className="p-3 bg-white border-t border-gray-100 mb-0 shadow-[0_-4px_6px_-6px_rgba(0,0,0,0.1)]">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      placeholder="Qaydlardan qidirish..."
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!chatQuery.trim() || isChatLoading}
                      className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
