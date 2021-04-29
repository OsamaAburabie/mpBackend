const router = require("express").Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

router.post("/isLoggedIn", async (req, res) => {
  try {
    //get the token frim the request header
    const token = req.header("x-auth-token");
    if (!token) return res.json({ valid: false });

    const verified = jwt.verify(token, process.env.JWT_SECRET); // this is goint to return the decoded token
    if (!verified) return res.json({ valid: false });

    const user = await User.findById(verified.id); // find the user with id
    if (!user) return res.json({ valid: false });

    if (user.active === false) return res.json({ valid: false }); // check if this user is banned

    //check if the token is expired
    const expDate = verified.exp;
    if (Date.now() >= expDate * 1000) return res.json({ valid: false });

    return res.json({
      valid: true,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      img: user.img,
      pendingConnections: user.pendingConnections,
      connections: user.connections,
      notifications: user.notification,
      id: user._id,
    });
  } catch (err) {
    return res.json({ valid: false });
  }
});

module.exports = router;
