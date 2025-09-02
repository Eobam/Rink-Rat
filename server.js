const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // default XAMPP MySQL user
  password: "",       // leave blank unless you set a root password
  database: "signupDB"
});

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL database!");
});

// Signup route
app.post("/signup", (req, res) => {
  const { email, psw } = req.body;
  const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
  db.query(sql, [email, psw], (err) => {
    if (err) throw err;
    res.send("User registered successfully!");
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});