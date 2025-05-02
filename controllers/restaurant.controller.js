// restaurant.controller.js
const RestaurantModel = require("../models/Restaurant.model");
const exportDataToJson = require("../utils/exportToJson");
const User = require("../models/User"); // or wherever your user model file is
const fs = require("fs");
const path = require("path");
// GET API - Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await RestaurantModel.find();
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRestaurantsByFilters = async (req, res) => {
  console.log("request body is", req.body);
  try {
    const { location, rating, cuisines } = req.body;
    const query = {};
    if (location) {
      query.location = location;
    }

    if (rating?.length > 0) {
      if (rating == 3) {
        query.rating = { $gte: 3, $lte: 5 };
      } else {
        query.rating = { $gte: 4, $lte: 5 };
      }
    }

    if (cuisines?.length > 0) {
      query.cuisines = { $in: cuisines };
    }

    const restaurants = await RestaurantModel.find(query).populate(
      "reviews.user",
      "name avatar"
    );
    if (restaurants.length > 0) {
      res.json({ success: true, data: restaurants });
    } else {
      res.json({ success: false, message: "No such data found!" });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// POST API - Add restaurant with image
const postRestaurants = async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      location,
      rating,
      offers,
      cuisines,
      latitude,
      longitude,
      nutrients,
      dining,
      weatherPreference,
      timing,
      transport,
    } = req.body;
    const userId = req.user.id;
    const newRestaurant = new RestaurantModel({
      name,
      address,
      contact,
      location,
      offers,
      cuisines: cuisines?.split(","),
      latitude,
      longitude,
      nutrients: nutrients?.split(","),
      dining: dining?.split(","),
      weatherPreference: weatherPreference?.split(","),
      timing: timing?.split(","),
      transport: transport?.split(","),
      image: req.file ? `/uploads/${req.file.filename}` : "",
      createdBy: userId,
    });

    await newRestaurant.save();
    exportDataToJson();
    res.status(201).json({ success: true, data: newRestaurant });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Restaurant already exists at this lat/long.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateAverageRating = async (restaurantId) => {
  const restaurant = await RestaurantModel.findById(restaurantId);
  const total = restaurant.reviews.reduce((sum, r) => sum + r.rating, 0);
  const avg =
    restaurant.reviews.length > 0 ? total / restaurant.reviews.length : 0;

  restaurant.averageRating = avg.toFixed(1);
  await restaurant.save();
};

const addReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;
    const userId = req.user.id;
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    // Check if the user has already reviewed
    const existingReviewIndex = restaurant.reviews.findIndex(
      (r) => r.user.toString() === userId.toString()
    );
    if (existingReviewIndex !== -1) {
      // Update existing review
      restaurant.reviews[existingReviewIndex].rating = rating;
      restaurant.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      restaurant.reviews.push({ user: userId, rating, comment });
    }

    await restaurant.save();
    await updateAverageRating(restaurantId);
    await exportDataToJson();

    res.status(201).json({ success: true, message: "Review added" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const editRestaurant = async (req, res) => {
  try {
    const { id } = req.params; // Restaurant ID
    const userId = req.user.id; // From your auth middleware

    const restaurant = await RestaurantModel.findById(id);

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // Check if the logged-in user is the creator
    if (restaurant.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this restaurant",
      });
    }

    // Update allowed fields
    const updatedData = {
      ...req.body,
      cuisines: req.body.cuisines?.split(","),
      nutrients: req.body.nutrients?.split(","),
      dining: req.body.dining?.split(","),
      weatherPreference: req.body.weatherPreference?.split(","),
      timing: req.body.timing?.split(","),
      transport: req.body.transport?.split(","),
    };

    // If a new image is uploaded
    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const updatedRestaurant = await RestaurantModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    await exportDataToJson();
    res.status(200).json({ success: true, data: updatedRestaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params; // Restaurant ID
    const userId = req.user.id; // From your auth middleware

    const restaurant = await RestaurantModel.findById(id);

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // Check if the logged-in user is the creator
    if (restaurant.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this restaurant",
      });
    }
    // Delete image from folder
    if (restaurant.image) {
      const imagePath = path.join(__dirname, "..", restaurant.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image file:", err.message);
        }
      });
    }
    await RestaurantModel.findByIdAndDelete(id);
    await exportDataToJson();
    res
      .status(200)
      .json({ success: true, message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRestaurantsByFilters,
  postRestaurants,
  addReview,
  getAllRestaurants,
  editRestaurant,
  deleteRestaurant,
};
