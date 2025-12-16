require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const pool = require("./config/db");

pool.query("SELECT 1")
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch(err => console.error("PostgreSQL connection failed", err));


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server running on: http://localhost:${PORT}`);
});
