const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      file: { type: String }, // Path to uploaded file
      grade: { type: String },
    },
  ],
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
