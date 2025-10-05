const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../config/crypto");

const AcademicRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  grades: [
    {
      assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
      grade: { type: String }, // Encrypted
    },
  ],
  attendance: [
    {
      date: { type: Date },
      status: { type: String, enum: ["present", "absent"] }, // Encrypted
    },
  ],
});

// Encrypt grade and attendance before saving
AcademicRecordSchema.pre("save", function (next) {
  if (this.isModified("grades")) {
    this.grades.forEach((g) => {
      if (g.grade) g.grade = encrypt(g.grade);
    });
  }
  if (this.isModified("attendance")) {
    this.attendance.forEach((a) => {
      if (a.status) a.status = encrypt(a.status);
    });
  }
  next();
});

// Decrypt after finding
AcademicRecordSchema.post("findOne", function (doc) {
  if (doc && doc.grades) {
    doc.grades.forEach((g) => {
      if (g.grade) g.grade = decrypt(g.grade);
    });
  }
  if (doc && doc.attendance) {
    doc.attendance.forEach((a) => {
      if (a.status) a.status = decrypt(a.status);
    });
  }
});

module.exports = mongoose.model("AcademicRecord", AcademicRecordSchema);
