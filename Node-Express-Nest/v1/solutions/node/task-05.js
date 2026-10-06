/**
 * task-05.js
 * Extend your Task 04 server by adding EventEmitter functionality,
 * logging, analytics, and new endpoints.
 *
 * Implement all TODOs below.
 */

const http = require("http");
const url = require("url");
const { EventEmitter } = require("events");
const { resolve } = require("path");
const { rejects } = require("assert");
const path = require("path");

// ---------- Utilities ----------

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(data);
}

function parseIdFromPath(pathname) {
  const m = pathname.match(/^\/todos\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (e) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function nowISO() {
  return new Date().toISOString();
}

function parsePathParams(pattern, path) {
  const params = {};

  const cleanPath = path.split("?")[0].replace(/\/+$/, "");
  const cleanPattern = pattern.replace(/\/+$/, "");
  const patternParts = cleanPattern.split("/");
  const pathParts = cleanPath.split("/");

  if (patternParts.length != pathParts.length) {
    return null;
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':') ) {
      const name = patternPart.slice(1);
      if (name === "") {
        return null;
      }
      params[name] = decodeURIComponent(pathPart);
    } else {
      if (patternPart != pathPart) {
        return null;
      }
    }
  }
  return params;
}

// ---------- Analytics ----------

class AnalyticsTracker {
  constructor() {
    this.stats = {
      totalCreated: 0,
      totalUpdated: 0,
      totalDeleted: 0,
      totalViews: 0,
      errors: 0,
      dailyStats: {},
    };
  }
  _bumpDaily(field) {
    // TODO: implement daily stats tracking
    // - use YYYY-MM-DD date keys
    // - track created, updated, deleted, views per day
    const key = new Date().toISOString().slice(0, 10);

    if (!this.stats.dailyStats[key]) {
      this.stats.dailyStats[key] = { created: 0, updated: 0, deleted: 0, views: 0 };
    }
    if (!(field in this.stats.dailyStats[key])) {
      throw new Error(`Unknown daily field: ${field}`);
    }
    this.stats.dailyStats[key][field] += 1;
  }
  trackCreated() {
    // TODO: implement tracking logic
    this.stats.totalCreated += 1;
    this._bumpDaily("created");
  }
  trackUpdated() {
    // TODO: implement tracking logic
    this.stats.totalUpdated += 1;
    this._bumpDaily("updated");
  }
  trackDeleted() {
    // TODO: implement tracking logic
    this.stats.totalDeleted += 1;
    this._bumpDaily("deleted");
  }
  trackViewed() {
    // TODO: implement tracking logic
    this.stats.totalViews += 1;
    this._bumpDaily("views");
  }
  trackError() {
    // TODO: implement tracking logic
    this.stats.errors += 1;
  }
  getStats() {
    // TODO: implement stats retrieval
    return {
      ...this.stats,
      dailyStats: Object.fromEntries (
        Object.entries(this.stats.dailyStats).map(([day, d]) => [day, {...d}])
      ),
    };
  }
}

// ---------- Console Logger ----------
class ConsoleLogger {
  todoCreated(data) {
    console.log(
      `📝 [${data.timestamp}] Created "${data.todo.title}" (ID: ${data.todo.id})`
    );
  }
  todoUpdated(data) {
    console.log(
      `✏️  [${data.timestamp}] Updated ID ${
        data.newTodo.id
      }; changed: ${data.changes.join(", ")}`
    );
  }
  todoDeleted(data) {
    console.log(
      `🗑️  [${data.timestamp}] Deleted "${data.todo.title}" (ID: ${data.todo.id})`
    );
  }
  todoViewed(data) {
    console.log(`👁️  [${data.timestamp}] Viewed ID ${data.todo.id}`);
  }
  todosListed(data) {
    console.log(`📃 [${data.timestamp}] Listed todos count=${data.count}`);
  }
  todoNotFound(data) {
    console.warn(
      `⚠️  [${data.timestamp}] Not found: id=${data.todoId} op=${data.operation}`
    );
  }
  validationError(data) {
    console.error(
      `❌ [${data.timestamp}] Validation error: ${data.errors.join(", ")}`
    );
  }
  serverError(data) {
    console.error(
      `💥 [${data.timestamp}] Server error in ${data.operation}: ${
        data.error && data.error.message
      }`
    );
  }
}

