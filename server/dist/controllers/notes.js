"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCollaborator = exports.addCollaborator = exports.deleteNote = exports.updateNote = exports.getNote = exports.getNotes = exports.createNote = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Note_1 = __importDefault(require("../models/Note"));
const User_1 = __importDefault(require("../models/User"));
const createNote = async (noteData, userId) => {
    const note = await Note_1.default.create({
        ...noteData,
        user: new mongoose_1.default.Types.ObjectId(userId),
    });
    return note;
};
exports.createNote = createNote;
const getNotes = async (userId) => {
    const notes = await Note_1.default.find({
        user: new mongoose_1.default.Types.ObjectId(userId)
    }).populate('user', 'name email');
    return notes;
};
exports.getNotes = getNotes;
const getNote = async (noteId, userId) => {
    const note = await Note_1.default.findById(noteId).populate('user', 'name email');
    if (!note) {
        return null;
    }
    const userIdObj = new mongoose_1.default.Types.ObjectId(userId);
    if (note.user.toString() !== userId &&
        !note.collaborators.some(id => id.equals(userIdObj)) &&
        !note.isPublic) {
        return null;
    }
    return note;
};
exports.getNote = getNote;
const updateNote = async (noteId, noteData, userId) => {
    const note = await Note_1.default.findById(noteId);
    if (!note) {
        return null;
    }
    if (note.user.toString() !== userId) {
        return null;
    }
    const updatedNote = await Note_1.default.findByIdAndUpdate(noteId, noteData, { new: true });
    return updatedNote;
};
exports.updateNote = updateNote;
const deleteNote = async (noteId, userId) => {
    const note = await Note_1.default.findById(noteId);
    if (!note) {
        return false;
    }
    if (note.user.toString() !== userId) {
        return false;
    }
    await note.deleteOne();
    return true;
};
exports.deleteNote = deleteNote;
const addCollaborator = async (noteId, email, userId) => {
    const note = await Note_1.default.findById(noteId);
    if (!note) {
        return null;
    }
    if (note.user.toString() !== userId) {
        return null;
    }
    const collaborator = await User_1.default.findOne({ email });
    if (!collaborator) {
        return null;
    }
    const collaboratorId = new mongoose_1.default.Types.ObjectId(collaborator._id);
    if (note.collaborators.some(id => id.equals(collaboratorId))) {
        return null;
    }
    note.collaborators.push(collaboratorId);
    await note.save();
    return note;
};
exports.addCollaborator = addCollaborator;
const removeCollaborator = async (noteId, collaboratorId, userId) => {
    const note = await Note_1.default.findById(noteId);
    if (!note) {
        return null;
    }
    if (note.user.toString() !== userId) {
        return null;
    }
    const collaboratorIdObj = new mongoose_1.default.Types.ObjectId(collaboratorId);
    note.collaborators = note.collaborators.filter(id => !id.equals(collaboratorIdObj));
    await note.save();
    return note;
};
exports.removeCollaborator = removeCollaborator;
//# sourceMappingURL=notes.js.map