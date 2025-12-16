const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (req, res) => {
  res.status(200).send("Todo Backend is running");
});


module.exports = app;
