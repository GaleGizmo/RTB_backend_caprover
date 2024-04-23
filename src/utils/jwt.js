const jwt = require("jsonwebtoken");

const generateSign = (id, username, role) => {
  return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

const verifyJwt = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        reject(err);
      } else {
        resolve(decodedToken);
      }
    });
  });
};

const generateTempToken = (id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })
}
module.exports = { generateSign, verifyJwt, generateTempToken };
