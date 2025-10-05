const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
