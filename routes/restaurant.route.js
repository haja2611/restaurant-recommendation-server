//restaurant.route.js

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getRestaurantsByFilters,
  postRestaurants,
  addReview,
  getAllRestaurants,
  editRestaurant,
  deleteRestaurant,
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
router.post("/restaurants", auth, upload.single("image"), postRestaurants); // for uploading a new restaurant
router.post("/restaurants/addReview", auth, addReview);
router.get("/restaurants/all", getAllRestaurants);
router.put("/restaurant/edit/:id", auth, editRestaurant);
router.delete("/restaurant/delete/:id", auth, deleteRestaurant);
module.exports = router;
