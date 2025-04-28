// index.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const aiRoutes = require("./routes/aiRoutes");
const cors = require("cors");
const fs = require("fs");
const Restaurant = require("./models/Restaurant.model");

require("dotenv").config();

// create a express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/auth"));
const restaurantRoutes = require("./routes/restaurant.route");
app.use("/api/ai", aiRoutes);
app.use("/api", restaurantRoutes);
// Connect to mongodb using mongoose

// Export data to JSON file
async function exportDataToJson() {
  try {
    const restaurants = await Restaurant.find({}); // Get all restaurant data
    fs.writeFileSync(
      "./data/restaurants.json",
      JSON.stringify(restaurants, null, 2)
    );
    console.log("Data exported successfully");
  } catch (err) {
    console.error("Error exporting data: ", err);
  }
}


// Please use process.env.MONGO_URL instead of my mongodb url
mongoose
  .connect(process.env.MONGO_URL, {
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
  })
  .then(() => {
    exportDataToJson();
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
