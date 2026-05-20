const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

const connectDB = require("./config/db");
const { redirectToOriginalUrl } = require("./controllers/urlController");

dotenv.config();

connectDB();

const app = express();

/* Middleware */

app.use(cors());

app.use(express.json());

/* Routes */

app.get("/", (req, res) => {
  res.json({ message: "URL Shortener API is running", status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/url", require("./routes/urlRoutes"));
app.get("/:shortCode", redirectToOriginalUrl);

/* Error Handling */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
});

/* Server */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
