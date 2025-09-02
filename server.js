const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));


require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});


db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL database!");
});


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

const bcrypt = require("bcrypt");


app.post("/signup", async (req, res) => {
  const { email, psw } = req.body;

  try {
    
    const hashedPassword = await bcrypt.hash(psw, 10);

    
    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error saving user");
        } else {
          res.send("User registered successfully (with hashed password)!");
        }
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/login", (req, res) => {
  const { email, psw } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = results[0];

    // compare given password with hashed password in DB
    const match = await bcrypt.compare(psw, user.password);
    if (match) {
      res.send("Login successful!");
    } else {
      res.status(400).send("Invalid password");
    }
  });
});