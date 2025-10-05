const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};

const isTeacher = (req, res, next) => {
  isLoggedIn(req, res, () => {
    if (req.user.role !== "teacher") {
      return res.status(403).send("Access denied. Not a teacher.");
    }
    next();
  });
};

const isStudent = (req, res, next) => {
  isLoggedIn(req, res, () => {
    if (req.user.role !== "student") {
      return res.status(403).send("Access denied. Not a student.");
    }
    next();
  });
};

const isAdmin = (req, res, next) => {
  isLoggedIn(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied. Not an admin.");
    }
    next();
  });
};

module.exports = { isLoggedIn, isTeacher, isStudent, isAdmin };
