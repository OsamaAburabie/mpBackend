const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    //get the JWT token from the header
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "Unauthorized" });
    //verifying if the token is valid
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(401).json({ msg: "Unauthorized" });

    //affer getting the id from the token send it back.
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
