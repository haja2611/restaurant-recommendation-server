const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "user-profile/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// GET user
router.get("/get-user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
    console.log(user);
  } catch (error) {
    console.log("Get user details error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE avatar or name
router.post(
  "/update-avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const user = await User.findById(userId);

      // Delete old avatar if it exists
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, "..", user.avatar);
        fs.unlink(oldAvatarPath, (err) => {
          if (err) console.log("Failed to delete old avatar:", err);
        });
      }

      const newAvatarPath = `/user-profile/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: newAvatarPath },
        { new: true }
      );

      res.json(updatedUser);
    } catch (error) {
      console.error("Avatar update failed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
// DELETE avatar only
router.delete("/remove-avatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Delete file from system
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      fs.unlink(oldAvatarPath, (err) => {
        if (err) console.log("Failed to delete avatar:", err);
      });
    }

    // Update user in DB
    user.avatar = "";
    await user.save();

    res.json(user);
  } catch (error) {
    console.log("Failed to remove avatar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST logout (dummy)
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
