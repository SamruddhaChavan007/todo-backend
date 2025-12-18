const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {listTodos, createTodo, updateTodo, deleteTodo} = require("../controllers/todoController")

const router = express.Router();

// All routes below REQUIRE authentication
router.use(requireAuth);

router.get("/", listTodos);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;