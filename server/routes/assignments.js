const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware.isTeacher,
  assignmentController.createAssignment
);
router.get("/", authMiddleware.isLoggedIn, assignmentController.getAssignments);
router.post(
  "/:id/submit",
  authMiddleware.isStudent,
  assignmentController.submitAssignment
);
router.post(
  "/:id/grade",
  authMiddleware.isTeacher,
  assignmentController.gradeAssignment
);

module.exports = router;
