require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const pool = require("./config/db");

pool.query("SELECT 1")
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch(err => console.error("PostgreSQL connection failed", err));

pool.query("SELECT current_database() AS db, current_schema() AS schema")
  .then(r => console.log("CONNECTED TO:", r.rows[0]))
  .catch(console.error);

pool.query("SELECT to_regclass('public.users') AS users")
  .then(r => console.log("TABLE CHECK:", r.rows[0]))
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server running on: http://localhost:${PORT}`);
});
