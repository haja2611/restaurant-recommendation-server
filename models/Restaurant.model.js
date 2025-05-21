const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    contact: String,
    location: String,
    rating: Number,
    averageRating: {
      type: Number,
      default: 0,
    },
    offers: Boolean,
    cuisines: [String],
    image: String,

    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    ambiences: [String],
    nutrients: [String], // e.g., ["low calorie", "nutfree"]
    dining: [String], // e.g., ["indoor", "outdoor"]
    weatherPreference: [String], // e.g., ["cold", "summerlike"]
    timing: [String], // e.g., ["lunch", "dinner"]
    transport: [String], // e.g., ["bus", "railway"]

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
      },
    ],
  },
  { timestamps: true }
);

// Ensures same lat/long combo cannot be used twice
restaurantSchema.index({ latitude: 1, longitude: 1 }, { unique: true });

module.exports = mongoose.model("restaurant", restaurantSchema);
