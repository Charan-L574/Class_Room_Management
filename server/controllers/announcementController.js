const Announcement = require("../models/Announcement");

exports.createAnnouncement = async (req, res) => {
  const { text } = req.body;
  try {
    const announcement = new Announcement({ text, teacher: req.user.userId });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ date: -1 })
      .populate("teacher", "username");
    res.json(announcements);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
