const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { validateBody, validateQuery } = require("../middleware/validate");
const {listTodos, createTodo, updateTodo, deleteTodo} = require("../controllers/todoController")
const { createTodoSchema, updateTodoSchema, listTodoSchema } = require("../validators/todoSchemas");

const router = express.Router();

// All routes below REQUIRE authentication
router.use(requireAuth);

router.get("/", validateQuery(listTodoSchema), listTodos);
router.post("/", validateBody(createTodoSchema), createTodo);
router.put("/:id", validateBody(updateTodoSchema), updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;