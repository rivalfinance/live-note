"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', (req, res, next) => {
    logger_1.default.info('Register attempt', { email: req.body.email });
    (0, auth_1.register)(req, res).catch((error) => {
        logger_1.default.error('Register failed', { error: error.message, email: req.body.email });
        next(error);
    });
});
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (req, res, next) => {
    logger_1.default.info('Login attempt', { email: req.body.email });
    (0, auth_1.login)(req, res).catch((error) => {
        logger_1.default.error('Login failed', { error: error.message, email: req.body.email });
        next(error);
    });
});
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Not authenticated
 */
router.get('/me', auth_2.authenticate, (req, res, next) => {
    logger_1.default.info('Get current user attempt');
    (0, auth_1.getMe)(req, res).catch((error) => {
        logger_1.default.error('Get current user failed', { error: error.message });
        next(error);
    });
});
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post('/logout', (req, res, next) => {
    logger_1.default.info('Logout attempt');
    (0, auth_1.logout)(req, res).catch((error) => {
        logger_1.default.error('Logout failed', { error: error.message });
        next(error);
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map