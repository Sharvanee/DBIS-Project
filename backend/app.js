const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
// const passport = require("./config/passport"); // Import the configured passport file
const passport = require("passport");
require("./config/passport");
// require("./config/passport"); // Ensure passport is configured
require("dotenv").config();
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: "test",
  host: "localhost",
  database: "cp",
  password: "test",
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Middleware
app.use(passport.initialize());
app.use(passport.session());

// Import and use auth routes
const authRoutes = require("./routes/auth");
app.use(authRoutes);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
// function isAuthenticated(req, res, next) {
//   if (!req.session.user) {
//     return res.status(400).json({ message: "Unauthorized" });
//   }
//   next();
// }

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const email_in_use = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (email_in_use.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Error: Email is already registered." });
    }

    const hashed_pwd = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
      [username, email, hashed_pwd]
    );

    res
      .status(200)
      .json({ username, email, message: "User Registered Successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error signing up" });
  }
});

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const correct_pwd = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!correct_pwd) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.user = {
      id: user.rows[0].user_id,
      username: user.rows[0].username,
      email: user.rows[0].email,
    };

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if (req.session.user) {
    return res
      .status(200)
      .json({ message: "Logged in", username: req.session.user.username });
  } else {
    return res.status(400).json({ message: "Not logged in" });
  }
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
});

////////////////////////////////////////////////////
// APIs for the products
// use correct status codes and messages mentioned in the lab document
// TODO: Fetch and display all products from the database
app.get("/list-products", isAuthenticated, async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM products");
    res.status(200).json({
      message: "Products fetched successfully",
      products_list: products.rows,
    });
  } catch (error) {
    console.error("Error listing products:", error);
    res.status(500).json({ message: "Error listing products" });
  }
});

