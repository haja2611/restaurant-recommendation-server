const fs = require("fs");
const Restaurant = require("../models/Restaurant.model");

const exportDataToJson = async () => {
  try {
    const restaurants = await Restaurant.find({});
    fs.writeFileSync(
      "./data/restaurants.json",
      JSON.stringify(restaurants, null, 2)
    );
    console.log("Data exported successfully");
  } catch (err) {
    console.error("Error exporting data: ", err);
  }
};

module.exports = exportDataToJson;
