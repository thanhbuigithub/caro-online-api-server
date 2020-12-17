const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("authorization");
  if (!token) res.status(401).send("You must to login first");

  try {
    const verifier = jwt.verify(token, process.env.SECRET_KEY);
    req.user = verifier;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

module.exports = verifyToken;
