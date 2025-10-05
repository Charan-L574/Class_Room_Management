const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware.isTeacher,
  announcementController.createAnnouncement
);
router.get(
  "/",
  authMiddleware.isLoggedIn,
  announcementController.getAnnouncements
);

module.exports = router;
