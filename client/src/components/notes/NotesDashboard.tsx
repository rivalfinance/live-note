import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Note, useUpdateNote, NoteInput } from '../../hooks/useNotes';
import { socketService } from '../../services/socket';
import { useAuth } from '../../contexts/AuthContext';

interface NotesDashboardProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  error?: string;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const NotesDashboard: React.FC<NotesDashboardProps> = ({ notes, onEdit, onDelete, loading, error, fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const updateNoteMutation = useUpdateNote();
  const { user } = useAuth();
  const [editingUser, setEditingUser] = useState<{ _id: string; name: string } | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Infinite scroll observer
  useEffect(() => {
    if (!fetchNextPage || !hasNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );
    observer.observe(node);
    return () => {
      observer.unobserve(node);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">My Notes</h1>
      <p className="text-lg text-gray-500 mb-8 text-center">Organize your thoughts and ideas in one place</p>
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <Link
          to="/notes/new"
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create New Note
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4"/><rect x="3" y="10" width="18" height="4"/><rect x="3" y="16" width="18" height="4"/></svg>
            List
          </button>
        </div>
      </div>
      {/* <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
          title="Toggle dark mode"
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div> */}
      <div className="w-full max-w-2xl">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="text-gray-400 text-sm mb-4">{notes.length} note{notes.length !== 1 ? 's' : ''} total</div>
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900 truncate">{note.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Edit"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V21h8" /></svg>
                  </button>
                  <button
                    onClick={() => onDelete(note._id)}
                    className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Delete"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="text-gray-700 text-base mb-2 truncate">{note.content.substring(0, 80)}</div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.304.534 6.121 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {note.isPublic ? 'Public' : 'Private'}
              </div>
            </div>
          ))}
          {notes.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-12">No notes yet. Click "Create New Note" to get started!</div>
          )}
        </div>
        <div ref={loadMoreRef} />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-500">Loading more notes...</span>
          </div>
        )}
        {!hasNextPage && notes.length > 0 && (
          <div className="text-center text-gray-400 py-4">No more notes to load.</div>
        )}
      </div>
    </div>
  );
};

export default NotesDashboard; 