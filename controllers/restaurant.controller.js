// restaurant.controller.js
const RestaurantModel = require("../models/Restaurant.model");

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

    const restaurants = await RestaurantModel.find(query);
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
    const newRestaurant = new RestaurantModel({
      name: req.body.name,
      address: req.body.address,
      contact: req.body.contact,
      location: req.body.location,
      rating: req.body.rating,
      offers: req.body.offers,
      cuisines: req.body.cuisines.split(","), // assuming comma-separated input
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRestaurantsByFilters, postRestaurants };