// APIs for cart: add_to_cart, display-cart, remove-from-cart
// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const product_list = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );
    const product = product_list.rows[0];
    if (!product) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    if (quantity > product.stock_quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for ${product.name}." });
    }
    await pool.query(
      "INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = cart.quantity + $3",
      [req.session.user.id, product_id, quantity]
    );
    res.status(200).json({
      message:
        "Successfully added ${quantity} of ${product.name} to your cart.",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  try {
    const cart = await pool.query(
      `SELECT c.item_id as item_id,
      p.product_id as product_id,      
      p.name AS product_name,
      c.quantity,
      p.price as unit_price,
      CAST(c.quantity * p.price AS DECIMAL) AS total_item_price,
        p.stock_quantity
        FROM cart c
        JOIN products p ON c.item_id = p.product_id
        WHERE c.user_id = $1`,
      [req.session.user.id]
    );
    const cartItems = cart.rows;
    const result = await pool.query(
      `SELECT SUM(total_item_price) AS total_price 
         FROM (
           SELECT 
             p.name AS product_name, 
             p.price AS unit_price, 
             p.stock_quantity, 
             c.quantity, 
             CAST(c.quantity * p.price AS DECIMAL) AS total_item_price 
           FROM cart c 
           JOIN products p ON c.item_id = p.product_id 
           WHERE c.user_id = $1
         ) AS subquery`,
      [req.session.user.id]
    );

    const totalPrice = result.rows[0].total_price || 0;
    // const totalPrice = cartItems.reduce((total, item) => total + item.total_item_price, 0);
    // console.log("total price from backend", totalPrice)
    if (cartItems.length === 0) {
      return res
        .status(200)
        .json({ message: "No items in cart.", cart: [], totalPrice: 0 });
    }
    res.status(200).json({
      message: "Cart fetched successfully.",
      cart: cartItems,
      totalPrice,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  const { product_id } = req.body;
  console.log("product_id", product_id);
  try {
    const cartItem = await pool.query(
      "DELETE FROM cart WHERE user_id = $1 AND item_id = $2 RETURNING *",
      [req.session.user.id, product_id]
    );
    if (cartItem.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Item not present in your cart." });
    }
    res
      .status(200)
      .json({ message: "Item removed from your cart successfully." });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  const { product_id, quantity } = req.body;
  console.log("quantity", quantity);
  try {
    const new_quantity = quantity;
    const product = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );
    // console.log("prodid", product_id);
    // console.log("new_quantity", new_quantity);
    // console.log(product.rows);
    const available_quantity = product.rows[0].stock_quantity;
    // const item = await pool.query(
    //   "SELECT * FROM cart WHERE user_id = $1 AND item_id = $2",
    //   [req.session.user.id, product_id]
    // );
    // const new_quantity =
    //   item.rows.length > 0 ? item.rows[0].quantity + quantity : quantity;

    if (new_quantity > available_quantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available stock" });
    }
    if (new_quantity <= 0) {
      await pool.query("DELETE FROM cart WHERE user_id = $1 AND item_id = $2", [
        req.session.user.id,
        product_id,
      ]);
    } else {
      await pool.query(
        "INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = $3",
        [req.session.user.id, product_id, new_quantity]
      );
    }
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  const { address } = req.body;
  try {
    const cartItems = await pool.query(
      "SELECT c.item_id, p.product_id, p.name, c.quantity, p.stock_quantity, p.price FROM cart c JOIN products p ON c.item_id = p.product_id WHERE c.user_id = $1",
      [req.session.user.id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cartItems.rows) {
      if (item.quantity > item.stock_quantity) {
        return res
          .status(400)
          .json({ message: "Insufficient stock for ${item.name}" });
      }
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const totalAmount = cartItems.rows.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const order = await client.query(
        "INSERT INTO orders (user_id, order_date, total_amount) VALUES ($1, NOW(), $2) RETURNING order_id",
        [req.session.user.id, totalAmount]
      );
      const orderId = order.rows[0].order_id;

      for (const item of cartItems.rows) {
        await client.query(
          "INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
          [orderId, item.product_id, item.quantity, item.price]
        );
        await client.query(
          "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2",
          [item.quantity, item.product_id]
        );
      }

      await client.query(
        "INSERT INTO orderaddress (order_id, street, city, state, pincode) VALUES ($1, $2, $3, $4, $5)",
        [orderId, address.street, address.city, address.state, address.pincode]
      );

      await client.query("DELETE FROM cart WHERE user_id = $1", [
        req.session.user.id,
      ]);
      await client.query("COMMIT");
      res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error placing order:", error);
      res.status(500).json({ message: "Error placing order" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Error placing order" });
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  try {
    const order = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC LIMIT 1",
      [req.session.user.id]
    );

    if (order.rows.length === 0) {
      return res.status(400).json({ message: "Order not found" });
    }

    const orderItems = await pool.query(
      `SELECT o.order_id, 
        o.product_id,
        o.quantity,
        o.price,
        p.name AS product_name
      FROM orderitems o
      JOIN products p
      ON o.product_id = p.product_id
      WHERE o.order_id = $1`,
      [order.rows[0].order_id]
    );

    // const result = await pool.query(
    //   `SELECT total_amount from orders where order_id = $1`,
    //   [req.session.user.id]
    // );

    // const totalAmount = result.rows[0].total_price || 0;
    // console.log("totalAmount", totalAmount);

    // const totalAmount = orderItems.rows.reduce(
    //   (total, item) => total + item.price * item.quantity,
    //   0
    // );

    res.status(200).json({
      message: "Order fetch successfully",
      order: order.rows,
      orderItems: orderItems.rows,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Error fetching order details" });
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/problem-set", async (req, res) => {
  const problems = await pool.query("Select p.id,p.title,p.difficulty from problems p join problem_tags pt on p.id = pt.problem_id join tags t on t.id = pt.tag_id");
    res.json(problems);
});

app.get("/problem/:id", async (req, res) => {
  const problemId = req.params.id;
  const problem = await pool.query("Select title,difficulty,description from problems where id = $1", [problemId]);
  const tags = await pool.query("Select tag.name from tags tag join problem_tags ptag on ptag.problem_id = $1 and tag.id = ptag.tag_id", [problemId]);
  res.json({
    title: problem.rows[0].title,
    difficulty: problem.rows[0].difficulty,
    description: problem.rows[0].description,
    tags: tags.rows.map(tag => tag.name)
  })
});

app.get("/contests", async (req, res) => {
  const contests = await pool.query("Select * from contests");
    res.json(contests);
});

app.get("/contest/:id", async (req, res) => {
  const contestId = req.params.id;
  const contest = await pool.query("Select * from contests where id = $1", [contestId]);
  const problems = await pool.query("Select psp.problem_id, p.title, p.difficulty from problem_set_problems psp join contests c on psp.problem_set_id = c.id join problems p on p.id = psp.problem_id where c.id = $1", [contestId]);
  
  if(contest.rows.length === 0) {
    return res.status(404).json({ message: "Contest not found" });
  }

  res.json({
    title: contest.rows[0].title,
    start_time: contest.rows[0].start_time,
    problems: problems.rows.map(problem => ({
      id: problem.problem_id,
      title: problem.title,
      difficulty: problem.difficulty
    }))
  });
});

app.get("/profile",(req,res) => {
  const user = req.session.user.id;
  const user_profile = null; // fetch the data for user with id user from db
    res.json(user_profile);
})


app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  app.get("/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "http://localhost:3000/dashboard", // Redirect after success
      failureRedirect: "http://localhost:3000/login", // Redirect after failure
    })
  );
  