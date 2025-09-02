const express = require("express");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static HTML files (for your signup.html, etc.)
app.use(express.static('.'));

// In-memory storage for users (replaces MySQL)
let users = [];

// Helper function to find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

console.log("✅ Server ready with in-memory storage!");

app.post("/signup", async (req, res) => {
  const { email, psw } = req.body;
  
  try {
    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(400).send("User already exists");
    }
    
    // Hash the password
    const hashedPassword = await bcryptjs.hash(psw, 10);
    
    // Add user to in-memory storage
    users.push({
      id: users.length + 1,
      email: email,
      password: hashedPassword
    });
    
    res.send("User registered successfully!");
    console.log(`New user registered: ${email}`);
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/login", async (req, res) => {
  const { email, psw } = req.body;

  try {
    // Find user by email
    const user = findUserByEmail(email);
    
    if (!user) {
      return res.status(400).send("User not found");
    }
    
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

// Optional: Route to see all users (for testing)
app.get("/users", (req, res) => {
  // Return users without passwords for security
  const safeUsers = users.map(user => ({
    id: user.id,
    email: user.email
  }));
  res.json(safeUsers);
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});