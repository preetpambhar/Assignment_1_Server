const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  "mongodb+srv://preetpambhar:preetpambhar11032001@preetproject.kxozdrj.mongodb.net/web-finalproject?retryWrites=true&w=majority"
);

// User Schema and Model
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  shipping_address: String,
});

const User = mongoose.model("User", userSchema);
// User routes

// Sign Up new user
app.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User inserted successfully");
  } catch (error) {
    res.status(500).send("Error inserting user");
  }
});

// Fetch all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

// Sign in user by email & password
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (password !== user.password) {
      return res.status(401).send("Incorrect password");
    }

    // If both email and password are correct, return success
    res.send("Sign in successful");
  } catch (error) {
    res.status(500).send("Error signing in");
  }
});

// Port is set to 5000
const PORT = process.env.PORT || 5000;
app.listen(5000, function () {
  console.log("App is listening on port 5000! Go to http://localhost:5000/");
});
