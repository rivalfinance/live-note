import { useQuery, useMutation, useQueryClient, UseMutationResult, useInfiniteQuery } from '@tanstack/react-query';
import { notes as notesApi } from '../services/api';
import { AxiosResponse } from 'axios';

export interface Note {
  _id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteInput {
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
}

export function useNotes() {
  return useQuery<Note[], Error>({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data } = await notesApi.getAll();
      return data;
    },
  });
}

// Infinite scroll support
export function usePaginatedNotes(pageSize = 10) {
  return useInfiniteQuery<Note[], Error>({
    queryKey: ['notes-paginated'],
    queryFn: async ({ pageParam = 0 }) => {
      const page = typeof pageParam === 'number' ? pageParam : Number(pageParam) || 0;
      const { data } = await notesApi.getAll({ page, pageSize });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<any>, Error, NoteInput>({
    mutationFn: (note) => notesApi.create(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-paginated'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<any>, Error, { id: string; data: NoteInput }>({
    mutationFn: ({ id, data }) => notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-paginated'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<any>, Error, string>({
    mutationFn: (id) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-paginated'] });
    },
  });
} 