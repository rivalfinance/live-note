import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { io } from 'socket.io-client';
import { useSnackbar } from '../../contexts/SnackbarContext';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [note, setNote] = useState<{
    title: string;
    content: string;
    isPublic: boolean;
    tags: string[];
  }>({
    title: '',
    content: '',
    isPublic: true,
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const socket = useRef<any>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteOwnerId, setNoteOwnerId] = useState<string | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce(async (note) => {
      if (!id) return;
      try {
        if (!isUpdating) {
          setIsUpdating(true);
          await axios.put(`lhttp://localhost:5000/api/notes/${id}`, note, { withCredentials: true });
          setIsUpdating(false);
          if (socket.current) {
            socket.current.emit('note-update', { noteId: id, updates: note });
          }
        }
      } catch (err: any) {
        setIsUpdating(false);
        setError(err.response?.data?.message || 'Failed to auto-save note');
      }
    }, 1000),
    [id, isUpdating]
  );

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        setError('');
        setNotFound(false);
        if (!id) {
          setError('Invalid note ID');
          setLoading(false);
          return;
        }
        const response = await axios.get(`lhttp://localhost:5000/api/notes/${id}`, {
          withCredentials: true,
        });
        if (!response.data) {
          setNotFound(true);
          return;
        }
        setNote({
          title: response.data.title,
          content: response.data.content,
          isPublic: response.data.isPublic,
          tags: response.data.tags || [],
        });
        setNoteOwnerId(response.data.user?._id || response.data.user);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.response?.data?.message || 'Failed to fetch note');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // Fetch collaborators
    axios.get(`lhttp://localhost:5000/api/notes/${id}/collaborators`, { withCredentials: true })
      .then(res => setCollaborators(res.data.collaborators))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    socket.current = io('lhttp://localhost:5000', { withCredentials: true });
    socket.current.emit('join-note', id);
    socket.current.on('note-updated', (data: any) => {
      setNote((prev) => ({ ...prev, ...data.updates }));
    });
    socket.current.on('user-editing', ({ user }: { user: any }) => {
      setEditingUser(user);
    });
    return () => {
      socket.current.emit('leave-note', id);
      socket.current.disconnect();
    };
  }, [id, currentUser]);

  const handleChange = (field: string, value: any) => {
    setNote((prev) => {
      const updated = { ...prev, [field]: value };
      debouncedSave(updated);
      if (socket.current) {
        socket.current.emit('editing', { noteId: id, user: currentUser });
        socket.current.emit('note-update', { noteId: id, updates: updated });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          socket.current.emit('editing', { noteId: id, user: null });
        }, 2000);
      }
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`lhttp://localhost:5000/api/notes/${id}`, note, { withCredentials: true });
      showSnackbar('Note updated successfully!');
      navigate('/notes');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.message || 'Failed to save note');
      }
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');
    try {
      const res = await axios.post(
        `lhttp://localhost:5000/api/notes/${id}/collaborators`,
        { email: shareEmail },
        { withCredentials: true }
      );
      setCollaborators(res.data.collaborators);
      setShareEmail('');
      showSnackbar('Note shared successfully!');
    } catch (err: any) {
      setShareError(err.response?.data?.message || 'Failed to share note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Note Not Found</h2>
          <p className="mt-2 text-gray-600">The note you're looking for doesn't exist or you don't have permission to access it.</p>
          <button
            onClick={() => navigate('/notes')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Edit Note</h1>
        {editingUser && editingUser._id !== currentUser._id && (
          console.log('Typing indicator:', { editingUser, currentUser }),
          <div className="text-yellow-600 font-semibold mb-2">
            {editingUser._id === noteOwnerId
              ? (editingUser.name ? `${editingUser.name} (Owner) is typing...` : 'Owner is typing...')
              : (collaborators.some(c => c._id === editingUser._id)
                  ? (editingUser.name ? `${editingUser.name} (Collaborator) is typing...` : 'Collaborator is typing...')
                  : 'A user is typing...')}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-6 bg-white shadow-lg rounded-2xl px-6 py-8">
          <div>
            <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={note.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Note title"
              className="block w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-black"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-lg font-semibold text-gray-700 mb-1">Content</label>
            <textarea
              id="content"
              value={note.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Start writing your note..."
              className="block w-full h-64 px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 resize-vertical text-black"
              required
            />
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <input
              id="isPublic"
              type="checkbox"
              checked={note.isPublic}
              onChange={(e) => handleChange('isPublic', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-600">Public</label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Save Changes
            </button>
          </div>
        </form>
        <div className="mt-6">
          <form onSubmit={handleShare} className="flex gap-2 items-center">
            <input
              type="email"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              placeholder="Share with email"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              required
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              title="Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12v.01M8 12v.01M12 12v.01M16 12v.01M20 12v.01" /></svg>
              Share
            </button>
          </form>
          {shareError && <div className="text-red-500 mt-2">{shareError}</div>}
          <ul className="mt-4 space-y-1">
            {collaborators.map((user: any) => (
              <li key={user._id || user} className="flex items-center gap-2 text-gray-700 bg-gray-100 rounded px-3 py-1">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.304.534 6.121 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {user.email || user}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditNote; 