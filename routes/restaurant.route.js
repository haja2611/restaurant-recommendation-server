//restaurant.route.js

const express = require("express");
const router = express.Router();

const {
  getRestaurantsByFilters,
  postRestaurants,
} = require("../controllers/restaurant.controller");
const multer = require("multer");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// router.route("/restaurants").post(getRestaurantsByFilters);
// router.route("/restaurants").post(postRestaurants);
router.post("/restaurants/filter", getRestaurantsByFilters); // for filtering
router.post("/restaurants", upload.single("image"), postRestaurants); // for uploading a new restaurant

module.exports = router;
