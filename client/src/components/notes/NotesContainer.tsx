import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotesDashboard from './NotesDashboard';
import { usePaginatedNotes, useDeleteNote, Note } from '../../hooks/useNotes';
import { socketService } from '../../services/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '../../contexts/SnackbarContext';

const NotesContainer = () => {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePaginatedNotes(10);
  const notes = data ? data.pages.flat() : [];
  const deleteNoteMutation = useDeleteNote();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const socket = socketService.connect();
    const handleNoteUpdated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-paginated'] });
      if (data && data.noteId) {
        showSnackbar('A note was updated by another user.', 'info');
      }
    };
    socketService.onNoteUpdate(handleNoteUpdated);
    return () => {
      socketService.offNoteUpdate(handleNoteUpdated);
      socketService.disconnect();
    };
  }, [queryClient, showSnackbar]);

  const handleEdit = (note: Note) => {
    navigate(`/notes/${note._id}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    deleteNoteMutation.mutate(id);
  };

  return (
    <NotesDashboard
      notes={notes}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={isLoading}
      error={error?.message || ''}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};

export default NotesContainer; 