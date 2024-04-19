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
  star: Number, // Assuming you want to store the star as a string
  reviews: String,
  prevPrice: String,
  newPrice: String,
  company: String,
  color: String,
  category: String,
  shipping_cost: Number,
});
const Product = mongoose.model("Product", productSchema);

// Cart Schema and Model
const cartSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Cart = mongoose.model("Cart", cartSchema);

// Order Schema and Model
const orderSchema = new mongoose.Schema({
  items: {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_date: { type: Date, default: Date.now },
  },
});

const Order = mongoose.model("Order", orderSchema);

// User routes
// Sign Up new user
app.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User Created successfully");
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
    delete user.password;
    const response = { ...user.toJSON(), userId: user._id };
    delete response._id;

    // If both email and password are correct, return success
    res.status(200).json({ message: "Sign in successful", data: response });
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

// Create a new cart
app.post("/carts", async (req, res) => {
  try {
    const { product_id, quantity, user_id } = req.body;
    const cart = new Cart({ product_id, quantity, user_id });
    await cart.save();
    res.send("Cart created successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get Cart
app.get("/carts/user/:id", async (req, res) => {
  try {
    const carts = await Cart.find({ user_id: req.params.id });
    if (!carts) {
      res.status(404).send("User not found");
      return;
    }
    res.json(carts);
  } catch (error) {
    res.status(500).send("Error fetching user");
  }
});

//Get Cart with product
app.get("/carts/:id", async (req, res) => {
  try {
    const cart = await Cart.find().populate("product_id");
    // const cart = await Cart.findById(req.params.id); //.populate("prod_id");
    if (!cart) {
      res.status(404).send(req.params.id);
      return;
    }
    res.json(cart);
  } catch (error) {
    res.status(500).send("Error fetching cart");
  }
});

// Update cart by ID
app.put("/carts/:id", async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCart) {
      res.status(404).send("Cart not found");
      return;
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cart by ID
app.delete("/carts/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.send("Cart deleted successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new order
// app.post("/orders", async (req, res) => {
//   try {
//     const { products } = req.body;

//     // Find the corresponding cart item
//     const cartItem = await Cart.findOne({ product_id, user_id });

//     // Check if the cart item exists
//     if (!cartItem) {
//       return res.status(404).json({ message: "Cart item not found" });
//     }

//     // Check if the requested quantity is less than or equal to the quantity in the cart
//     if (quantity <= cartItem.quantity) {
//       // Reduce the quantity in the cart
//       cartItem.quantity -= quantity;

//       // Save the updated cart item
//       await cartItem.save();
//     } else {
//       // If the requested quantity is greater than the quantity in the cart,
//       // delete the cart item
//       await cartItem.remove();
//     }

//     // Create a new order
//     const order = new Order({ product_id, quantity, user_id });
//     await order.save();

//     // Send response with the ID of the newly created order
//     res.status(201).json({
//       message: "Order created successfully",
//       order_id: order._id, // Access the ID of the newly created order
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.post("/orders", async (req, res) => {
  try {
    const orderItems = [];
    let cartNotExist = false;
    const orderPromises = req.body.map(
      async ({ product_id, quantity, user_id, cart_id }) => {
        // Find the corresponding cart item
        const cartItem = await Cart.findById(cart_id);
        console.log("cartItem: ", cartItem);
        // Check if the cart item exists
        if (!cartItem) {
          cartNotExist = true;
        } else {
          // Remove from the cart
          await Cart.findOneAndDelete(cart_id);

          // Create a new order
          orderItems.push({ product_id, quantity, user_id });
        }
        // const order = new Order({ product_id, quantity, user_id });
        // await order.save();

        // // Return the ID of the newly created order
        // return order._id;
      }
    );
    await Promise.all(orderPromises);
    console.log("cartNotExist", cartNotExist);
    console.log("orderItems", orderItems);
    if (cartNotExist) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // create a order
    let order = {};
    if (orderItems.length > 0) {
      order = new Order({ items: orderItems });
    }

    // Send response with the IDs of the newly created orders
    res.status(201).json({
      message: "Orders created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all orders by user ID
app.get("/orders/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.find({ user_id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // Update order by ID
// app.put("/orders/:id", async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedOrder) {
//       res.status(404).send("Order not found");
//       return;
//     }
//     res.json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Delete order by ID
app.delete("/orders/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      res.status(404).send("Order not found");
      return;
    }
    res.send("Order deleted successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Port is set to 5000
const PORT = process.env.PORT || 5000;
app.listen(5000, function () {
  console.log("App is listening on port 5000! Go to http://localhost:5000/");
});
