const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");

exports.add__category = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //================================
    const { name, picture, min, high } = req.body;
    //================================
    if (!name || !picture || !min || !high)
      return res.status(400).json({ msg: "all feilds are required" });

    const newCat = await Category({
      name,
      picture,
      min,
      high,
    });
    const category = await newCat.save();

    res.json(category);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
