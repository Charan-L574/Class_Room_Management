const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, role, rollno } = req.body;
  try {
    const userData = { username, password, role };

    if (role === "student") {
      if (!rollno) {
        return res.status(400).send("Roll number is required for students.");
      }
      const existingRollNo = await User.findOne({ rollno });
      if (existingRollNo) {
        return res.status(400).send("Roll number is already in use.");
      }
      userData.rollno = rollno;
    }

    const user = new User(userData);
    await user.save();
    res.status(201).send("User registered");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send("Username or Roll Number is already taken.");
    }
    res.status(400).send(error.message);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body; // "username" can be username or rollno
  try {
    const user = await User.findOne({
      $or: [{ username: username }, { rollno: username }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
