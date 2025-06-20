"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        logger_1.default.warn('Authentication failed: No token provided');
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            logger_1.default.error('Authentication error', { error: err.message });
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        try {
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                logger_1.default.warn('Authentication failed: User not found', { userId: decoded.id });
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }
            req.user = { _id: user._id };
            next();
        }
        catch (error) {
            logger_1.default.error('Authentication error', { error: error.message });
            res.status(401).json({ message: 'Not authenticated' });
        }
    });
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map