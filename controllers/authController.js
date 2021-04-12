const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.user_register = async function (req, res) {
  try {
    //destructuring the req body
    const { email, password, passwordCheck, displayName } = req.body;

    //Validation
    if (!email || !password || !passwordCheck || !displayName)
      return res.status(400).json({ msg: "All fields are required" });

    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password must be at least 5 characters long" });

    if (password != passwordCheck)
      return res.status(400).json({ msg: "The passwords should match" });

    if (displayName.length < 3)
      return res
        .status(400)
        .json({ msg: "The display name must be at least 3 characters long" });
    //email validation
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailVal = regex.test(email);
    if (emailVal === false)
      return res.status(400).json({ msg: "The email is not valid" });

    //check for existing user with the same email
    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "An account with the same email already exists" });
    //hashing the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //saving the user in the database
    const newUser = await User({
      email,
      password: passwordHash,
      displayName,
    });
    const user = await newUser.save();

    //login the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1hr",
    });
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.user_login = async function (req, res) {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password)
      return res.status(400).json({ msg: "All fields are required" });
    //check if the user exists
    const user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered" });

    //comparing the hashed password with the entered one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(403).json({ msg: "Wrong Email or Password" });

    if (user.active === false)
      return res.status(400).json({ msg: "This account has been banned" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1hr",
    });
    res.json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.admin_register = async function (req, res) {
  try {
    const checkuser = await User.findById(req.user);
    //checking if this user is an admin
    if (checkuser.role != "admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //destructuring the req body
    const { email, password, passwordCheck, displayName } = req.body;

    //Validation
    if (!email || !password || !passwordCheck || !displayName)
      return res.status(400).json({ msg: "All fields are required" });

    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password must be at least 5 characters long" });

    if (password != passwordCheck)
      return res.status(400).json({ msg: "The passwords should match" });

    if (displayName.length < 3)
      return res
        .status(400)
        .json({ msg: "The display name must be at least 3 characters long" });

    //email validation
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailVal = regex.test(email);
    if (emailVal === false)
      return res.status(400).json({ msg: "The email is not valid" });

    //check for existing user with the same email
    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "An account with the same email already exists" });
    //hashing the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    //saving the user in the database
    const newUser = await User({
      email,
      password: passwordHash,
      displayName,
      role: "admin",
    });
    const user = await newUser.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_user_account = async (req, res) => {
  try {
    //get the user
    const user = await User.findById(req.user);
    if (!user)
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered" });

    //request the password to confirm deletetion
    const { password } = req.body;
    if (!password) return res.status(400).json({ msg: "invalid password" });

    //compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "invalid password" });

    //deleting the user
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
