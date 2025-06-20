import mongoose from 'mongoose';
export interface INote extends mongoose.Document {
    title: string;
    content: string;
    user: mongoose.Types.ObjectId;
    collaborators: mongoose.Types.ObjectId[];
    isPublic: boolean;
    tags: string[];
}
declare const Note: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}> & INote & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Note;
