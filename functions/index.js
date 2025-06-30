const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// 🔐 Load secrets from environment
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ POST
app.post("/items", async (req, res) => {
  try {
    const docRef = await db.collection("items").add(req.body);
    res.status(201).json({ id: docRef.id, message: "Item added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET
app.get("/items", async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT
app.put("/items/:id", async (req, res) => {
  try {
    await db.collection("items").doc(req.params.id).update(req.body);
    res.status(200).json({ message: "Item updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE
app.delete("/items/:id", async (req, res) => {
  try {
    await db.collection("items").doc(req.params.id).delete();
    res.status(200).json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  const { name, phone, age, gender, username, password, confirmPassword } = req.body;
  if (!name || !phone || !age || !gender || !username || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }
  try {
    // Check if username already exists
    const userSnap = await db.collection("users").where("username", "==", username).get();
    if (!userSnap.empty) {
      return res.status(400).json({ error: "Username already taken." });
    }
    // Store user (password in plaintext for demo; use hashing in production!)
    await db.collection("users").add({ name, phone, age, gender, username, password });
    res.status(201).json({ message: "Registration successful." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }
  try {
    const userSnap = await db.collection("users").where("username", "==", username).where("password", "==", password).get();
    if (userSnap.empty) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    // Optionally return user info (not password)
    const user = userSnap.docs[0].data();
    delete user.password;
    res.status(200).json({ message: "Login successful.", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
