"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User_1.default.findOne({ email });
    if (userExists) {
        logger_1.default.warn('Register failed: User already exists', { email });
        res.status(400).json({ message: 'User already exists' });
        return;
    }
    const user = await User_1.default.create({
        name,
        email,
        password,
    });
    const token = generateToken(user._id);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
    });
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            logger_1.default.warn('Login failed: Missing credentials', { email });
            res.status(400).json({ message: 'Please provide email and password' });
            return;
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            logger_1.default.warn('Login failed: Invalid credentials', { email });
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    }
    catch (error) {
        logger_1.default.error('Login error', { error: error instanceof Error ? error.message : 'Unknown error' });
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    if (!req.user) {
        logger_1.default.warn('Get current user failed: No user in request');
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const user = await User_1.default.findById(req.user._id).select('-password');
    if (!user) {
        logger_1.default.warn('Get current user failed: User not found', { userId: req.user._id });
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
    });
};
exports.getMe = getMe;
const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map