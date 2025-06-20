"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const noteSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    collaborators: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    isPublic: {
        type: Boolean,
        default: false,
    },
    tags: [{
            type: String,
            trim: true,
        }],
}, {
    timestamps: true,
});
// Index for better search performance
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
const Note = mongoose_1.default.model('Note', noteSchema);
exports.default = Note;
//# sourceMappingURL=Note.js.map