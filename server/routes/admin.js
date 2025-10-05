const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middleware/authMiddleware");

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get("/users", isAdmin, adminController.getAllUsers);

// @route   PUT api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put("/users/:id/role", isAdmin, adminController.updateUserRole);

module.exports = router;
