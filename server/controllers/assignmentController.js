const Assignment = require("../models/Assignment");
const multer = require("multer");
const path = require("path");

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  },
});

const upload = multer({ storage: storage });

exports.createAssignment = async (req, res) => {
  const { title, description } = req.body;
  try {
    const assignment = new Assignment({
      title,
      description,
      teacher: req.user.userId,
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAssignments = async (req, res) => {
  try {
    let query = {};
    // Only filter for teachers; students and admins see all assignments
    if (req.user.role === "teacher") {
      query.teacher = req.user.userId;
    }
    const assignments = await Assignment.find(query)
      .populate("teacher", "username")
      .populate("submissions.student", "username");
    res.json(assignments);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.submitAssignment = [
  upload.single("solution"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const assignment = await Assignment.findById(id);
      if (!assignment) {
        return res.status(404).send("Assignment not found");
      }

      const submission = {
        student: req.user.userId,
        file: req.file.path,
      };

      assignment.submissions.push(submission);
      await assignment.save();
      res.send("Assignment submitted successfully");
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
];

exports.gradeAssignment = async (req, res) => {
  const { submissionId, grade } = req.body;
  const { id } = req.params;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).send("Assignment not found");
    }

    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).send("Submission not found");
    }

    submission.grade = grade;
    await assignment.save();

    // Also update AcademicRecord
    const AcademicRecord = require("../models/AcademicRecord");
    let academicRecord = await AcademicRecord.findOne({
      student: submission.student,
    });
    if (academicRecord) {
      const gradeRecord = academicRecord.grades.find((g) =>
        g.assignment.equals(id)
      );
      if (gradeRecord) {
        gradeRecord.grade = grade;
      } else {
        academicRecord.grades.push({ assignment: id, grade });
      }
      await academicRecord.save();
    } else {
      const newRecord = new AcademicRecord({
        student: submission.student,
        grades: [{ assignment: id, grade }],
      });
      await newRecord.save();
    }

    res.send("Grade assigned");
  } catch (error) {
    res.status(500).send(error.message);
  }
};
