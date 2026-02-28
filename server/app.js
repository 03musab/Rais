const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (The Client)
app.use(express.static(path.join(__dirname, "../client")));

// Routes
app.use("/api/contact", require("./routes/contact.routes"));
app.use("/api/reviews", require("./routes/review.routes"));

// Fallback Route (Serve index.html for any other request)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
