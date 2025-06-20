"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logRequest = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'error.log'),
            level: 'error',
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'combined.log'),
        }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
const logRequest = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        var _a;
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || 'anonymous'
        });
    });
    next();
};
exports.logRequest = logRequest;
const logError = (err, req, res, next) => {
    var _a;
    logger.error({
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        status: err.status || 500,
        userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || 'anonymous'
    });
    next(err);
};
exports.logError = logError;
exports.default = logger;
//# sourceMappingURL=logger.js.map