import { useState } from 'react';
import axios from 'axios';

const TestShare = () => {
  const [noteId, setNoteId] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAddCollaborator = async () => {
    setLoading(true);
    setResult('');
    try {
      console.log('Testing add collaborator...');
      console.log('Note ID:', noteId);
      console.log('Email:', email);
      
      const response = await axios.post(
        `lhttp://localhost:5000/api/notes/${noteId}/collaborators`,
        { email },
        { withCredentials: true }
      );
      
      console.log('Response:', response.data);
      setResult(`Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCollaborators = async () => {
    setLoading(true);
    setResult('');
    try {
      console.log('Testing get collaborators...');
      console.log('Note ID:', noteId);
      
      const response = await axios.get(
        `lhttp://localhost:5000/api/notes/${noteId}/collaborators`,
        { withCredentials: true }
      );
      
      console.log('Response:', response.data);
      setResult(`Success: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Error:', error);
      setResult(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Share API</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Note ID:</label>
          <input
            type="text"
            value={noteId}
            onChange={(e) => setNoteId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter note ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter email to share with"
          />
        </div>
        
        <div className="space-y-2">
          <button
            onClick={testAddCollaborator}
            disabled={loading || !noteId || !email}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Add Collaborator'}
          </button>
          
          <button
            onClick={testGetCollaborators}
            disabled={loading || !noteId}
            className="w-full bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Get Collaborators'}
          </button>
        </div>
        
        {result && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Result:</label>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestShare; 