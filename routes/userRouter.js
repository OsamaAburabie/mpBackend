const router = require("express").Router();
const auth = require("../middleware/auth");
const connection = require("../middleware/connection");

//================================================================
const {
  user_register,
  user_login,
  delete_user_account,
} = require("../controllers/authController");
//================================================================
const {
  get_tasker_tasks_by_customer,
  add_connection,
  add_commnet,
  add_task,
  get_all_from_category,
  get_all_categories,
  get_single_ad,
  rate,
  get_tasker_info,
} = require("../controllers/customerController");
//================================================================
const {
  get_all_tasks_for_tasker,
  delete_specific_task,
  accept_connection,
  reject_connection,
  send_message,
  makeAd,
} = require("../controllers/taskerController");
//================================================================

//@@ All the handlers are in the controllers folder
router.post("/register", user_register);
router.post("/login", user_login);
router.delete("/delete", auth, delete_user_account);
//================================================================================= customer handlers
router.post("/addTickets/:taskerId", auth, connection, add_task);
router.post("/addConnection/:taskerId", auth, add_connection);
router.get(
  "/getTaskerTodos/:taskerId",
  auth,
  connection,
  get_tasker_tasks_by_customer
);
router.get("/getallfromCategory/:catId", get_all_from_category);
router.get("/getallCategories", get_all_categories);
router.get("/getSingleAd/:adsId", get_single_ad);
router.post("/addComment/:adsId", auth, add_commnet);
router.post("/rate/:taskerId", auth, connection, rate);
router.get("/taskerInfo/:taskerId", get_tasker_info);
//================================================================================= tasker handlers
router.post("/acceptConnection", auth, accept_connection);
router.post("/rejectConnection", auth, reject_connection);
router.get("/myTasks", auth, get_all_tasks_for_tasker);
router.delete("/myTasks/:id", auth, delete_specific_task);
router.post("/newAd/:catId", auth, makeAd);
//================================================================================= global handlers
router.post("/sendMessage/:id", auth, connection, send_message);

module.exports = router;
