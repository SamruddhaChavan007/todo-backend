const { z } = require("zod")


const createTodoSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(2000).optional().nullable(),
});

const updateTodoSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(2000).optional().nullable(),
    is_done: z.boolean(),
});

const listTodoSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    is_done: z
    .enum(["true", "false"])
    .transform(v => v === "true")
    .optional(),
    sort: z.enum(["created_at", "updated_at", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
});

module.exports = { createTodoSchema, updateTodoSchema, listTodoSchema };