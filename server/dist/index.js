"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = __importDefault(require("./config/db"));
const swagger_1 = require("./config/swagger");
const auth_1 = __importDefault(require("./routes/auth"));
const notes_1 = __importDefault(require("./routes/notes"));
const logger_1 = require("./utils/logger");
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
(0, db_1.default)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "lhttp://localhost:3000",
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
  })
);
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(logger_1.logRequest);
// Swagger documentation
app.use(
  "/api-docs",
  swagger_ui_express_1.default.serve,
  swagger_ui_express_1.default.setup(swagger_1.specs)
);
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/notes", notes_1.default);
// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("join-note", (noteId) => {
    socket.join(noteId);
    socket.to(noteId).emit("user-joined");
  });
  socket.on("leave-note", (noteId) => {
    socket.leave(noteId);
  });
  socket.on("note-update", ({ noteId, note }) => {
    socket.to(noteId).emit("note-updated", note);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// Error handling middleware
app.use(logger_1.logError);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `API Documentation available at lhttp://localhost:${PORT}/api-docs`
  );
});
//# sourceMappingURL=index.js.map
