const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML files (for your signup.html, etc.)
app.use(express.static('.'));

// MySQL database connection (XAMPP settings)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "nuhuhbro",    // Replace with your actual MySQL password
  database: "signupDB"               // Your database name
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
  console.log("✅ Connected to MySQL database (signupDB)!");
});

// Helper function to find user by email
const findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};

// Signup route
app.post("/signup", async (req, res) => {
  const { email, psw } = req.body;
  
  try {
    // Check if user already exists
    findUserByEmail(email, async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Database error");
      }
      
      if (results.length > 0) {
        return res.status(400).send("User already exists");
      }
      
      // Hash the password
      const hashedPassword = await bcryptjs.hash(psw, 10);
      
      // Insert new user into database
      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error saving user");
          } else {
            res.send("User registered successfully!");
            console.log(`New user registered: ${email}`);
          }
        }
      );
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login route
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
    
    try {
      // Compare password with hashed password
      const match = await bcryptjs.compare(psw, user.password);
      if (match) {
        res.send("Login successful!");
        console.log(`User logged in: ${email}`);
      } else {
        res.status(400).send("Invalid password");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
});

// Optional: API route to get all users (for testing)
app.get("/api/users", (req, res) => {
  db.query("SELECT id, email FROM users", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Visit http://localhost:${port}/signup.html for signup page`);
});