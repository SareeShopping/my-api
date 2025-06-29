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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
