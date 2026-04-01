import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, FileText, Download, Trash2, 
  Upload, Loader2, StickyNote, X, AlertCircle 
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

export default function PersonalNotes() {
  const { t } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('personal_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

      let fileUrl = '';
      let fileName = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;
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
          user_id: user.id,
          title: newNote.title,
          content: newNote.content,
          file_url: fileUrl,
          file_name: fileName,
        });

      if (insertError) throw insertError;

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('personalNotes')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">O'zingiz uchun muhim qaydlarni saqlang.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          {t('addNote')}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
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
                className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-8"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('addNote')}</h2>
                  <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddNote} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('title')}</label>
                    <input
                      required
                      value={newNote.title}
                      onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                      placeholder="Qayd sarlavhasi..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('content')}</label>
                    <textarea
                      rows={4}
                      value={newNote.content}
                      onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none dark:bg-gray-700 dark:text-white"
                      placeholder="Qayd mazmuni..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('file')}</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-gray-100 dark:border-gray-600 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-all group bg-gray-50/50 dark:bg-gray-700/50"
                      >
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {file ? file.name : 'Faylni tanlang (PDF, Word, Rasm...)'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
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
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <StickyNote className="w-16 h-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noNotes')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <motion.div
              layout
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <button
                  onClick={() => handleDelete(note.id, note.file_url)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                {note.content}
              </p>
              
              {note.file_url && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 max-w-[150px]">
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{note.file_name}</span>
                  </div>
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    {t('download')}
                  </a>
                </div>
              )}
              
              <div className="mt-4 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
