const User = require("../models/User");

// @desc    Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// @desc    Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.role = role;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
};
