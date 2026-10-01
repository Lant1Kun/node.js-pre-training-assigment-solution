const { error } = require("console");
const http = require("http");
const { type } = require("os");
const { title } = require("process");
const { text, json } = require("stream/consumers");
const url = require("url");

/**
 * Todo REST API Server
 * Built with Node.js built-in HTTP module
 * Supports full CRUD operations with in-memory storage
 */

/**
 * Parse JSON request body from HTTP request
 * @param {IncomingMessage} req - HTTP request object
 * @returns {Promise<Object>} Parsed JSON data
 */
function parseBody(req) {
  // TODO: Implement async JSON body parsing
  // 1. Create promise to handle async data streaming
  // 2. Listen for 'data' events to collect chunks
  // 3. Listen for 'end' event to parse complete body
  // 4. Handle JSON parsing errors gracefully
  // 5. Return empty object if no body provided

  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      if (!body || body.trim() === "") {
        return resolve({});
      }

      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Invalide JSON body: ${err.message}`));
      }

    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Extract path parameters from URL pattern
 * @param {string} pattern - URL pattern like '/todos/:id'
 * @param {string} path - Actual path like '/todos/123'
 * @returns {Object} Extracted parameters like { id: "123" }
 */
function parsePathParams(pattern, path) {
  // TODO: Implement path parameter extraction
  // 1. Split pattern and path by '/'
  // 2. Find segments that start with ':'
  // 3. Extract corresponding values from path
  // 4. Return object with parameter names and values
  // 5. Handle edge cases (no params, mismatched segments)

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

  // Implementation goes here
  return params;
}

/**
 * Send consistent JSON response
 * @param {ServerResponse} res - HTTP response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 */
function sendResponse(res, statusCode, data) {
  // TODO: Implement consistent response sending
  // 1. Set proper HTTP status code
  // 2. Set Content-Type to application/json
  // 3. Add CORS headers for browser compatibility
  // 4. Convert data to JSON string
  // 5. Send response and end connection

  // Headers to set:
  // - Content-Type: application/json
  // - Access-Control-Allow-Origin: *
  // - Access-Control-Allow-Methods: GET, POST, PUT, DELETE
  // - Access-Control-Allow-Headers: Content-Type
  if (res.headersSent) {
    console.error(new Error("stack").stack); 
    return;
  }
  res.writeHead(statusCode, {
    "Content-Type": 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  const body = JSON.stringify(data ?? {});
  res.end(body);
}

/**
 * Validate todo data according to business rules
 * @param {Object} todoData - Todo data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with errors array
 */
function validateTodo(todoData, isUpdate = false) {
  // TODO: Implement todo data validation
  // 1. Check title requirements (required, string, 1-100 chars, not whitespace-only)
  // 2. Check description (optional, string, max 500 chars)
  // 3. Check completed (optional, boolean only)
  // 4. Return validation result with errors array
  // 5. Handle update vs create validation differences

  const errors = [];

  // Title validation
  // - Required for create, optional for update
  // - Must be string
  // - 1-100 characters
  // - Cannot be only whitespace

  // Description validation
  // - Optional field
  // - Must be string if provided
  // - Max 500 characters

  // Completed validation
  // - Optional field
  // - Must be boolean if provided

  if (todoData === null || typeof todoData !== "object" || Array.isArray(todoData)) {
    errors.push("Request body must be a JSON object");
    return { isValid: false, errors };
  }

  if (!isUpdate) {
    const hasName = Object.prototype.hasOwnProperty.call(todoData, "title");

    if (!hasName) {
      errors.push("Title is required");
    } else if (hasName) {
      const { title } = todoData;
      if (typeof title !== "string") {
        errors.push("Title must be string");
      } else if (title.trim().length === 0){
        errors.push("Title cannot be empty or whitespace only");
      }  else if (title.length > 100) {
        errors.push("Title must be 100 characters or less");
      }
    }
  } else {
    if (Object.prototype.hasOwnProperty.call(todoData, "title")) {
      const { title } = todoData;
      if (typeof title !== "string") {
        errors.push("Title must be string");
      } else if (title.trim().length === 0){
        errors.push("Title cannot be empty or whitespace only");
      }  else if (title.length > 100) {
        errors.push("Title must be 100 characters or less");
      }
    }
  }
  

  if (Object.prototype.hasOwnProperty.call(todoData, "description")) {
    const { description } = todoData;
    if (description !== null && description !== undefined) {
      if (typeof description !== "string") {
        errors.push("Description must be a string");
      } else if (description.length > 500) {
        errors.push("Description must be 100 characters or less");
      }
    }
  }
  if (Object.prototype.hasOwnProperty.call(todoData, "completed")) {
    const {completed} = todoData;
    if (typeof completed !== "boolean") {
        errors.push("Completed must be a boolean");
    }
  }
  return { isValid: errors.length === 0, errors };  
}

/**
 * TodoServer Class - Main HTTP server for Todo API
 */
class TodoServer {
  constructor(port = 3000) {
    // TODO: Initialize server properties
    // 1. Set port number
    // 2. Initialize empty todos array
    // 3. Set nextId counter for new todos
    // 4. Initialize with sample data

    this.port = port;
    this.todos = [];
    this.nextId = 1;

    // Sample todos for testing
    this.initializeSampleData();
  }

  /**
   * Initialize server with sample todo data
   */
  initializeSampleData() {
    // TODO: Add sample todos for testing
    // 1. Create 2-3 sample todos with proper structure
    // 2. Include variety: completed/incomplete, different dates
    // 3. Set proper id sequence for new todos
    const now = new Date().toISOString();
    const sampleTodos = [
      { title : "Test 1",
        description: "Description of first todo",
        completed : false,
        createdAt : now,
        updatedAt : now
      },
      {
        title : "Test 2",
        description: "Description of second todo",
        completed : false,
        createdAt : now,
        updatedAt : now
      },
      {
        title : "Test 3",
        description: "Description of third todo",
        completed : false,
        createdAt : now,
        updatedAt : now
      }
    ];

    sampleTodos.forEach(element => {
      const id = this.generateNextId();
      this.todos.push({...element, id});

    });
  }

  /**
   * Start the HTTP server
   */
  start() {
    // TODO: Create and start HTTP server
    // 1. Create HTTP server with request handler
    // 2. Listen on specified port
    // 3. Log server startup message
    // 4. Handle server errors
    const server = http.createServer((req, res) => {
      return this.handleRequest(req, res);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
      }
    });
    const PORT = 3000;
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
    
  }

  /**
   * Main request handler - routes requests to appropriate methods
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   */
  async handleRequest(req, res) {
    // TODO: Implement main request routing
    // 1. Parse URL and extract pathname, query
    // 2. Route based on HTTP method and path pattern
    // 3. Handle CORS preflight requests (OPTIONS)
    // 4. Call appropriate handler method
    // 5. Handle unknown routes with 404
    console.log("handleRequest hit:", req.method, req.url);
    try {
      const parsedUrl = url.parse(req.url, true);
      const { pathname, query } = parsedUrl;
      const method = req.method;
      if (method === 'OPTIONS') {
        return this.handleCORS(req, res);
      }
      
      const param = parsePathParams('/todos/:id', pathname);
      if (param != null) {
        if (method === 'GET') {
          return await this.getTodoById(req, res, param);
        }
        if (method === 'PUT') {
          return await this.updateTodo(req, res, param);
        }
        if (method === 'DELETE') {
          return await this.deleteTodo(req, res, param);
        }
      }
      if (method === 'GET' && pathname === '/todos') {
        return await this.getAllTodos(req, res, query);
      }
      if (method === 'POST' && pathname === '/todos') {
        return await this.createTodo(req, res);
      }
      if (res.headersSent) return;
      return sendResponse(res, 404, {
        success: false,
        error: "Not Found",
        path: pathname,
        method,
      });
      // Route to appropriate handler based on method and path
      // GET /todos -> getAllTodos
      // GET /todos/:id -> getTodoById
      // POST /todos -> createTodo
      // PUT /todos/:id -> updateTodo
      // DELETE /todos/:id -> deleteTodo
      // OPTIONS -> handleCORS
    } catch (error) {
      console.error("Request handling error:", error);

      if (res.headersSent) {
        return res.end();
      }
      sendResponse(res, 500, {
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Handle GET /todos - Get all todos with optional filtering
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   * @param {Object} query - URL query parameters
   */
    async getAllTodos(req, res, query) {
      // TODO: Implement get all todos with filtering
      // 1. Get all todos from storage
      // 2. Apply completed filter if provided in query
      // 3. Return success response with data and count
      // 4. Handle query parameter validation
      let todoscur = this.todos;
      const { completed } = query ?? {};
      if (completed !== undefined) {
        if (completed !== "true" && completed !== "false") {
          return sendResponse(res, 400, {
            success: false,
            error: "Query parameter 'completed' must be 'true' or 'false'",
          });
        }

        const wantCompleted = completed === "true";
        todoscur = todoscur.filter((todo) => todo.completed === wantCompleted);
      }
      return sendResponse(res, 200, {
        success: true,
        data: todoscur,
        count: todoscur.length,
      });
    }

  /**
   * Handle GET /todos/:id - Get specific todo by ID
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   * @param {Object} params - Path parameters
   */
  async getTodoById(req, res, params) {
    // TODO: Implement get todo by ID
    // 1. Extract ID from path parameters
    // 2. Find todo in storage
    // 3. Return 404 if not found
    // 4. Return success response with todo data
    // 5. Handle invalid ID format
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return sendResponse(res, 400, { success: false, error: "Invalid todo id" });
    }
    const todo = this.todos.find(el => el.id === id);
    
    if (todo === undefined) {
      return sendResponse(res, 404, {
        success: false,
        error: "Todo Not Found",
      });
    } else {
      return sendResponse(res, 200, {
        success: true,
        data: todo,
      });
    }
  }

  /**
   * Handle POST /todos - Create new todo
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   */
  async createTodo(req, res) {
    // TODO: Implement create new todo
    // 1. Parse request body
    // 2. Validate todo data
    // 3. Create new todo with generated ID and timestamps
    // 4. Add to storage
    // 5. Return 201 with created todo
    // 6. Handle validation errors
    let parsedReqBody;
    try {
      parsedReqBody = await parseBody(req);
    } catch (err) {
      return sendResponse(res, 400, {
        success : false, error : err.message || "INVALID JSON BODY"
      });
    }
    const { isValid, errors } = validateTodo(parsedReqBody, false);
    if (!isValid) {
      return sendResponse(res, 400, {
        success : false, errors
      });
    }
    const now = new Date().toISOString();
    const newTodo = {
      id : this.generateNextId(),
      title : parsedReqBody.title.trim(),
      description: parsedReqBody.description ?? "",
      completed : parsedReqBody.completed ?? false,
      createdAt : now,
      updatedAt : now
    }
    this.todos.push(newTodo);
    return sendResponse(res, 201, {
      success: true,
      data: newTodo,
    });
  }

  /**
   * Handle PUT /todos/:id - Update existing todo
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   * @param {Object} params - Path parameters
   */
  async updateTodo(req, res, params) {
    // TODO: Implement update existing todo
    // 1. Extract ID from path parameters
    // 2. Find existing todo
    // 3. Parse request body
    // 4. Validate update data
    // 5. Merge changes with existing todo
    // 6. Update timestamp
    // 7. Return updated todo
    // 8. Handle not found and validation errors
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return sendResponse(res, 400, { success: false, error: "Invalid todo id" });
    }
    const todo = this.todos.find(el => el.id === id);
    if (todo === undefined) {
      return sendResponse(res, 404, {
        success: false,
        error: "Todo Not Found",
      });
    } else {
      let parsedReqBody;
      try {
        parsedReqBody = await parseBody(req);
      } catch (err) {
        return sendResponse(res, 400, {
          success : false, error : err.message || "INVALID JSON BODY"
        });
      }
      const { isValid, errors } = validateTodo(parsedReqBody, true);
      if (!isValid) {
        return sendResponse(res, 400, {
        success : false, errors
        });
      }
      let todoind = this.todos.findIndex(el => el.id === id);
      const now = new Date().toISOString();
      const existing = this.todos[todoind];
      const updated = {
        ...existing,
        updatedAt : now,
        ...(parsedReqBody.title !== undefined && {title: parsedReqBody.title.trim()}),
        ...(parsedReqBody.description !== undefined && { description: parsedReqBody.description }),
        ...(parsedReqBody.completed !== undefined && {completed: parsedReqBody.completed}),
        
      };
      this.todos[todoind] = updated;
      console.log("typeof body.description:", typeof parsedReqBody.description);
      console.log("body.description value:", JSON.stringify(parsedReqBody.description));
      console.log("typeof existing.description:", typeof existing.description);
      console.log("existing.description value:", JSON.stringify(existing.description));
      return sendResponse(res, 200, {
        success: true,
        data: this.todos[todoind],
      });
    }
  }

  /**
   * Handle DELETE /todos/:id - Delete todo
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   * @param {Object} params - Path parameters
   */
  async deleteTodo(req, res, params) {
    // TODO: Implement delete todo
    // 1. Extract ID from path parameters
    // 2. Find todo index in storage
    // 3. Return 404 if not found
    // 4. Remove from storage
    // 5. Return success message
    // 6. Handle invalid ID format
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return sendResponse(res, 400, { success: false, error: "Invalid todo id" });
    }
    const todo = this.todos.find(el => el.id === id);
    if (todo === undefined) {
      return sendResponse(res, 404, {
        success: false,
        error: "Todo Not Found",
      });
    } else {
      let todoind = this.todos.findIndex(el => el.id === id);
      const tododel = this.todos[todoind];
      this.todos = this.todos.filter(el => el.id != tododel.id);
      return sendResponse(res, 200, {
        success: true,
        message: "Succesful delete"
      });
    }
  }

  /**
   * Handle CORS preflight requests
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   */
  handleCORS(req, res) {
    // TODO: Implement CORS preflight handling
    // 1. Set CORS headers
    // 2. Return 204 No Content
    // 3. Handle preflight request properly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.writeHead(204);
    res.end();
  }

  /**
   * Find todo by ID in storage
   * @param {number|string} id - Todo ID
   * @returns {Object|null} Found todo or null
   */
  findTodoById(id) {
    // TODO: Implement find todo by ID
    // 1. Convert ID to number
    // 2. Search in todos array
    // 3. Return found todo or null
    // 4. Handle invalid ID format

    const numId = parseInt(id, 10);
    return null; // Placeholder
  }

  /**
   * Find todo index by ID in storage
   * @param {number|string} id - Todo ID
   * @returns {number} Todo index or -1 if not found
   */
  findTodoIndexById(id) {
    // TODO: Implement find todo index by ID
    // 1. Convert ID to number
    // 2. Find index in todos array
    // 3. Return index or -1 if not found

    const numId = parseInt(id, 10);
    return -1; // Placeholder
  }

  /**
   * Generate next available ID
   * @returns {number} Next ID
   */
  generateNextId() {
    // TODO: Implement ID generation
    // 1. Return current nextId
    // 2. Increment nextId for next use
    // 3. Handle edge cases

    return this.nextId++;
  }
}

// Export the TodoServer class
module.exports = TodoServer;

// Example usage (for testing):
const isReadyToTest = true;

if (isReadyToTest) {
  // Start server for testing
  const server = new TodoServer(3000);
  //server.start();

  console.log("🚀 Todo Server starting...");
  console.log("📝 Replace TODO comments with implementation");
  console.log("🧪 Run task-04-test.js to verify functionality");
}

// If this file is run directly, start the server
if (require.main === module) {
  const server = new TodoServer(3000);
  server.start();
}
