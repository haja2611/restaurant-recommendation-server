const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // const payload = { user: { id: user.id } };
    // jwt.sign(
    //   payload,
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" },
    //   (err, token) => {
    //     if (err) throw err;
    //     res.json({ token });
    //   }
    // );
    res.json({ message: "Register successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {
          httpOnly: true,
          secure: false, // only over HTTPS
          sameSite: "Lax", // or 'Lax'
          maxAge: 3600000, // 1 hour
        });
        res.json({ message: "Login successful" });
        console.log("Token: ", token);
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/toggleFavoriteRestaurant", auth, async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const userId = req.user.id; // get from auth middleware

    const user = await User.findById(userId);

    const isFavorite = user.favorites.includes(restaurantId);

    if (isFavorite) {
      // remove from favorites
      user.favorites.pull(restaurantId);
    } else {
      // add to favorites
      user.favorites.push(restaurantId);
    }

    await user.save();
    res.json({
      success: true,
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/getFavorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json({ success: true, data: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;
