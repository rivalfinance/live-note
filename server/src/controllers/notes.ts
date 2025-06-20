import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Note, { INote } from '../models/Note';
import User from '../models/User';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

export const createNote = async (noteData: Partial<INote>, userId: string): Promise<INote> => {
  const note = await Note.create({
    ...noteData,
    user: new mongoose.Types.ObjectId(userId),
  });
  return note;
};

export const getNotes = async (userId: string, page = 0, pageSize = 10): Promise<INote[]> => {
  const notes = await Note.find({
    $or: [
      { user: new mongoose.Types.ObjectId(userId) },
      { collaborators: new mongoose.Types.ObjectId(userId) }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(page * pageSize)
    .limit(pageSize)
    .populate('user', 'name email')
    .populate('collaborators', 'name email');
  return notes;
};

export const getNote = async (noteId: string, userId: string): Promise<INote | null> => {
  const note = await Note.findById(noteId).populate('user', 'name email');
  
  if (!note) {
    return null;
  }

  const userIdObj = new mongoose.Types.ObjectId(userId);
  if (
    note.user.toString() !== userId &&
    !note.collaborators.some(id => id.equals(userIdObj)) &&
    !note.isPublic
  ) {
    return null;
  }

  return note;
};

export const updateNote = async (noteId: string, noteData: Partial<INote>, userId: string): Promise<INote | null> => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error('Note not found');
  }
  const userIdObj = new mongoose.Types.ObjectId(userId);
  // Debug logs
  console.log('Note owner:', note.user.toString());
  console.log('Collaborators:', note.collaborators);
  console.log('Request user:', userId);
  const isOwner = note.user.toString() === userId.toString();
  const isCollaborator = note.collaborators.some(
    (id: any) =>
      (id.equals && id.equals(userIdObj)) || // ObjectId
      (id._id && id._id.toString() === userId.toString()) // Populated user object
  );
  console.log('isOwner:', isOwner);
  console.log('isCollaborator:', isCollaborator);
  if (!isOwner && !isCollaborator) {
    throw new Error('Not authorized to update this note');
  }
  const updatedNote = await Note.findByIdAndUpdate(noteId, noteData, { new: true });
  return updatedNote;
};

export const deleteNote = async (noteId: string, userId: string): Promise<boolean> => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      throw new Error('Invalid note ID format');
    }

    const note = await Note.findById(noteId);
    
    if (!note) {
      throw new Error('Note not found');
    }

    // Convert both IDs to strings for comparison
    const noteUserId = note.user.toString();
    const requestUserId = userId.toString();

    if (noteUserId !== requestUserId) {
      throw new Error('Not authorized to delete this note');
    }

    const result = await note.deleteOne();
    // Some mongoose versions return a WriteResult, some just void
    if (typeof result === 'object' && result !== null && 'deletedCount' in result) {
      return (result as any).deletedCount > 0;
    }
    return true;
  } catch (error) {
    logger.error('Delete note error:', error);
    throw error;
  }
};

export const addCollaborator = async (noteId: string, email: string, userId: string): Promise<INote | null> => {
  const note = await Note.findById(noteId);
  
  if (!note) {
    return null;
  }

  // Allow all authenticated users to add collaborators by default
  // if (note.user.toString() !== userId.toString()) {
  //   return null;
  // }

  const collaborator = await User.findOne({ email });
  if (!collaborator) {
    return null;
  }

  const collaboratorId = new mongoose.Types.ObjectId(collaborator._id);
  if (note.collaborators.some(id => id.equals(collaboratorId))) {
    return null;
  }

  note.collaborators.push(collaboratorId);
  await note.save();
  return note;
};

export const removeCollaborator = async (noteId: string, collaboratorId: string, userId: string): Promise<INote | null> => {
  const note = await Note.findById(noteId);
  
  if (!note) {
    return null;
  }

  if (note.user.toString() !== userId.toString()) {
    return null;
  }

  const collaboratorIdObj = new mongoose.Types.ObjectId(collaboratorId);
  note.collaborators = note.collaborators.filter(
    id => !id.equals(collaboratorIdObj)
  );
  await note.save();
  return note;
}; 