const pool = require("../config/db");

async function listTodos(req, res, next) {
  const userId = req.userId;

  try {
    const limit = req.query.limit ?? 50;
    const offset = req.query.offset ?? 0;
    const isDone = req.query.is_done;
    const sort = req.query.sort ?? "created_at";
    const order =
      (req.query.order ?? "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    const sortCol = ["created_at", "updated_at", "title"].includes(sort)
      ? sort
      : "created_at";

    const params = [userId];
    let whereClause = "WHERE user_id = $1";

    if (typeof isDone === "boolean") {
      params.push(isDone);
      whereClause += ` AND is_done = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);

    const result = await pool.query(
      `
      SELECT id, title, description, is_done, created_at, updated_at
      FROM tasks
      ${whereClause}
      ORDER BY ${sortCol} ${order}
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
      `,
      params
    );

    return res.status(200).json({
      todos: result.rows,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
}

async function createTodo(req, res, next) {
    const userId = req.userId;
    const { title, description } = req.body;

    if(!title || title.trim() === ""){
        return res.status(400).json({ error: "Title is required "});
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO tasks (user_id, title, description)
            VALUES ($1, $2, $3)
            RETURNING id, title, description, is_done, created_at, updated_at
            `,
            [userId, title, description || null]
        );

        res.status(201).json({
            todo: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
}

async function updateTodo(req, res, next) {
  const userId = req.userId;
  const todoId = Number(req.params.id);
  const { title, description, is_done } = req.body;

  if (!Number.isInteger(todoId)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  if (typeof is_done !== "boolean") {
    return res.status(400).json({ error: "is_done must be boolean" });
  }

  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1,
          description = $2,
          is_done = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
        AND user_id = $5
      RETURNING id, title, description, is_done, created_at, updated_at
      `,
      [title.trim(), description || null, is_done, todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.status(200).json({ todo: result.rows[0] });
  } catch (error) {
    console.error("updateTodo error:", error);
    next(error);
  }
}

async function deleteTodo(req, res, next) {
  const userId = req.userId;
  const todoId = Number(req.params.id);

  if (!Number.isInteger(todoId)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    return res.status(200).json({
      deleted: true,
      id: result.rows[0].id
    });
  } catch (error) {
    console.error("deleteTodo error:", error);
    next(error);
  }
}

module.exports = {listTodos, createTodo, updateTodo, deleteTodo}