// ---------- Validation ----------
function validateTodoPayload(payload, isUpdate = false) {
  const errors = [];
  const out = {};

  // TODO: implement full validation logic
  // - title: required, non-empty string
  // - description: optional, string
  // - completed: optional, boolean (default false)

  if (payload === null || typeof payload !== Object || Array.isArray(payload)) {
    errors.push("Request body must be a JSON object");
    return { errors, values: out };
  }

  if (!isUpdate) {
    const hasName = Object.prototype.hasOwnProperty.call(payload, "title");

    if (!hasName) {
      errors.push("Title is required");
    } else if (hasName) {
      const { title } = payload;
      if (typeof title !== "string") {
        errors.push("Title must be string");
      } else if (title.trim().length === 0){
        errors.push("Title cannot be empty or whitespace only");
      }  else if (title.length > 100) {
        errors.push("Title must be 100 characters or less");
      } else {
        out.title = title.trim();
      }
    }
    out.completed = false;
  } else {
    if (Object.prototype.hasOwnProperty.call(payload, "title")) {
      const { title } = payload;
      if (typeof title !== "string") {
        errors.push("Title must be string");
      } else if (title.trim().length === 0){
        errors.push("Title cannot be empty or whitespace only");
      }  else if (title.length > 100) {
        errors.push("Title must be 100 characters or less");
      } else {
        out.title = title.trim();
      }
    }
  }
  

  if (Object.prototype.hasOwnProperty.call(payload, "description")) {
    const { description } = payload;
    if (description !== null && description !== undefined) {
      if (typeof description !== "string") {
        errors.push("Description must be a string");
      } else if (description.length > 500) {
        errors.push("Description must be 100 characters or less");
      } else {
        out.description = description.trim();
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call(payload, "completed")) {
    const {completed} = payload;
    if (typeof completed !== "boolean") {
        errors.push("Completed must be a boolean");
    } else {
      out.completed = completed;
    }
  }
  return { errors, values: out };
}

class TodoServer extends EventEmitter {
  constructor(port = 3000) {
    super();
    this.port = port;
    this.todos = [];
    this.nextId = 1;

    // TODO: initialize analytics tracker
    // TODO: initialize logger
    // TODO: initialize recent events list keeping last 100 events
    
    this.analytics = new AnalyticsTracker();
    this.logger = new ConsoleLogger();
    this.recentEvents = []; 

    this.server = null;

    this._wireDefaultListeners();
  }

  _wireDefaultListeners() {
    const remember = (eventType) => (data) => {
      this.recentEvents.push({ eventType, timestamp: nowISO(), data });
      if (this.recentEvents.length > 100) this.recentEvents.shift();
    };
    // Remember all key events for /events
    [
      "todoCreated",
      "todoUpdated",
      "todoDeleted",
      "todoViewed",
      "todosListed",
      "todoNotFound",
      "validationError",
      "serverError",
    ].forEach((evt) => this.on(evt, remember(evt)));

    // Logging
    this.on("todoCreated", (d) => this.logger.todoCreated(d));
    this.on("todoUpdated", (d) => this.logger.todoUpdated(d));
    this.on("todoDeleted", (d) => this.logger.todoDeleted(d));
    this.on("todoViewed", (d) => this.logger.todoViewed(d));
    this.on("todosListed", (d) => this.logger.todosListed(d));
    this.on("todoNotFound", (d) => this.logger.todoNotFound(d));
    this.on("validationError", (d) => this.logger.validationError(d));
    this.on("serverError", (d) => this.logger.serverError(d));

    // Analytics
    this.on("todoCreated", () => this.analytics.trackCreated());
    this.on("todoUpdated", () => this.analytics.trackUpdated());
    this.on("todoDeleted", () => this.analytics.trackDeleted());
    this.on("todoViewed", () => this.analytics.trackViewed());
    this.on("validationError", () => this.analytics.trackError());
    this.on("serverError", () => this.analytics.trackError());
  }

  _nextId() {
    return this.nextId++;
  }

  /**
   * Start the server
   */
  async start() {
    // TODO: create HTTP server and bind request handler
    // TODO: listen on this.port
    if (this.server) {
      throw new Error("Server is already running");
    }

    this.server = http.createServer((req, res) => this._handleRequest(req, res));

    return new Promise((resolve, reject) => {
      const onError = (err) => {
        this.server = null;                          // clean up so start() can be retried
        this.emit("serverError", { message: err.message, code: err.code });
        reject(err);
      };

      this.server.once("error", onError);

      this.server.listen(this.port, () => {
        this.server.off("error", onError);
        this.emit("serverStarted", { port : this.port});
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop() {
    // TODO: stop the HTTP server if running
    if (!this.server) return;

    return new Promise ((resolve, reject) => {
      this.server.close((err) => {
        const wasListening = this.server.listening;
        this.server = null;

        if (err) {
          this.emit("serverError", {message: err.message, phase: "stop"});
          return reject(err);
        }

        if (wasListening) this.emit("serverStopped");
        resolve();
      })
    })
  }

  /**
   * Handle incoming requests
   */
  async _handleRequest(req, res) {
    // TODO: implement CORS preflight handling
    // TODO: implement routes:
    // - /todos (GET, POST)
    // - /todos/:id (GET, PUT, DELETE)
    // - /analytics (GET)
    // - /events (GET)
    // TODO: emit events for CRUD, errors, validation, etc.
    // TODO: send JSON responses with proper status codes
    console.log("handleRequest hit:", req.method, req.url);
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    const method = req.method;
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.writeHead(204);
      return res.end();
    }

    try {
      const param = parsePathParams('/todos/:id', pathname);
      if (param != null) {
        if (method === "GET")    return await this._getTodoById(req, res, param);
        if (method === "PUT")    return await this._updateTodo(req, res, param);
        if (method === "DELETE") return await this._deleteTodo(req, res, param);
      }

      if (pathname === "/todos") {
        if (method === "GET")  return await this._getAllTodos(req, res, query);
        if (method === "POST") return await this._createTodo(req, res);
      }

      if (method === "GET" && pathname === "/analytics") {
        return sendJson(res, 200, {
          success: true,
          data: this.analytics.getStats(),
        });
      }
      if (method === "GET" && pathname === "/events") {
        const limit = Math.min(Number(query.limit) || 100, 100);
        const events = this.recentEvents.slice(-limit);
        return sendJson(res, 200, {
          success: true,
          data: events,
          count: events.length,
        });
      }
      if (res.headersSent) return;
      this.emit("serverError", { reason: "route not found", path: pathname, method });
      return sendJson(res, 404, {
        success: false,
        error: "Not Found",
        path: pathname,
        method,
      });
    } catch (error) {
      this.emit("serverError", { message: error.message, stack: error.stack });
      if (res.headersSent) return res.end();
      return sendJson(res, 500, { success: false, error: "Internal server error" });
    }
  }
  async _getAllTodos(req, res, query) {
    let todos = this.todos;
    const { completed } = query ?? {};
    if (completed !== undefined) {
      if (completed !== "true" && completed !== "false") {
        this.emit("validationError", {
          operation: "list",
          reason: "completed must be 'true' or 'false'",
          value: completed,
        });
        return sendJson(res, 400, {
          success: false,
          error: "Query parameter 'completed' must be 'true' or 'false'",
        });
      }
      const want = completed === "true";
      todos = todos.filter((t) => t.completed === want);
    }

    this.emit("todosListed", { count: todos.length, filter: completed ?? null });
    return sendJson(res, 200, {
      success: true,
      data: todos,
      count: todos.length,
    });
  }

  async _getTodoById(req, res, params) {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      this.emit("validationError", { operation: "get", reason: "invalid id", id: params.id });
      return sendJson(res, 400, { success: false, error: "Invalid todo id" });
    }

    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      this.emit("todoNotFound", { id, operation: "get" });
      return sendJson(res, 404, { success: false, error: "Todo not found" });
    }

    this.emit("todoViewed", { id });
    return sendJson(res, 200, { success: true, data: todo });
  }

  async _createTodo(req, res) {
    let body;
    try {
      body = await parseBody(req);
    } catch (err) {
      this.emit("validationError", { operation: "create", reason: "invalid json", message: err.message });
      return sendJson(res, 400, { success: false, error: err.message });
    }

    const { errors, values } = validateTodoPayload(body, true);
    if (errors.length) {
      this.emit("validationError", { operation: "create", errors });
      return sendJson(res, 400, { success: false, errors });
    }

    const now = nowISO();
    const newTodo = {
      id: this._nextId(),
      ...values,
      createdAt: now,
      updatedAt: now,
    };

    this.todos.push(newTodo);
    this.emit("todoCreated", { id: newTodo.id, title: newTodo.title });

    return sendJson(res, 201, { success: true, data: newTodo });
  }

  async _updateTodo(req, res, params) {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      this.emit("validationError", { operation: "update", reason: "invalid id", id: params.id });
      return sendJson(res, 400, { success: false, error: "Invalid todo id" });
    }

    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      this.emit("todoNotFound", { id, operation: "update" });
      return sendJson(res, 404, { success: false, error: "Todo not found" });
    }

    let body;
    try {
      body = await parseBody(req);
    } catch (err) {
      this.emit("validationError", { operation: "update", reason: "invalid json", message: err.message });
      return sendJson(res, 400, { success: false, error: err.message });
    }

    const { errors, values } = validateTodoPayload(body, false);
    if (errors.length) {
      this.emit("validationError", { operation: "update", id, errors });
      return sendJson(res, 400, { success: false, errors });
    }

    const existing = this.todos[index];
    const updated = { ...existing, ...values, updatedAt: nowISO() };
    this.todos[index] = updated;

    this.emit("todoUpdated", { id, changes: Object.keys(values) });
    return sendJson(res, 200, { success: true, data: updated });
  }

  async _deleteTodo(req, res, params) {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      this.emit("validationError", { operation: "delete", reason: "invalid id", id: params.id });
      return sendJson(res, 400, { success: false, error: "Invalid todo id" });
    }

    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      this.emit("todoNotFound", { id, operation: "delete" });
      return sendJson(res, 404, { success: false, error: "Todo not found" });
    }

    const [deleted] = this.todos.splice(index, 1);
    this.emit("todoDeleted", { id: deleted.id, title: deleted.title });

    return sendJson(res, 200, { success: true, data: deleted });
  }
}

module.exports = { TodoServer };
