const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes")
const todoRoutes = require("./routes/todoRoutes")
const authMiddleware = require("./middleware/requireAuth")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (req, res) => {
  res.status(200).send("Todo Backend is running");
});

app.use("/auth", authRoutes)
app.use("/todos", todoRoutes)


module.exports = app;
