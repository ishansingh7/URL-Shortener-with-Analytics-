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

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/url", require("./routes/urlRoutes"));
app.get("/:shortCode", redirectToOriginalUrl);

/* Server */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
