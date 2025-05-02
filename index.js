// index.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const aiRoutes = require("./routes/aiRoutes");
const cors = require("cors");
const restaurantRoutes = require("./routes/restaurant.route");
require("dotenv").config();
const cookieParser = require("cookie-parser");

// create a express app
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ai", aiRoutes);
app.use("/api", restaurantRoutes);
app.use("/user-profile", express.static("user-profile"));
app.use("/api/user", require("./routes/user.routes"));
// Connect to mongodb using mongoose

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    // exportDataToJson();
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB", error);
  });

app.get("/health", (req, res) => {
  res.status(200).json("Server is up and running");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
