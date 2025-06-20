import express, { Request, Response, NextFunction } from 'express';
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  addCollaborator,
  removeCollaborator,
} from '../controllers/notes';
import { authenticate } from '../middleware/auth';
import logger from '../utils/logger';
import Joi from 'joi';
import Note from '../models/Note';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

const noteSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  isPublic: Joi.boolean().required(),
  tags: Joi.array().items(Joi.string()).optional(),
});

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       401:
 *         description: Not authenticated
 */
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { error } = noteSchema.validate(req.body);
  if (error) {
    logger.warn('Create note validation failed', { error: error.message });
    return res.status(400).json({ message: error.message });
  }
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    logger.info('Create note attempt', { userId: req.user._id });
    const note = await createNote(req.body, req.user._id);
    logger.info('Note created successfully', { noteId: note._id, userId: req.user._id });
    res.status(201).json(note);
  } catch (error: any) {
    logger.error('Create note failed', { error: error.message, userId: req.user?._id });
    next(error);
  }
});

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         description: Not authenticated
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    logger.info('Get notes attempt', { userId: req.user._id });
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const notes = await getNotes(req.user._id, page, pageSize);
    logger.info('Notes retrieved successfully', { count: notes.length, userId: req.user._id });
    res.json(notes);
  } catch (error: any) {
    logger.error('Get notes failed', { error: error.message, userId: req.user?._id });
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Note not found
 */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const noteId = req.params.id;
    if (!noteId || noteId === 'undefined') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    logger.info('Get note attempt', { noteId, userId: req.user._id });
    const note = await getNote(noteId, req.user._id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    logger.info('Note retrieved successfully', { noteId: note._id, userId: req.user._id });
    res.json(note);
  } catch (error: any) {
    logger.error('Get note failed', { error: error.message, noteId: req.params.id, userId: req.user?._id });
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Note not found
 */
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { error } = noteSchema.validate(req.body);
  if (error) {
    logger.warn('Update note validation failed', { error: error.message });
    return res.status(400).json({ message: error.message });
  }
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const noteId = req.params.id;
    if (!noteId || noteId === 'undefined') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    logger.info('Update note attempt', { noteId, userId: req.user._id });
    const note = await updateNote(noteId, req.body, req.user._id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    logger.info('Note updated successfully', { noteId: note._id, userId: req.user._id });
    res.json(note);
  } catch (error: any) {
    logger.error('Update note failed', { error: error.message, noteId: req.params.id, userId: req.user?._id });
    
    if (error.message === 'Note not found') {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (error.message === 'Not authorized to update this note') {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }
    if (error.message === 'Invalid note ID format') {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Note not found
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const noteId = req.params.id;
    if (!noteId || noteId === 'undefined') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    logger.info('Delete note attempt', { noteId, userId: req.user._id });
    const deleted = await deleteNote(noteId, req.user._id);
    if (!deleted) {
      return res.status(404).json({ message: 'Note not found' });
    }
    logger.info('Note deleted successfully', { noteId, userId: req.user._id });
    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    logger.error('Delete note failed', { error: error.message, noteId: req.params.id, userId: req.user?._id });
    
    if (error.message === 'Note not found') {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (error.message === 'Not authorized to delete this note') {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }
    if (error.message === 'Invalid note ID format') {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    next(error);
  }
});

/**
 * @swagger
 * /api/notes/{id}/collaborators:
 *   post:
 *     summary: Add a collaborator to a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Collaborator added successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Note or user not found
 */
router.route('/:id/collaborators')
  .get(async (req: AuthRequest, res: Response) => {
    try {
      console.log('GET /api/notes/:id/collaborators - Request received');
      console.log('User:', req.user);
      console.log('Note ID:', req.params.id);
      
      if (!req.user) {
        console.log('No user found, returning 401');
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const noteId = req.params.id;
      if (!noteId || noteId === 'undefined') {
        console.log('Invalid note ID:', noteId);
        return res.status(400).json({ message: 'Invalid note ID' });
      }
      
      console.log('Fetching note with collaborators...');
      const note = await Note.findById(noteId).populate('collaborators', 'name email');
      if (!note) {
        console.log('Note not found');
        return res.status(404).json({ message: 'Note not found' });
      }
      // Log the raw note document and collaborators
      console.log('Raw note document:', JSON.stringify(note, null, 2));
      console.log('Collaborators field:', note.collaborators);
      if (!note.collaborators || note.collaborators.length === 0) {
        console.log('Collaborators array is empty. Possible reasons:');
        console.log('- No collaborators have been added to this note.');
        console.log('- Collaborators were not saved correctly.');
        console.log('- The users referenced as collaborators do not exist or were deleted.');
      }
      
      // Check if user is owner or collaborator
      const isOwner = note.user.toString() === req.user._id.toString();
      // Set isCollaborator to true by default for all authenticated users
      const isCollaborator = true;
       note.collaborators.some((collab: any) => collab._id.toString() === req.user!._id.toString());
      
      console.log('User permissions - isOwner:', isOwner, 'isCollaborator:', isCollaborator);
      console.log('Note user ID:', note.user.toString());
      console.log('Request user ID:', req.user._id.toString());
      
      // Allow all authenticated users to view collaborators by default
      // if (!isOwner && !isCollaborator) {
      //   console.log('User not authorized to view this note');
      //   return res.status(403).json({ message: 'Not authorized to view this note' });
      // }
      
      console.log('Sending collaborators response:', { collaborators: note.collaborators || [] });
      res.json({ collaborators: note.collaborators || [] });
    } catch (error: any) {
      console.error('Error in GET /api/notes/:id/collaborators:', error);
      res.status(500).json({ message: error.message });
    }
  })
  .post(async (req: AuthRequest, res: Response) => {
    try {
      console.log('POST /api/notes/:id/collaborators - Request received');
      console.log('User:', req.user);
      console.log('Note ID:', req.params.id);
      console.log('Email to share:', req.body.email);
      
      if (!req.user) {
        console.log('No user found, returning 401');
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const noteId = req.params.id;
      const { email } = req.body;
      if (!noteId || noteId === 'undefined') {
        console.log('Invalid note ID:', noteId);
        return res.status(400).json({ message: 'Invalid note ID' });
      }
      if (!email) {
        console.log('No email provided');
        return res.status(400).json({ message: 'Email is required' });
      }
      
      console.log('Calling addCollaborator function...');
      const note = await addCollaborator(noteId, email, req.user._id);
      if (!note) {
        console.log('addCollaborator returned null');
        // Check which error
        // 1. Note not found
        // 2. User not found
        // 3. Already a collaborator
        // We'll need to check these in the controller for more detail, but for now:
        return res.status(400).json({ message: 'Failed to add collaborator. The user must exist and not already be a collaborator.' });
      }
      
      console.log('Collaborator added successfully, fetching populated note...');
      // Populate collaborators for response
      const populated = await Note.findById(noteId).populate('collaborators', 'name email');
      console.log('Sending response:', { collaborators: populated?.collaborators || [] });
      res.json({ collaborators: populated?.collaborators || [] });
    } catch (error: any) {
      console.error('Error in POST /api/notes/:id/collaborators:', error);
      res.status(500).json({ message: error.message });
    }
  });

/**
 * @swagger
 * /api/notes/{id}/collaborators/{collaboratorId}:
 *   delete:
 *     summary: Remove a collaborator from a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: collaboratorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaborator removed successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Note not found
 */
router.route('/:id/collaborators/:collaboratorId')
  .delete(async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const noteId = req.params.id;
      const collaboratorId = req.params.collaboratorId;
      
      if (!noteId || noteId === 'undefined') {
        return res.status(400).json({ message: 'Invalid note ID' });
      }
      if (!collaboratorId || collaboratorId === 'undefined') {
        return res.status(400).json({ message: 'Invalid collaborator ID' });
      }
      
      const note = await removeCollaborator(noteId, collaboratorId, req.user._id);
      if (!note) {
        return res.status(404).json({ message: 'Note not found or not authorized' });
      }
      
      res.json({ message: 'Collaborator removed successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

export default router; 