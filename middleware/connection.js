const User = require("../models/userModel");

const connection = async (req, res, next) => {
  try {
    const tasker = await User.findById(req.params.taskerId);
    //validation
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    //check if there is a connection
    const found = tasker.connections.find((el) => el.uid === req.user);
    if (!found) return res.status(400).json({ msg: "you have no connection" });

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = connection;
