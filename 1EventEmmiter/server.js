const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const EventEmitter = require("events");
const path = require("path");

const app = express();
const shopEvents = new EventEmitter();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Data store ────────────────────────────────────────────────
let users = [];
let carts = {};      // { email: [{ id, name, price, qty }] }
let orders = {};     // { email: [ order ] }
let eventLog = [];   // last 50 events shown in UI

const products = [
  { id: 1, name: "Wireless Headphones", price: 2000, emoji: "🎧", category: "Electronics" },
  { id: 2, name: "Smart Watch",          price: 5000, emoji: "⌚", category: "Electronics" },
  { id: 3, name: "Running Shoes",        price: 3000, emoji: "👟", category: "Fashion"     },
  { id: 4, name: "Sunglasses",           price: 1500, emoji: "🕶️", category: "Fashion"     },
  { id: 5, name: "Backpack",             price: 2500, emoji: "🎒", category: "Accessories" },
  { id: 6, name: "Water Bottle",         price: 800,  emoji: "🍶", category: "Accessories" },
];

// ── Event logging ────────────────────────────────────────────
function logEvent(type, message) {
  const entry = { type, message, time: new Date().toLocaleTimeString() };
  eventLog.unshift(entry);
  if (eventLog.length > 50) eventLog.pop();
  shopEvents.emit(type, entry);
}

// ── Auth ─────────────────────────────────────────────────────
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields required" });
  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "Email already registered" });

  users.push({ username, email, password });
  carts[email] = [];
  orders[email] = [];
  logEvent("register", `New user registered: ${username}`);
  res.json({ message: "Registered successfully", username });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  logEvent("login", `${user.username} logged in`);
  res.json({ message: "Login successful", username: user.username, email: user.email });
});

// ── Products ──────────────────────────────────────────────────
app.get("/products", (req, res) => {
  res.json(products);
});

// ── Cart ──────────────────────────────────────────────────────
app.get("/cart", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });
  res.json(carts[email] || []);
});

app.post("/cart", (req, res) => {
  const { email, productId } = req.body;
  if (!email || !productId)
    return res.status(400).json({ message: "Email and productId required" });

  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (!carts[email]) carts[email] = [];
  const existing = carts[email].find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    carts[email].push({ ...product, qty: 1 });
  }

  logEvent("cart", `Item added to cart: ${product.name}`);
  res.json({ message: "Added to cart", cart: carts[email] });
});

app.patch("/cart", (req, res) => {
  const { email, productId, delta } = req.body;
  if (!carts[email]) return res.status(400).json({ message: "No cart found" });

  const item = carts[email].find(i => i.id === productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  item.qty += delta;
  if (item.qty <= 0) carts[email] = carts[email].filter(i => i.id !== productId);

  res.json({ message: "Cart updated", cart: carts[email] });
});

app.delete("/cart", (req, res) => {
  const { email, productId } = req.body;
  if (!carts[email]) return res.status(400).json({ message: "No cart" });
  carts[email] = carts[email].filter(i => i.id !== productId);
  res.json({ message: "Removed", cart: carts[email] });
});

// ── Checkout ─────────────────────────────────────────────────
app.post("/checkout", (req, res) => {
  const { email } = req.body;
  if (!carts[email] || carts[email].length === 0)
    return res.status(400).json({ message: "Cart is empty" });

  const total = carts[email].reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id: `ORD-${Date.now()}`,
    items: [...carts[email]],
    total,
    date: new Date().toLocaleString(),
  };

  if (!orders[email]) orders[email] = [];
  orders[email].unshift(order);
  carts[email] = [];

  logEvent("order", `Order placed: ${order.id} — ₹${total.toLocaleString()}`);
  res.json({ message: "Order placed", order });
});

// ── Orders ────────────────────────────────────────────────────
app.get("/orders", (req, res) => {
  const { email } = req.query;
  res.json(orders[email] || []);
});

// ── Event log ─────────────────────────────────────────────────
app.get("/events", (req, res) => {
  res.json(eventLog);
});

// ── Start ─────────────────────────────────────────────────────
app.listen(3000, () => console.log("Server running → http://localhost:3000"));
