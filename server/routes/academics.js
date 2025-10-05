const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const { isStudent } = require("../middleware/authMiddleware");

// @route   GET api/academics/my-records
// @desc    Get my academic records
// @access  Student
router.get("/my-records", isStudent, academicController.getMyRecords);

module.exports = router;
