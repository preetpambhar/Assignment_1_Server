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

// Define product schema
const productSchema = new mongoose.Schema({
  img: String,
  title: String,
  star: String, // Assuming you want to store the star as a string
  reviews: String,
  prevPrice: String,
  newPrice: String,
  company: String,
  color: String,
  category: String,
  shipping_cost: Number,
});
const Product = mongoose.model("Product", productSchema);

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

// Create a new product
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a product by ID
app.patch("/products/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "img",
    "title",
    "star",
    "reviews",
    "prevPrice",
    "newPrice",
    "company",
    "color",
    "category",
    "shipping_cost",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Port is set to 5000
const PORT = process.env.PORT || 5000;
app.listen(5000, function () {
  console.log("App is listening on port 5000! Go to http://localhost:5000/");
});
