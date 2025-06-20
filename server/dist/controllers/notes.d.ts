import { INote } from '../models/Note';
export declare const createNote: (noteData: Partial<INote>, userId: string) => Promise<INote>;
export declare const getNotes: (userId: string) => Promise<INote[]>;
export declare const getNote: (noteId: string, userId: string) => Promise<INote | null>;
export declare const updateNote: (noteId: string, noteData: Partial<INote>, userId: string) => Promise<INote | null>;
export declare const deleteNote: (noteId: string, userId: string) => Promise<boolean>;
export declare const addCollaborator: (noteId: string, email: string, userId: string) => Promise<INote | null>;
export declare const removeCollaborator: (noteId: string, collaboratorId: string, userId: string) => Promise<INote | null>;
