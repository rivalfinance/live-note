"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "lhttp://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(
  (0, cors_1.default)({
    origin: process.env.CLIENT_URL || "lhttp://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes App API",
      version: "1.0.0",
      description: "API documentation for the Notes App",
    },
    servers: [
      {
        url: `lhttp://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use(
  "/api-docs",
  swagger_ui_express_1.default.serve,
  swagger_ui_express_1.default.setup(swaggerDocs)
);
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/notes", notes_1.default);
// Socket.IO connection handling
io.on("connection", (socket) => {
  logger_1.default.info("Client connected", { socketId: socket.id });
  socket.on("join-note", (noteId) => {
    socket.join(noteId);
    logger_1.default.info("Client joined note", {
      socketId: socket.id,
      noteId,
    });
  });
  socket.on("leave-note", (noteId) => {
    socket.leave(noteId);
    logger_1.default.info("Client left note", { socketId: socket.id, noteId });
  });
  socket.on("note-update", (data) => {
    socket.to(data.noteId).emit("note-updated", data);
    logger_1.default.info("Note updated", {
      socketId: socket.id,
      noteId: data.noteId,
    });
  });
  socket.on("disconnect", () => {
    logger_1.default.info("Client disconnected", { socketId: socket.id });
  });
});
// MongoDB connection
mongoose_1.default
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/notes-app")
  .then(() => {
    logger_1.default.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger_1.default.error("MongoDB connection error", {
      error: error.message,
    });
  });
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger_1.default.info(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map
