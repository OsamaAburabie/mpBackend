const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const aws = require("aws-sdk");
const fs = require("fs");
// exports.add__category = async function (req, res) {
//   try {
//     const user = await User.findById(req.user);
//     //checking if this user is an admin
//     if (user.role != "admin")
//       return res.status(400).json({ msg: "Unauthorized" });
//     //================================
//     const { name, picture, min, high } = req.body;
//     //================================
//     if (!name || !picture || !min || !high)
//       return res.status(400).json({ msg: "all feilds are required" });

//     const newCat = await Category({
//       name,
//       picture,
//       min,
//       high,
//     });
//     const category = await newCat.save();

//     res.json(category);
//   } catch (err) {
//     res.status(404).json({ msg: err.message });
//   }
// };

exports.add__category = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //================================
    const { name, min, high } = req.body;
    const img = req.file;
    //================================
    if (!name || !min || !high || !img)
      return res.status(400).json({ msg: "all feilds are required" });

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

        const newCat = await Category({
          name,
          picture: locationUrl,
          min,
          high,
        });
        const category = await newCat.save();

        res.json(category);
      }
    });
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.edit__category = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //================================
    const { name, min, high } = req.body;
    const img = req.file;
    //================================
    if (!name || !min || !high)
      return res.status(400).json({ msg: "all feilds are required" });

    const category = await Category.findOne({
      _id: req.params.catId,
    });

    if (!img) {
      await category.updateOne({ name, min, high });

      const updated = await Category.findOne({
        _id: req.params.catId,
      });

      res.json(updated);
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

          await category.updateOne({ name, min, high, picture: locationUrl });

          const updated = await Category.findOne({
            _id: req.params.catId,
          });

          res.json(updated);
        }
      });
    }
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.single_category = async function (req, res) {
  try {
    const category = await Category.findOne({
      _id: req.params.catId,
    });

    res.json(category);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
