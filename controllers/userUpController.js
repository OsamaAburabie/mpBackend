const aws = require("aws-sdk");
const fs = require("fs");

const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Ads = require("../models/taskerAdsModel");

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
