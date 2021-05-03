const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");

const {
  makeAd,
  user_register,
  editAd,
  deleteAd,
} = require("../controllers/userUpController");

router
  .route("/newpost/:catId")
  .post(
    multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
      "img"
    ),
    auth,
    makeAd
  );
router
  .route("/editPost/:postId")
  .put(
    multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
      "img"
    ),
    auth,
    editAd
  );
router.route("/deletePost/:postId").delete(auth, deleteAd);

router
  .route("/register")
  .post(
    multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
      "img"
    ),
    user_register
  );

module.exports = router;
