const AcademicRecord = require("../models/AcademicRecord");

// @desc    Get my academic records
exports.getMyRecords = async (req, res) => {
  try {
    const records = await AcademicRecord.findOne({
      student: req.user.userId,
    }).populate("grades.assignment", "title");

    if (!records) {
      return res.json({ grades: [], attendance: [] });
    }

    res.json(records);
  } catch (error) {
    res.status(500).send("Server error");
  }
};
