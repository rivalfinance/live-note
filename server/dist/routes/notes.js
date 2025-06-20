"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notes_1 = require("../controllers/notes");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticate);
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
router.post('/', async (req, res, next) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        logger_1.default.info('Create note attempt', { userId: req.user._id });
        const note = await (0, notes_1.createNote)(req.body, req.user._id);
        logger_1.default.info('Note created successfully', { noteId: note._id, userId: req.user._id });
        res.status(201).json(note);
    }
    catch (error) {
        logger_1.default.error('Create note failed', { error: error.message, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
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
router.get('/', async (req, res, next) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        logger_1.default.info('Get notes attempt', { userId: req.user._id });
        const notes = await (0, notes_1.getNotes)(req.user._id);
        logger_1.default.info('Notes retrieved successfully', { count: notes.length, userId: req.user._id });
        res.json(notes);
    }
    catch (error) {
        logger_1.default.error('Get notes failed', { error: error.message, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
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
router.get('/:id', async (req, res, next) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const noteId = req.params.id;
        if (!noteId || noteId === 'undefined') {
            return res.status(400).json({ message: 'Invalid note ID' });
        }
        logger_1.default.info('Get note attempt', { noteId, userId: req.user._id });
        const note = await (0, notes_1.getNote)(noteId, req.user._id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        logger_1.default.info('Note retrieved successfully', { noteId: note._id, userId: req.user._id });
        res.json(note);
    }
    catch (error) {
        logger_1.default.error('Get note failed', { error: error.message, noteId: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
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
router.put('/:id', async (req, res, next) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const noteId = req.params.id;
        if (!noteId || noteId === 'undefined') {
            return res.status(400).json({ message: 'Invalid note ID' });
        }
        logger_1.default.info('Update note attempt', { noteId, userId: req.user._id });
        const note = await (0, notes_1.updateNote)(noteId, req.body, req.user._id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        logger_1.default.info('Note updated successfully', { noteId: note._id, userId: req.user._id });
        res.json(note);
    }
    catch (error) {
        logger_1.default.error('Update note failed', { error: error.message, noteId: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
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
router.delete('/:id', async (req, res, next) => {
    var _a;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const noteId = req.params.id;
        if (!noteId || noteId === 'undefined') {
            return res.status(400).json({ message: 'Invalid note ID' });
        }
        logger_1.default.info('Delete note attempt', { noteId, userId: req.user._id });
        const deleted = await (0, notes_1.deleteNote)(noteId, req.user._id);
        if (!deleted) {
            return res.status(404).json({ message: 'Note not found' });
        }
        logger_1.default.info('Note deleted successfully', { noteId, userId: req.user._id });
        res.json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Delete note failed', { error: error.message, noteId: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
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
router.route('/:id/collaborators')
    .post(notes_1.addCollaborator);
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
router.route('/:id/collaborators/:collaboratorId')
    .delete(notes_1.removeCollaborator);
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
exports.default = router;
//# sourceMappingURL=notes.js.map