const User = require("../models/userModel");

exports.get_all_admins_by_super_admim = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "super admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //if the user is an admin return back all the tickets
    const admins = await User.find({ role: "admin" });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.change_role_by_super_admin = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "super admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //if the user is an admin they can edit ticket status
    const admin = await User.findOne({
      _id: req.params.id,
    });
    if (!admin) return res.status(400).json({ msg: "admin not found" });
    await admin.updateOne({ role: req.body.role });
    const updated = await User.findOne({
      _id: req.params.id,
    });
    res.json(updated.role);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};
