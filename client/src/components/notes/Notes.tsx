import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import debounce from 'lodash/debounce';

interface Note {
  _id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    const newSocket = io('lhttp://localhost:5000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Fetch notes
    fetchNotes();

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('lhttp://localhost:5000/api/notes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    }
  };

  const createNote = async () => {
    try {
      const response = await axios.post(
        'lhttp://localhost:5000/api/notes',
        {
          title: 'New Note',
          content: '',
          isPublic: false,
          tags: [],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNotes([...notes, response.data]);
      setSelectedNote(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create note');
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await axios.put(
        `lhttp://localhost:5000/api/notes/${noteId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNotes(notes.map((note) => (note._id === noteId ? response.data : note)));
      if (selectedNote?._id === noteId) {
        setSelectedNote(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update note');
    }
  };

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce((noteId: string, updates: Partial<Note>) => {
      updateNote(noteId, updates);
    }, 1000),
    []
  );

  const handleNoteChange = (field: keyof Note, value: any) => {
    if (!selectedNote) return;

    const updates = { [field]: value };
    setSelectedNote({ ...selectedNote, ...updates });
    debouncedSave(selectedNote._id, updates);

    // Emit real-time update
    socket?.emit('note-update', {
      noteId: selectedNote._id,
      updates,
    });
  };

  const deleteNote = async (noteId: string) => {
    try {
      await axios.delete(`lhttp://localhost:5000/api/notes/${noteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotes(notes.filter((note) => note._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow rounded-lg p-4">
            <button
              onClick={createNote}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              New Note
            </button>
            <div className="mt-4 space-y-2">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedNote?._id === note._id
                      ? 'bg-indigo-100'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <h3 className="font-medium truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {note.content.substring(0, 50)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 ml-6 bg-white shadow rounded-lg p-6">
            {selectedNote ? (
              <div>
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleNoteChange('title', e.target.value)}
                  className="w-full text-2xl font-bold mb-4 p-2 border-b focus:outline-none focus:border-indigo-500"
                  placeholder="Note title"
                />
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => handleNoteChange('content', e.target.value)}
                  className="w-full h-96 p-2 focus:outline-none"
                  placeholder="Start writing..."
                />
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNote.isPublic}
                      onChange={(e) =>
                        handleNoteChange('isPublic', e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600"
                    />
                    <label className="text-sm text-gray-600">Public</label>
                  </div>
                  <button
                    onClick={() => deleteNote(selectedNote._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Select a note or create a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes; 