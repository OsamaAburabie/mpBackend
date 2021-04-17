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
    const { name, picture } = req.body;
    //================================

    const newCat = await Category({
      name,
      picture,
    });
    const category = await newCat.save();

    res.json(category);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
