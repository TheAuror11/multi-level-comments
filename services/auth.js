const jwt = require("jsonwebtoken");

const generateToken = (userData) => {
  // Generate a new JWT token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });
};

const verifyToken = (token) => {
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  return decode;
};

module.exports = { generateToken, verifyToken };
