const jwt = require("jsonwebtoken");

const generateSign = (id, username, role) => {
  return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
const generateTempToken = (id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })
}
module.exports = { generateSign, verifyJwt, generateTempToken };
