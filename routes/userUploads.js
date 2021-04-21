const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");

const { makeAd } = require("../controllers/userUpController");

router
  .route("/newpost/:catId")
  .post(
    multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
      "img"
    ),
    auth,
    makeAd
  );

module.exports = router;
