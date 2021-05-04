const aws = require("aws-sdk");
const fs = require("fs");

const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Ads = require("../models/taskerAdsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.makeAd = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(400).json({ msg: "المستخدم غير موجود" });
    //checking if this user is an admin
    if (user.role != "tasker")
      return res.status(400).json({ msg: "you're not a tasker" });
    //================================
    const { title, desc, price, location } = req.body;

    const img = req.file;

    if (!title || !desc || !price || !location)
      return res.status(400).json({ msg: "الرجاء ادخل جميع الحقول " });

    if (!img) {
      const newAd = await Ads({
        title,
        desc,
        price,
        location,
        taskerInfo: {
          name: user.displayName,
          uid: user._id,
        },
        taskerId: user._id,
        catId: req.params.catId,
      });
      await newAd.save();
      res.json("تم ارسال اعلانك بنجاح");
    } else if (img) {
      //================================
      aws.config.setPromisesDependency();
      aws.config.update({
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
        region: process.env.REGION,
      });

      const s3 = new aws.S3();
      var params = {
        ACL: "public-read",
        Bucket: process.env.BUCKET_NAME,
        Body: fs.createReadStream(req.file.path),
        Key: `userAvatar/${req.file.originalname}`,
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
        }

        if (data) {
          fs.unlinkSync(req.file.path); // Empty temp folder
          const locationUrl = data.Location;

          const newAd = await Ads({
            title,
            desc,
            price,
            img: locationUrl,
            location,
            taskerId: user._id,
            taskerInfo: {
              name: user.displayName,
              uid: user._id,
            },
            catId: req.params.catId,
          });
          await newAd.save();
          res.json("تم ارسال اعلانك بنجاح");
        }
      });
    }
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.editAd = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(400).json({ msg: "المستخدم غير موجود" });
    //checking if this user is an admin
    if (user.role != "tasker")
      return res.status(400).json({ msg: "انت لست عامل" });
    const ad = await Ads.findById(req.params.postId);
    if (!ad) return res.status(400).json({ msg: "الاعلان غير موجود" });

    //================================
    const { title, desc, price, location } = req.body;

    const img = req.file;

    if (!title || !desc || !price || !location)
      return res.status(400).json({ msg: "الرجاء ادخل جميع الحقول " });

    if (!img) {
      await ad.updateOne({ title, desc, price, location });

      res.json("تم التعديل بنجاح");
    } else if (img) {
      //================================
      aws.config.setPromisesDependency();
      aws.config.update({
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
        region: process.env.REGION,
      });

      const s3 = new aws.S3();
      var params = {
        ACL: "public-read",
        Bucket: process.env.BUCKET_NAME,
        Body: fs.createReadStream(req.file.path),
        Key: `userAvatar/${req.file.originalname}`,
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
        }

        if (data) {
          fs.unlinkSync(req.file.path); // Empty temp folder
          const locationUrl = data.Location;

          await ad.updateOne({
            title,
            desc,
            price,
            location,
            img: locationUrl,
          });

          res.json("تم التعديل بنجاح");
        }
      });
    }
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
exports.deleteAd = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(400).json({ msg: "المستخدم غير موجود" });
    const ad = await Ads.findById(req.params.postId);
    if (!ad) return res.status(400).json({ msg: "الاعلان غير موجود" });

    //================================================================
    const taskerId = user._id.valueOf().toString();
    //================================================================
    if (ad.taskerId !== taskerId)
      return res.status(400).json({ msg: "هذا الاعلان ليس لك" });

    await Ads.findByIdAndDelete(req.params.postId);
    res.json("done");
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

//=========================================================================

exports.user_register = async function (req, res) {
  try {
    //destructuring the req body
    const { email, password, passwordCheck, displayName, isTasker } = req.body;

    const img = req.file;

    let role;
    if (parseInt(isTasker) === 1) {
      role = "customer";
    } else {
      role = "tasker";
    }
    //Validation
    if (!email || !password || !passwordCheck || !displayName)
      return res.status(400).json({ msg: "الرجاء ادخل الحقول المطلوبة" });

    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "كلمة المرور يجب ان تكون 5 خانات على الاقل" });

    if (password != passwordCheck)
      return res.status(400).json({ msg: "كلمه المرور غير مطابقه" });

    if (displayName.length < 3)
      return res.status(400).json({ msg: "اسمك يجب ان يكون 3 احرف على الاقل" });
    //email validation
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailVal = regex.test(email);
    if (emailVal === false)
      return res.status(400).json({ msg: "البريد غير صحيح" });

    //check for existing user with the same email
    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "خطأ: هناك حساب اخر بنفس البريد المدخل" });
    //hashing the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    if (!img) {
      const newUser = await User({
        email,
        password: passwordHash,
        displayName,
        role,
      });
      const user = await newUser.save();
      //login the user
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "10hr",
      });
      res.json({
        token,
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          img: user.img,
        },
      });
    } else if (img) {
      //================================
      aws.config.setPromisesDependency();
      aws.config.update({
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
        region: process.env.REGION,
      });

      const s3 = new aws.S3();
      var params = {
        ACL: "public-read",
        Bucket: process.env.BUCKET_NAME,
        Body: fs.createReadStream(req.file.path),
        Key: `userAvatar/${req.file.originalname}`,
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          console.log("Error occured while trying to upload to S3 bucket", err);
        }

        if (data) {
          fs.unlinkSync(req.file.path); // Empty temp folder
          const locationUrl = data.Location;

          const newUser = await User({
            email,
            password: passwordHash,
            displayName,
            img: locationUrl,
            role,
          });
          const user = await newUser.save();

          //login the user
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "10hr",
          });
          res.json({
            token,
            user: {
              id: user._id,
              displayName: user.displayName,
              email: user.email,
              role: user.role,
              img: user.img,
            },
          });
        }
      });
    }

    //saving the user in the database
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
