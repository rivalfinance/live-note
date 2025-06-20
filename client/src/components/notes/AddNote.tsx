import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { io } from 'socket.io-client';
import { useSnackbar } from '../../contexts/SnackbarContext';

const AddNote = () => {
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
    isPublic: false,
    tags: [],
  });
  const [error, setError] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const noteIdRef = useRef(noteId);
  const isCreatingRef = useRef(isCreating);
  const socket = useRef<any>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [noteOwnerId, setNoteOwnerId] = useState<string | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { noteIdRef.current = noteId; }, [noteId]);
  useEffect(() => { isCreatingRef.current = isCreating; }, [isCreating]);

  // Debounced auto-save function
  const debouncedSave = useRef(
    debounce(async (noteData, idRef, isCreatingRef) => {
      try {
        if (!idRef.current && !isCreatingRef.current) {
          isCreatingRef.current = true;
          setIsCreating(true);
          const res = await axios.post('lhttp://localhost:5000/api/notes', noteData, { withCredentials: true });
          setNoteId(res.data._id);
          isCreatingRef.current = false;
          setIsCreating(false);
          if (socket.current) {
            socket.current.emit('join-note', res.data._id);
          }
        } else if (idRef.current) {
          setIsSaving(true);
          await axios.put(`lhttp://localhost:5000/api/notes/${idRef.current}`, noteData, { withCredentials: true });
          setIsSaving(false);
          if (socket.current) {
            socket.current.emit('note-update', { noteId: idRef.current, updates: noteData });
          }
        }
      } catch (err: any) {
        isCreatingRef.current = false;
        setIsCreating(false);
        setIsSaving(false);
        setError(err.response?.data?.message || 'Failed to auto-save note');
      }
    }, 1000)
  );

  useEffect(() => {
    if (!noteId) return;
    // Fetch collaborators
    axios.get(`lhttp://localhost:5000/api/notes/${noteId}/collaborators`, { withCredentials: true })
      .then(res => setCollaborators(res.data.collaborators))
      .catch(() => {});
  }, [noteId]);

  useEffect(() => {
    socket.current = io('lhttp://localhost:5000', { withCredentials: true });
    if (noteId) {
      socket.current.emit('join-note', noteId);
    }
    socket.current.on('note-updated', (data: any) => {
      setNote((prev) => ({ ...prev, ...data.updates }));
    });
    socket.current.on('user-editing', ({ user }: { user: any }) => {
      setEditingUser(user);
    });
    return () => {
      if (noteId) {
        socket.current.emit('leave-note', noteId);
      }
      socket.current.disconnect();
    };
  }, [noteId, currentUser]);

  useEffect(() => {
    if (noteId) {
      axios.get(`lhttp://localhost:5000/api/notes/${noteId}`)
        .then(res => setNoteOwnerId(res.data.user?._id || res.data.user))
        .catch(() => {});
    }
  }, [noteId]);

  const handleChange = (field: string, value: any) => {
    setNote((prev) => {
      const updated = { ...prev, [field]: value };
      debouncedSave.current(updated, noteIdRef, isCreatingRef);
      if (socket.current && noteIdRef.current) {
        socket.current.emit('editing', { noteId: noteIdRef.current, user: currentUser });
        socket.current.emit('note-update', { noteId: noteIdRef.current, updates: updated });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          socket.current.emit('editing', { noteId: noteIdRef.current, user: null });
        }, 2000);
      }
      return updated;
    });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim());
    setNote((prev) => ({ ...prev, tags }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('lhttp://localhost:5000/api/notes', note, { withCredentials: true });
      showSnackbar('Note created successfully!');
      navigate('/notes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save note');
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== SHARE BUTTON CLICKED ===');
    console.log('Share button clicked!');
    console.log('noteId:', noteId);
    console.log('shareEmail:', shareEmail);
    console.log('Form event:', e);
    
    setShareError('');
    if (!noteId) {
      console.log('No noteId, showing error');
      setShareError('Please wait for the note to be created before sharing.');
      return;
    }
    
    console.log('Making API call to add collaborator...');
    console.log('URL:', `lhttp://localhost:5000/api/notes/${noteId}/collaborators`);
    console.log('Data:', { email: shareEmail });
    console.log('Config:', { withCredentials: true });
    
    try {
      console.log('About to send collaborator email:', shareEmail);
      const res = await axios.post(
        `lhttp://localhost:5000/api/notes/${noteId}/collaborators`,
        { email: shareEmail },
        { withCredentials: true }
      );
      console.log('API call successful:', res.data);
      setCollaborators(res.data.collaborators);
      setShareEmail('');
      showSnackbar('Note shared successfully!');
      console.log('Collaborators updated:', res.data.collaborators);
    } catch (err: any) {
      console.error('API call failed:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setShareError(err.response?.data?.message || 'Failed to share note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
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
        <form onSubmit={handleSave} className="bg-white shadow-lg rounded-2xl px-6 py-8 space-y-6">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-700 mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={note.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Note title"
            className="block w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-black mb-4"
            required
          />
          <label htmlFor="content" className="block text-lg font-semibold text-gray-700 mb-1">Content</label>
          <textarea
            id="content"
            value={note.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Start writing your note..."
            className="block w-full h-64 px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 resize-vertical text-black mb-4"
            required
          />
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
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Save
          </button>
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
              disabled={!noteId}
            />
            <button
              type="submit"
              className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              disabled={!noteId}
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

export default AddNote; 